import type { Category, Priority } from './types'
import { addDays, atMinutes, startOfDay } from './dates'
import { uid } from './id'

export interface ParsedTask {
  id: string
  title: string
  category: Category
  priority: Priority
  durationMin: number
  /** ISO cuando la frase trae día y hora. */
  scheduledAt: string | null
  /** ISO cuando la frase trae fecha límite o solo un día. */
  deadline: string | null
  /** Fragmento original del que salió la tarea. */
  raw: string
}

/** Quita acentos sin cambiar la longitud del texto, para poder mapear índices. */
function normalize(text: string): string {
  const from = 'áàäâéèëêíìïîóòöôúùüûñÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑ'
  const to = 'aaaaeeeeiiiioooouuuunAAAAEEEEIIIIOOOOUUUUN'
  let result = ''
  for (const char of text.toLowerCase()) {
    const index = from.indexOf(char)
    result += index >= 0 ? to[index] : char
  }
  return result
}

const WEEKDAYS: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
}

const MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
}

const NUMBER_WORDS: Record<string, number> = {
  una: 1,
  uno: 1,
  un: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
}

const CATEGORY_KEYWORDS: Array<[Category, string[]]> = [
  [
    'escuela',
    [
      'examen',
      'tarea',
      'clase',
      'reporte',
      'practica',
      'ensayo',
      'materia',
      'escuela',
      'universidad',
      'calculo',
      'fisica',
      'quimica',
      'etica',
      'diapositivas',
      'exposicion',
      'tesis',
      'estudiar',
      'apuntes',
      'maestro',
      'profesor',
    ],
  ],
  [
    'trabajo',
    [
      'junta',
      'cliente',
      'turno',
      'trabajo',
      'jefe',
      'oficina',
      'reunion',
      'propuesta',
      'entrevista',
      'chamba',
      'nomina',
    ],
  ],
  [
    'salud',
    ['dentista', 'doctor', 'doctora', 'medico', 'cita', 'consulta', 'analisis', 'terapia', 'psicologo', 'vacuna'],
  ],
  [
    'deporte',
    ['entrenamiento', 'entrenar', 'gimnasio', 'correr', 'natacion', 'futbol', 'bici', 'yoga', 'partido', 'rutina'],
  ],
]

const DURATION_BY_VERB: Array<[string, number]> = [
  ['estudiar', 120],
  ['examen', 120],
  ['entrenamiento', 90],
  ['entrenar', 90],
  ['gimnasio', 90],
  ['natacion', 90],
  ['correr', 60],
  ['terminar', 90],
  ['escribir', 90],
  ['preparar', 60],
  ['revisar', 60],
  ['leer', 60],
  ['junta', 60],
  ['reunion', 60],
  ['cita', 60],
  ['dentista', 60],
  ['doctor', 60],
  ['medico', 60],
  ['renovar', 60],
  ['comprar', 60],
  ['despensa', 60],
  ['entregar', 45],
  ['limpiar', 45],
  ['cocinar', 45],
  ['pagar', 20],
  ['llamar', 15],
  ['hablar', 15],
]

const HIGH_PRIORITY = /\burgente\b|\btengo que\b|\bhay que\b|\bsin falta\b|\bimportante\b|\bno puedo faltar\b/
const LOW_PRIORITY = /\bcuando pueda\b|\balgun dia\b|\bsin prisa\b|\bsi me da tiempo\b/
const DEADLINE_PREFIX = /^(del|de la|para el|para la|para|antes del|antes de)$/

interface Span {
  start: number
  end: number
}

class Fragment {
  readonly raw: string
  /** Normalizado completo, para detectar palabras clave. */
  readonly norm: string
  /** Normalizado con los tramos ya interpretados en blanco. */
  private work: string
  private spans: Span[] = []

  constructor(raw: string) {
    this.raw = raw.trim()
    this.norm = normalize(this.raw)
    this.work = this.norm
  }

  consume(match: RegExpMatchArray): void {
    if (match.index === undefined) return
    const start = match.index
    const end = start + match[0].length
    this.spans.push({ start, end })
    this.work =
      this.work.slice(0, start) + ' '.repeat(end - start) + this.work.slice(end)
  }

  /** Texto original sin los tramos ya interpretados. */
  rest(): string {
    if (this.spans.length === 0) return this.raw
    const chars = this.raw.split('')
    for (const span of this.spans) {
      for (let index = span.start; index < span.end; index += 1) chars[index] = ' '
    }
    return chars.join('').replace(/\s+/g, ' ').trim()
  }

  find(pattern: RegExp): RegExpMatchArray | null {
    const match = this.work.match(pattern)
    return match && match.index !== undefined ? match : null
  }
}

function nextWeekday(from: Date, weekday: number, allowToday: boolean): Date {
  const base = startOfDay(from)
  const diff = (weekday - base.getDay() + 7) % 7
  if (diff === 0 && !allowToday) return addDays(base, 7)
  return addDays(base, diff)
}

interface DayResult {
  date: Date
  isDeadline: boolean
}

