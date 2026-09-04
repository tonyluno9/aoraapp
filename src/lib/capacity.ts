import type { Availability, CapacityState, Task } from './types'
import { DAY_NAME, addDays, dayKey, formatDuration, isSameDate, roundToQuarter, toDate } from './dates'

export interface DayCapacity {
  dateISO: string
  percent: number
  state: CapacityState
  scheduledMin: number
  availableMin: number
  freeMin: number
  taskCount: number
}

export function capacityState(percent: number): CapacityState {
  if (percent > 100) return 'sobrecargado'
  if (percent >= 90) return 'apretado'
  if (percent >= 60) return 'equilibrado'
  return 'holgado'
}

/** Minutos disponibles de un día: horario menos bloques fijos. */
export function dayAvailableMinutes(day: string | Date, availability: Availability): number {
  const date = toDate(day)
  const weekday = date.getDay()
  if (!availability.days.includes(weekday)) return 0

  const total = Math.max(0, availability.endMin - availability.startMin)
  const blocked = availability.fixedBlocks
    .filter((block) => block.days.includes(weekday))
    .reduce((sum, block) => {
      const start = Math.max(block.startMin, availability.startMin)
      const end = Math.min(block.endMin, availability.endMin)
      return sum + Math.max(0, end - start)
    }, 0)

  return Math.max(0, total - blocked)
}

export function tasksOfDay(day: string | Date, tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.scheduledAt && isSameDate(task.scheduledAt, day))
    .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''))
}

export function computeDayCapacity(
  day: string | Date,
  tasks: Task[],
  availability: Availability,
): DayCapacity {
  const availableMin = dayAvailableMinutes(day, availability)
  const dayTasks = tasksOfDay(day, tasks).filter((task) => task.status !== 'completada')
  const scheduledMin = dayTasks.reduce((sum, task) => sum + task.durationMin, 0)
  const percent =
    availableMin > 0
      ? Math.round((scheduledMin / availableMin) * 100)
      : scheduledMin > 0
        ? 100
        : 0

  return {
    dateISO: dayKey(day),
    percent,
    state: capacityState(percent),
    scheduledMin,
    availableMin,
    freeMin: Math.max(0, availableMin - scheduledMin),
    taskCount: dayTasks.length,
  }
}

export type SuggestionKind = 'mover' | 'recortar' | 'eliminar'

export interface Suggestion {
  id: string
  kind: SuggestionKind
  title: string
  detail: string
  taskId: string
  /** Día destino para "mover". */
  targetDateISO?: string
  /** Nueva duración para "recortar". */
  newDurationMin?: number
  /** Porcentaje del día después de aplicar la sugerencia. */
  resultPercent: number
}

const PRIORITY_WEIGHT: Record<Task['priority'], number> = { alta: 3, media: 2, baja: 1 }

/** Tres sugerencias concretas hechas con las tareas reales del día. */
export function overloadSuggestions(
  day: string | Date,
  tasks: Task[],
  availability: Availability,
): Suggestion[] {
  const capacity = computeDayCapacity(day, tasks, availability)
  const movable = tasksOfDay(day, tasks).filter(
    (task) => task.status !== 'completada' && !task.locked,
  )
  if (movable.length === 0 || capacity.availableMin === 0) return []

  const suggestions: Suggestion[] = []
  const percentAfter = (freedMin: number) =>
    Math.round(((capacity.scheduledMin - freedMin) / capacity.availableMin) * 100)

  // 1. Mover la de menor prioridad al día más holgado de los próximos siete.
  const lowest = [...movable].sort(
    (a, b) =>
      PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || a.durationMin - b.durationMin,
  )[0]

  const candidates = Array.from({ length: 7 }, (_, index) => addDays(toDate(day), index + 1))
    .map((date) => computeDayCapacity(date, tasks, availability))
    .filter((option) => option.freeMin >= lowest.durationMin)
    .sort((a, b) => a.percent - b.percent)

  const target = candidates[0]
  if (target) {
    const targetDate = toDate(target.dateISO)
    suggestions.push({
      id: `mover-${lowest.id}`,
      kind: 'mover',
      title: `Mover "${lowest.title}" al ${DAY_NAME[targetDate.getDay()]}`,
      detail: `Ese día está al ${target.percent}% y le quedan ${formatDuration(target.freeMin)} libres.`,
      taskId: lowest.id,
      targetDateISO: target.dateISO,
      resultPercent: percentAfter(lowest.durationMin),
    })
  }

  // 2. Recortar la más larga.
  const longest = [...movable].sort((a, b) => b.durationMin - a.durationMin)[0]
  const trimmed = Math.max(15, roundToQuarter(longest.durationMin * 0.6))
  if (trimmed < longest.durationMin) {
    suggestions.push({
      id: `recortar-${longest.id}`,
      kind: 'recortar',
      title: `Recortar "${longest.title}" a ${formatDuration(trimmed)}`,
      detail: `Hoy le diste ${formatDuration(longest.durationMin)}; liberas ${formatDuration(
        longest.durationMin - trimmed,
      )}.`,
      taskId: longest.id,
      newDurationMin: trimmed,
      resultPercent: percentAfter(longest.durationMin - trimmed),
    })
  }

  // 3. Eliminar la menos valiosa que quede.
  const usedIds = new Set(suggestions.map((item) => item.taskId))
  const disposable =
    [...movable]
      .filter((task) => !usedIds.has(task.id))
      .sort(
        (a, b) =>
          PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
          b.durationMin - a.durationMin,
      )[0] ?? movable[movable.length - 1]

  if (disposable) {
    suggestions.push({
      id: `eliminar-${disposable.id}`,
      kind: 'eliminar',
      title: `Eliminar "${disposable.title}"`,
      detail: `Liberas ${formatDuration(disposable.durationMin)} y bajas la carga del día.`,
      taskId: disposable.id,
      resultPercent: percentAfter(disposable.durationMin),
    })
  }

  return suggestions.slice(0, 3)
}
