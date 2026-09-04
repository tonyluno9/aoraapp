import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'

export const WEEK_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const DAY_INITIAL: Record<number, string> = {
  0: 'D',
  1: 'L',
  2: 'M',
  3: 'M',
  4: 'J',
  5: 'V',
  6: 'S',
}

export const DAY_NAME: Record<number, string> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábado',
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value
}

/** "Viernes 4 de septiembre" */
export function formatLongDate(value: string | Date): string {
  return capitalize(format(toDate(value), "EEEE d 'de' MMMM", { locale: es }))
}

/** "vie 4" */
export function formatShortDay(value: string | Date): string {
  return format(toDate(value), 'EEE d', { locale: es })
}

/** "17:00" */
export function formatTime(value: string | Date): string {
  return format(toDate(value), 'HH:mm')
}

export function dayKey(value: string | Date): string {
  return format(toDate(value), 'yyyy-MM-dd')
}

/** "hoy", "mañana", "ayer", "hace 2 días", "el martes", "en 9 días" */
export function formatRelativeDay(value: string | Date, now: Date = new Date()): string {
  const date = toDate(value)
  const diff = differenceInCalendarDays(date, now)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'mañana'
  if (diff === 2) return 'pasado mañana'
  if (diff === -1) return 'ayer'
  if (diff < -1 && diff >= -7) return `hace ${Math.abs(diff)} días`
  if (diff > 2 && diff <= 7) return `el ${DAY_NAME[date.getDay()]}`
  if (diff > 7) return `en ${diff} días`
  return format(date, "d 'de' MMMM", { locale: es })
}

/** "5 h 20 min", "45 min", "2 h" */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

export function minutesToClock(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(minutes)))
  const hours = Math.floor(clamped / 60)
  const rest = clamped % 60
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export function minutesOfDay(value: string | Date): number {
  const date = toDate(value)
  return date.getHours() * 60 + date.getMinutes()
}

/** Construye una fecha con los minutos indicados desde medianoche. */
export function atMinutes(day: Date, minutes: number): Date {
  const base = startOfDay(day)
  base.setMinutes(minutes)
  return base
}

export function weekStart(value: string | Date): Date {
  return startOfWeek(toDate(value), { weekStartsOn: 1 })
}

export function weekDates(value: string | Date): Date[] {
  const start = weekStart(value)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function isSameDate(a: string | Date, b: string | Date): boolean {
  return isSameDay(toDate(a), toDate(b))
}

/** "Buenos días" según la hora. */
export function greeting(now: Date = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function roundToQuarter(minutes: number): number {
  return Math.round(minutes / 15) * 15
}

export { addDays, startOfDay, differenceInCalendarDays }