function extractDay(fragment: Fragment, now: Date): DayResult | null {
  const today = startOfDay(now)

  const pastTomorrow = fragment.find(/\bpasado manana\b/)
  if (pastTomorrow) {
    fragment.consume(pastTomorrow)
    return { date: addDays(today, 2), isDeadline: false }
  }

  const tomorrow = fragment.find(/\bmanana\b/)
  if (tomorrow) {
    fragment.consume(tomorrow)
    return { date: addDays(today, 1), isDeadline: false }
  }

  const todayMatch = fragment.find(/\bhoy\b/)
  if (todayMatch) {
    fragment.consume(todayMatch)
    return { date: today, isDeadline: false }
  }

  const nextWeek = fragment.find(/\b(la proxima semana|la semana que entra|la otra semana)\b/)
  if (nextWeek) {
    fragment.consume(nextWeek)
    return { date: nextWeekday(addDays(today, 1), 1, true), isDeadline: false }
  }

  const explicitDate = fragment.find(
    /\b(?:(del|para el|antes del|el|este|proximo)\s+)?(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/,
  )
  if (explicitDate) {
    fragment.consume(explicitDate)
    const day = Number(explicitDate[2])
    const month = MONTHS[explicitDate[3]]
    let date = new Date(today.getFullYear(), month, day)
    if (date.getTime() < today.getTime()) date = new Date(today.getFullYear() + 1, month, day)
    return { date, isDeadline: DEADLINE_PREFIX.test(explicitDate[1] ?? '') }
  }

  const weekdayMatch = fragment.find(
    /\b(?:(del|de la|para el|para la|para|antes del|antes de|el|este|proximo|la proxima)\s+)?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/,
  )
  if (weekdayMatch) {
    fragment.consume(weekdayMatch)
    const isDeadline = DEADLINE_PREFIX.test(weekdayMatch[1] ?? '')
    return {
      date: nextWeekday(today, WEEKDAYS[weekdayMatch[2]], true),
      isDeadline,
    }
  }

  const inDays = fragment.find(/\ben (\d+) dias?\b/)
  if (inDays) {
    fragment.consume(inDays)
    return { date: addDays(today, Number(inDays[1])), isDeadline: false }
  }

  return null
}

function extractTime(fragment: Fragment): number | null {
  const digits = fragment.find(
    /\ba la(?:s)? (\d{1,2})(?::(\d{2}))?\s*(?:(?:de|por|en) la (manana|tarde|noche)|(am|pm))?/,
  )
  if (digits) {
    fragment.consume(digits)
    return resolveHour(Number(digits[1]), Number(digits[2] ?? 0), digits[3] ?? digits[4])
  }

  const words = fragment.find(
    /\ba la(?:s)? (una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?: y (media|cuarto))?\s*(?:(?:de|por|en) la (manana|tarde|noche))?/,
  )
  if (words) {
    fragment.consume(words)
    const minutes = words[2] === 'media' ? 30 : words[2] === 'cuarto' ? 15 : 0
    return resolveHour(NUMBER_WORDS[words[1]], minutes, words[3])
  }

  const noon = fragment.find(/\bal mediodia\b/)
  if (noon) {
    fragment.consume(noon)
    return 12 * 60
  }

  const vague = fragment.find(/\b(?:por|en|de) la (manana|tarde|noche)\b/)
  if (vague) {
    fragment.consume(vague)
    if (vague[1] === 'manana') return 9 * 60
    if (vague[1] === 'tarde') return 16 * 60
    return 20 * 60
  }

  return null
}

function resolveHour(hour: number, minutes: number, meridiem?: string): number {
  let value = hour % 24
  if (meridiem === 'tarde' || meridiem === 'noche' || meridiem === 'pm') {
    if (value < 12) value += 12
  } else if (meridiem === 'manana' || meridiem === 'am') {
    if (value === 12) value = 0
  } else if (value >= 1 && value <= 7) {
    // "a las cinco" sin más contexto es la tarde.
    value += 12
  }
  return value * 60 + minutes
}

function extractDuration(fragment: Fragment): number | null {
  const halfHour = fragment.find(/\bmedia hora\b/)
  if (halfHour) {
    fragment.consume(halfHour)
    return 30
  }

  const quarter = fragment.find(/\bun cuarto de hora\b/)
  if (quarter) {
    fragment.consume(quarter)
    return 15
  }

  const wordAndHalf = fragment.find(
    /\b(una|un|dos|tres|cuatro|cinco|seis)\s+horas?\s+y\s+media\b/,
  )
  if (wordAndHalf) {
    fragment.consume(wordAndHalf)
    return NUMBER_WORDS[wordAndHalf[1]] * 60 + 30
  }

  const digitAndHalf = fragment.find(/\b(\d+)\s*horas?\s+y\s+media\b/)
  if (digitAndHalf) {
    fragment.consume(digitAndHalf)
    return Number(digitAndHalf[1]) * 60 + 30
  }

  const hourAndHalf = fragment.find(/\b(?:una\s+)?hora y media\b/)
  if (hourAndHalf) {
    fragment.consume(hourAndHalf)
    return 90
  }

  const digitHours = fragment.find(/\b(\d+(?:[.,]\d+)?)\s*(?:h\b|hrs?\b|horas?\b)/)
  if (digitHours) {
    fragment.consume(digitHours)
    return Math.round(Number(digitHours[1].replace(',', '.')) * 60)
  }

  const wordHours = fragment.find(
    /\b(una|un|dos|tres|cuatro|cinco|seis|siete|ocho)\s+horas?\b/,
  )
  if (wordHours) {
    fragment.consume(wordHours)
    return NUMBER_WORDS[wordHours[1]] * 60
  }

  const minutes = fragment.find(/\b(\d+)\s*(?:min\b|mins\b|minutos?\b)/)
  if (minutes) {
    fragment.consume(minutes)
    return Number(minutes[1])
  }

  const wordMinutes = fragment.find(
    /\b(diez|quince|veinte|treinta|cuarenta|cuarenta y cinco|sesenta)\s+minutos?\b/,
  )
  if (wordMinutes) {
    fragment.consume(wordMinutes)
    const table: Record<string, number> = {
      diez: 10,
      quince: 15,
      veinte: 20,
      treinta: 30,
      cuarenta: 40,
      'cuarenta y cinco': 45,
      sesenta: 60,
    }
    return table[wordMinutes[1]]
  }

  return null
}

function detectCategory(norm: string): Category {
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((word) => norm.includes(word))) return category
  }
  return 'personal'
}

