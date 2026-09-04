import type { Availability, Task } from '@/lib/types'
import { minutesOfDay, minutesToClock } from '@/lib/dates'
import { cn } from '@/lib/cn'
import { TaskBlock } from './TaskBlock'

export interface LaidOutTask {
  task: Task
  col: number
  cols: number
}

/** Reparte en columnas las tareas que se traslapan. */
export function layoutTasks(tasks: Task[]): LaidOutTask[] {
  const sorted = [...tasks]
    .filter((task) => task.scheduledAt)
    .sort((a, b) => minutesOfDay(a.scheduledAt as string) - minutesOfDay(b.scheduledAt as string))

  const result: LaidOutTask[] = []
  let cluster: Task[] = []
  let clusterEnd = -1

  const flush = () => {
    if (cluster.length === 0) return
    const columnEnds: number[] = []
    const assigned: Array<{ task: Task; col: number }> = []

    for (const task of cluster) {
      const start = minutesOfDay(task.scheduledAt as string)
      const end = start + task.durationMin
      let col = columnEnds.findIndex((value) => value <= start)
      if (col === -1) {
        columnEnds.push(end)
        col = columnEnds.length - 1
      } else {
        columnEnds[col] = end
      }
      assigned.push({ task, col })
    }

    for (const item of assigned) {
      result.push({ task: item.task, col: item.col, cols: columnEnds.length })
    }
    cluster = []
    clusterEnd = -1
  }

  for (const task of sorted) {
    const start = minutesOfDay(task.scheduledAt as string)
    if (cluster.length > 0 && start >= clusterEnd) flush()
    cluster.push(task)
    clusterEnd = Math.max(clusterEnd, start + task.durationMin)
  }
  flush()

  return result
}

interface DayColumnProps {
  date: Date
  index: number
  tasks: Task[]
  availability: Availability
  rangeStartMin: number
  rangeEndMin: number
  pxPerMin: number
  isToday: boolean
  nowMinutes: number
  draggingId: string | null
  dragOffset: { x: number; y: number }
  onBlockPointerDown: (event: React.PointerEvent, task: Task) => void
  onBlockClick: (task: Task) => void
}

export function DayColumn({
  date,
  index,
  tasks,
  availability,
  rangeStartMin,
  rangeEndMin,
  pxPerMin,
  isToday,
  nowMinutes,
  draggingId,
  dragOffset,
  onBlockPointerDown,
  onBlockClick,
}: DayColumnProps) {
  const weekday = date.getDay()
  const open = availability.days.includes(weekday)
  const height = (rangeEndMin - rangeStartMin) * pxPerMin
  const laidOut = layoutTasks(tasks)

  const hours: number[] = []
  for (let minute = rangeStartMin + 60; minute < rangeEndMin; minute += 60) hours.push(minute)

  return (
    <div
      data-day-index={index}
      className="relative min-w-0 flex-1 border-r border-line last:border-r-0"
      style={{ height }}
    >
      {open && (
        <div
          className="absolute inset-x-0 bg-surface"
          style={{
            top: (Math.max(availability.startMin, rangeStartMin) - rangeStartMin) * pxPerMin,
            height:
              (Math.min(availability.endMin, rangeEndMin) -
                Math.max(availability.startMin, rangeStartMin)) *
              pxPerMin,
          }}
          aria-hidden="true"
        />
      )}

      {hours.map((minute) => (
        <div
          key={minute}
          className="absolute inset-x-0 border-t border-line"
          style={{ top: (minute - rangeStartMin) * pxPerMin }}
          aria-hidden="true"
        />
      ))}

      {availability.fixedBlocks
        .filter((block) => block.days.includes(weekday))
        .map((block) => (
          <div
            key={block.id}
            className="absolute inset-x-0 flex items-start justify-center overflow-hidden border-y border-line bg-elevated px-1 pt-1"
            style={{
              top: (block.startMin - rangeStartMin) * pxPerMin,
              height: (block.endMin - block.startMin) * pxPerMin,
            }}
          >
            <span className="truncate text-micro text-muted">{block.label}</span>
          </div>
        ))}

      {laidOut.map(({ task, col, cols }) => {
        const start = minutesOfDay(task.scheduledAt as string)
        return (
          <TaskBlock
            key={task.id}
            task={task}
            top={(start - rangeStartMin) * pxPerMin}
            height={task.durationMin * pxPerMin}
            widthPct={100 / cols}
            leftPct={(100 / cols) * col}
            dragging={draggingId === task.id}
            offset={dragOffset}
            onPointerDown={onBlockPointerDown}
            onClick={onBlockClick}
          />
        )
      })}

      {isToday && nowMinutes >= rangeStartMin && nowMinutes <= rangeEndMin && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
          style={{ top: (nowMinutes - rangeStartMin) * pxPerMin }}
          aria-label={`Hora actual: ${minutesToClock(nowMinutes)}`}
        >
          <span className="h-2 w-2 -translate-x-1/2 rounded-full bg-accent" aria-hidden="true" />
          <span className={cn('h-px flex-1 bg-accent')} aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
