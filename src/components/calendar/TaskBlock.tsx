import { Lock } from 'lucide-react'
import type { Task } from '@/lib/types'
import { formatDuration, formatTime } from '@/lib/dates'
import { cn } from '@/lib/cn'

interface TaskBlockProps {
  task: Task
  top: number
  height: number
  /** Porcentaje de ancho y desplazamiento cuando hay traslapes. */
  widthPct: number
  leftPct: number
  dragging: boolean
  offset: { x: number; y: number }
  onPointerDown: (event: React.PointerEvent, task: Task) => void
  onClick: (task: Task) => void
  /** Mueve con el teclado: días de diferencia y minutos de diferencia. */
  onKeyMove: (task: Task, dayDelta: number, minuteDelta: number) => void
}

const KEY_MOVES: Record<string, [number, number]> = {
  ArrowUp: [0, -15],
  ArrowDown: [0, 15],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

export function TaskBlock({
  task,
  top,
  height,
  widthPct,
  leftPct,
  dragging,
  offset,
  onPointerDown,
  onClick,
  onKeyMove,
}: TaskBlockProps) {
  const done = task.status === 'completada'
  const compact = height < 44

  return (
    <button
      type="button"
      data-task-block="true"
      data-task-id={task.id}
      onPointerDown={(event) => onPointerDown(event, task)}
      onClick={() => onClick(task)}
      onKeyDown={(event) => {
        const move = KEY_MOVES[event.key]
        if (!move || !event.altKey || task.locked) return
        event.preventDefault()
        onKeyMove(task, move[0], move[1])
      }}
      aria-label={`${task.title}, ${
        task.scheduledAt ? formatTime(task.scheduledAt) : 'sin hora'
      }, ${formatDuration(task.durationMin)}${task.locked ? ', bloque fijo' : ''}`}
      aria-describedby={task.locked ? undefined : 'week-move-hint'}
      className={cn(
        'absolute flex touch-none flex-col overflow-hidden rounded-card focus-visible:ring-inset focus-visible:ring-offset-0 border border-line bg-surface px-2 py-1 text-left',
        'transition-colors duration-150 ease-out hover:border-muted/40',
        task.locked ? 'cursor-not-allowed' : 'cursor-grab',
        dragging && 'z-30 cursor-grabbing border-accent shadow-modal',
        done && 'border-dashed',
      )}
      style={{
        top,
        height: Math.max(height, 22),
        width: `calc(${widthPct}% - 4px)`,
        left: `calc(${leftPct}% + 2px)`,
        transform: dragging ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1 left-0 w-[3px] rounded-full',
          task.locked || done ? 'bg-line' : 'bg-accent',
        )}
      />
      <span
        className={cn(
          'ml-2 truncate text-micro text-text',
          done && 'text-muted line-through decoration-line',
        )}
      >
        {task.title}
      </span>
      {!compact && (
        <span className="ml-2 flex items-center gap-1 truncate text-micro text-muted">
          {task.locked && <Lock size={9} aria-hidden="true" />}
          {task.scheduledAt ? formatTime(task.scheduledAt) : '--:--'} ·{' '}
          {formatDuration(task.durationMin)}
        </span>
      )}
    </button>
  )
}