function estimateDuration(norm: string): number {
  for (const [word, minutes] of DURATION_BY_VERB) {
    if (norm.includes(word)) return minutes
  }
  return 30
}

function detectPriority(norm: string, deadline: Date | null, now: Date): Priority {
  if (HIGH_PRIORITY.test(norm)) return 'alta'
  if (LOW_PRIORITY.test(norm)) return 'baja'
  if (deadline) {
    const hours = (deadline.getTime() - now.getTime()) / 3600000
    if (hours <= 48) return 'alta'
  }
  return 'media'
}

const FILLERS = [
  /^tengo que\s+/i,
  /^tengo\s+/i,
  /^necesito\s+/i,
  /^quiero\s+/i,
  /^debo\s+/i,
  /^hay que\s+/i,
  /^me toca\s+/i,
  /^recuerdame que\s+/i,
  /^recuerdame\s+/i,
  /^acuerdame de\s+/i,
  /^no olvidar\s+/i,
  /^que\s+/i,
  /^de\s+/i,
  /^y\s+/i,
]

function cleanTitle(text: string): string {
  let title = text.replace(/\s+/g, ' ').trim()

  title = title
    .replace(/^voy al\b/i, 'ir al')
    .replace(/^voy a la\b/i, 'ir a la')
    .replace(/^voy a\b/i, 'ir a')
    .replace(/^ire al\b/i, 'ir al')

  let changed = true
  while (changed) {
    changed = false
    for (const filler of FILLERS) {
      const next = title.replace(filler, '')
      if (next !== title) {
        title = next.trim()
        changed = true
      }
    }
  }

  title = title.replace(/[\s,;.]+$/, '').trim()
  if (title.length === 0) return 'Tarea nueva'
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function splitFragments(text: string): string[] {
  const pieces = text
    .split(/\s*[,;]\s*|\s+y\s+|\s+tambien\s+|\s+también\s+|\s+ademas\s+|\s+además\s+/i)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0)

  const merged: string[] = []
  for (const piece of pieces) {
    const words = piece.split(/\s+/).length
    if (words < 2 && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} y ${piece}`
      continue
    }
    merged.push(piece)
  }
  return merged
}

/**
 * Intérprete determinista: convierte una frase en español en tareas estructuradas.
 * No llama a ningún servicio externo.
 */
export function parsePhrase(text: string, now: Date = new Date()): ParsedTask[] {
  const clean = text.trim()
  if (clean.length === 0) return []

  return splitFragments(clean).map((raw) => {
    const fragment = new Fragment(raw)
    const time = extractTime(fragment)
    const day = extractDay(fragment, now)
    const duration = extractDuration(fragment)
    const norm = fragment.norm

    const durationMin = duration ?? estimateDuration(norm)

    let scheduledAt: Date | null = null
    let deadline: Date | null = null

    if (day) {
      if (day.isDeadline) {
        deadline = atMinutes(day.date, time ?? 23 * 60 + 59)
      } else if (time !== null) {
        let candidate = atMinutes(day.date, time)
        if (candidate.getTime() < now.getTime()) candidate = addDays(candidate, 7)
        scheduledAt = candidate
        deadline = atMinutes(candidate, 23 * 60 + 59)
      } else {
        deadline = atMinutes(day.date, 23 * 60 + 59)
      }
    } else if (time !== null) {
      let candidate = atMinutes(now, time)
      if (candidate.getTime() < now.getTime()) candidate = addDays(candidate, 1)
      scheduledAt = candidate
      deadline = atMinutes(candidate, 23 * 60 + 59)
    }

    return {
      id: uid('parsed'),
      title: cleanTitle(fragment.rest()),
      category: detectCategory(norm),
      priority: detectPriority(norm, deadline, now),
      durationMin,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
      deadline: deadline ? deadline.toISOString() : null,
      raw,
    }
  })
}
