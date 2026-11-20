import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Availability, Task } from '@/lib/types'
import {
  DAY_INITIAL,
  addDays,
  atMinutes,
  startOfDay,
  toDate,
  isSameDate,
  minutesOfDay,
  roundToQuarter,
} from '@/lib/dates'
import { computeDayCapacity, tasksOfDay } from '@/lib/capacity'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { cn } from '@/lib/cn'
import { DayColumn } from './DayColumn'
import { TimeGutter } from './TimeGutter'

const PX_PER_MIN = 56 / 60

interface DragState {
  taskId: string
  durationMin: number
  startMin: number
  originX: number
  originY: number
  dx: number
  dy: number
}

interface WeekGridProps {
  days: Date[]
  tasks: Task[]
  availability: Availability
  onMove: (taskId: string, scheduledAtISO: string) => void
  onSelectDay: (date: Date) => void
}

export function WeekGrid({ days, tasks, availability, onMove, onSelectDay }: WeekGridProps) {
  const navigate = useNavigate()
  const [now, setNow] = useState(() => new Date())
  const [drag, setDrag] = useState<DragState | null>(null)
  const movedRef = useRef(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const scheduled = tasks.filter((task) => task.scheduledAt)
  const earliest = scheduled.reduce(
    (min, task) => Math.min(min, minutesOfDay(task.scheduledAt as string)),
    availability.startMin,
  )
  const latest = scheduled.reduce(
    (max, task) => Math.max(max, minutesOfDay(task.scheduledAt as string) + task.durationMin),
    availability.endMin,
  )

  const rangeStartMin = Math.max(0, Math.floor(earliest / 60) * 60)
  const rangeEndMin = Math.min(24 * 60, Math.ceil(latest / 60) * 60)

  useEffect(() => {
    if (!drag) return

    const onMoveEvent = (event: PointerEvent) => {
      const dx = event.clientX - drag.originX
      const dy = event.clientY - drag.originY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true
      setDrag((state) => (state ? { ...state, dx, dy } : state))
    }

    const onUp = (event: PointerEvent) => {
      if (movedRef.current) {
        // El bloque arrastrado va bajo el puntero, pero sigue viviendo en su columna original:
        // se ignora para encontrar la columna que de verdad está debajo.
        const column =
          document
            .elementsFromPoint(event.clientX, event.clientY)
            .filter((element) => !element.closest(`[data-task-id="${drag.taskId}"]`))
            .map((element) => element.closest('[data-day-index]'))
            .find((element) => element !== null) ?? null
        const index = column ? Number(column.getAttribute('data-day-index')) : -1
        const targetDay = index >= 0 && days[index] ? days[index] : null

        if (targetDay) {
          const rawMinutes = drag.startMin + (event.clientY - drag.originY) / PX_PER_MIN
          const snapped = Math.max(
            0,
            Math.min(24 * 60 - drag.durationMin, roundToQuarter(rawMinutes)),
          )
          onMove(drag.taskId, atMinutes(targetDay, snapped).toISOString())
        }
      }
      setDrag(null)
    }

    window.addEventListener('pointermove', onMoveEvent)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMoveEvent)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, days, onMove])

  const onBlockPointerDown = (event: React.PointerEvent, task: Task) => {
    movedRef.current = false
    if (task.locked || !task.scheduledAt) return
    event.preventDefault()
    setDrag({
      taskId: task.id,
      durationMin: task.durationMin,
      startMin: minutesOfDay(task.scheduledAt),
      originX: event.clientX,
      originY: event.clientY,
      dx: 0,
      dy: 0,
    })
  }

  const onBlockKeyMove = (task: Task, dayDelta: number, minuteDelta: number) => {
    if (task.locked || !task.scheduledAt) return
    const current = toDate(task.scheduledAt)
    const minutes = Math.max(
      0,
      Math.min(24 * 60 - task.durationMin, minutesOfDay(current) + minuteDelta),
    )
    const targetDay = addDays(startOfDay(current), dayDelta)
    onMove(task.id, atMinutes(targetDay, minutes).toISOString())
    // Si cambió de columna, el bloque se vuelve a montar: le devolvemos el foco.
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-task-id="${task.id}"]`)?.focus()
    })
  }

  const onBlockClick = (task: Task) => {
    if (movedRef.current) {
      movedRef.current = false
      return
    }
    navigate(`/tarea/${task.id}`)
  }

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-card border border-line bg-ink">
      <div className="min-w-[760px]">
        <div className="sticky top-0 z-20 flex border-b border-line bg-ink">
          <div className="w-12 shrink-0 border-r border-line" aria-hidden="true" />
          {days.map((day) => {
            const capacity = computeDayCapacity(day, tasks, availability)
            const today = isSameDate(day, now)
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDay(day)}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-1 border-r border-line px-1 py-3 last:border-r-0',
                  'transition-colors duration-150 ease-out hover:bg-surface',
                )}
                aria-label={`Ver la carga del ${day.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                })}: ${capacity.percent} por ciento`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={cn('text-micro', today ? 'text-accent' : 'text-muted')}>
                    {DAY_INITIAL[day.getDay()]}
                  </span>
                  <span className={cn('text-aux tabular-nums', today ? 'text-text' : 'text-muted')}>
                    {day.getDate()}
                  </span>
                </span>
                <CapacityRing value={capacity.percent} overloaded={capacity.overloaded} size="sm" decorative />
                <span
                  className={cn(
                    'text-micro tabular-nums',
                    capacity.overloaded ? 'text-warn' : 'text-muted',
                  )}
                >
                  {capacity.percent}%
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex">
          <TimeGutter startMin={rangeStartMin} endMin={rangeEndMin} pxPerMin={PX_PER_MIN} />
          {days.map((day, index) => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              index={index}
              tasks={tasksOfDay(day, tasks)}
              availability={availability}
              rangeStartMin={rangeStartMin}
              rangeEndMin={rangeEndMin}
              pxPerMin={PX_PER_MIN}
              isToday={isSameDate(day, now)}
              nowMinutes={minutesOfDay(now)}
              draggingId={drag?.taskId ?? null}
              dragOffset={{ x: drag?.dx ?? 0, y: drag?.dy ?? 0 }}
              onBlockPointerDown={onBlockPointerDown}
              onBlockClick={onBlockClick}
              onBlockKeyMove={onBlockKeyMove}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
