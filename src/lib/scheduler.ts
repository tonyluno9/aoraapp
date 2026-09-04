import type { Availability, Task } from './types'
import {
  DAY_NAME,
  addDays,
  atMinutes,
  differenceInCalendarDays,
  formatDuration,
  isSameDate,
  minutesOfDay,
  minutesToClock,
  startOfDay,
  toDate,
} from './dates'

/** Holgura mínima entre dos tareas, en minutos. */
export const GAP_MIN = 10
/** Todo se acomoda en bloques de 15 minutos. */
export const BLOCK_MIN = 15

export interface Slot {
  startMin: number
  endMin: number
}

export interface Placement {
  taskId: string
  scheduledAt: string
  explanation: string
}

export interface Conflict {
  taskId: string
  reason: string
}

export interface ScheduleResult {
  placements: Placement[]
  conflicts: Conflict[]
}

function subtract(slots: Slot[], busy: Slot): Slot[] {
  const result: Slot[] = []
  for (const slot of slots) {
    if (busy.endMin <= slot.startMin || busy.startMin >= slot.endMin) {
      result.push(slot)
      continue
    }
    if (busy.startMin > slot.startMin) {
      result.push({ startMin: slot.startMin, endMin: busy.startMin })
    }
    if (busy.endMin < slot.endMin) {
      result.push({ startMin: busy.endMin, endMin: slot.endMin })
    }
  }
  return result.filter((slot) => slot.endMin - slot.startMin > 0)
}

/** Huecos libres del día: disponibilidad menos bloques fijos menos tareas ya programadas. */
export function freeSlotsForDay(
  day: string | Date,
  tasks: Task[],
  availability: Availability,
): Slot[] {
  const date = toDate(day)
  const weekday = date.getDay()
  if (!availability.days.includes(weekday)) return []

  let slots: Slot[] = [{ startMin: availability.startMin, endMin: availability.endMin }]

  for (const block of availability.fixedBlocks) {
    if (!block.days.includes(weekday)) continue
    slots = subtract(slots, { startMin: block.startMin, endMin: block.endMin })
  }

  for (const task of tasks) {
    if (!task.scheduledAt || task.status === 'completada') continue
    if (!isSameDate(task.scheduledAt, date)) continue
    const start = minutesOfDay(task.scheduledAt)
    slots = subtract(slots, {
      startMin: start - GAP_MIN,
      endMin: start + task.durationMin + GAP_MIN,
    })
  }

  return slots
}

function ceilToBlock(minutes: number): number {
  return Math.ceil(minutes / BLOCK_MIN) * BLOCK_MIN
}

const PRIORITY_WEIGHT: Record<Task['priority'], number> = { alta: 0, media: 1, baja: 2 }

function sortForScheduling(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const deadlineA = a.deadline ? toDate(a.deadline).getTime() : Number.POSITIVE_INFINITY
    const deadlineB = b.deadline ? toDate(b.deadline).getTime() : Number.POSITIVE_INFINITY
    if (deadlineA !== deadlineB) return deadlineA - deadlineB
    return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]
  })
}

function dayWord(date: Date, now: Date): string {
  const diff = differenceInCalendarDays(date, now)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'mañana'
  return `el ${DAY_NAME[date.getDay()]}`
}

/**
 * Acomoda tareas sin agendar en el primer hueco que las contenga completas.
 * Devuelve además la explicación de cada decisión.
 */
export function scheduleTasks(
  toPlace: Task[],
  existing: Task[],
  availability: Availability,
  from: Date = new Date(),
  horizonDays = 21,
): ScheduleResult {
  const placements: Placement[] = []
  const conflicts: Conflict[] = []
  const busy: Task[] = existing.filter((task) => task.scheduledAt && task.status !== 'completada')

  for (const task of sortForScheduling(toPlace)) {
    const deadline = task.deadline ? toDate(task.deadline) : null
    let placed = false

    for (let offset = 0; offset <= horizonDays && !placed; offset += 1) {
      const day = addDays(startOfDay(from), offset)
      if (deadline && differenceInCalendarDays(day, deadline) > 0) break

      const earliest =
        offset === 0 ? ceilToBlock(minutesOfDay(from) + GAP_MIN) : Number.NEGATIVE_INFINITY

      for (const slot of freeSlotsForDay(day, busy, availability)) {
        const start = Math.max(ceilToBlock(slot.startMin), earliest === -Infinity ? 0 : earliest)
        const end = start + task.durationMin
        if (end > slot.endMin) continue
        if (deadline && isSameDate(day, deadline) && end > minutesOfDay(deadline)) continue

        const scheduledAt = atMinutes(day, start)
        const reason = deadline
          ? `es el primer hueco de ${formatDuration(task.durationMin)} antes de tu fecha límite`
          : `es el primer hueco de ${formatDuration(task.durationMin)} en tu semana`

        placements.push({
          taskId: task.id,
          scheduledAt: scheduledAt.toISOString(),
          explanation: `Colocada ${dayWord(day, from)} a las ${minutesToClock(start)} porque ${reason}.`,
        })

        busy.push({ ...task, scheduledAt: scheduledAt.toISOString(), status: 'programada' })
        placed = true
        break
      }
    }

    if (!placed) {
      const limit = deadline ? ` antes del ${DAY_NAME[deadline.getDay()]}` : ' en las próximas tres semanas'
      conflicts.push({
        taskId: task.id,
        reason: `No encontré un hueco de ${formatDuration(task.durationMin)}${limit}.`,
      })
    }
  }

  return { placements, conflicts }
}

/** Sugiere el siguiente hueco libre para una tarea concreta. */
export function nextSlotFor(
  task: Task,
  existing: Task[],
  availability: Availability,
  from: Date = new Date(),
): Placement | null {
  const result = scheduleTasks([task], existing, availability, from)
  return result.placements[0] ?? null
}
