import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Clock3, Lock, RefreshCw } from 'lucide-react'
import type { Task } from '@/lib/types'
import { formatDuration, formatTime } from '@/lib/dates'
import { Chip, Tooltip } from '@/components/ui'
import { IntegrationIcon } from '@/integrations/icons'
import { cn } from '@/lib/cn'

interface TaskCardProps {
  task: Task
  index?: number
  onComplete: (task: Task) => void
  onPostpone?: (task: Task) => void
  /** Oculta la hora cuando la tarea no está agendada. */
  showTime?: boolean
}

export function TaskCard({
  task,
  index = 0,
  onComplete,
  onPostpone,
  showTime = true,
}: TaskCardProps) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const done = task.status === 'completada'

  return (
    <motion.li
      layout
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: done ? 0.55 : 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.25,
        ease: [0.16, 1, 0.3, 1],
        delay: reduceMotion ? 0 : Math.min(index, 12) * 0.03,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/tarea/${task.id}`)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            navigate(`/tarea/${task.id}`)
          }
        }}
        className={cn(
          'group flex cursor-pointer items-stretch gap-3 rounded-card border border-line bg-surface p-3',
          'transition-colors duration-150 ease-out hover:border-muted/40',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'w-[3px] shrink-0 rounded-full',
            task.locked ? 'bg-line' : done ? 'bg-line' : 'bg-accent',
          )}
        />

        {showTime && (
          <div className="flex w-14 shrink-0 flex-col pt-0.5">
            <span className="text-aux tabular-nums text-text">
              {task.scheduledAt ? formatTime(task.scheduledAt) : '--:--'}
            </span>
            <span className="text-micro text-muted">{formatDuration(task.durationMin)}</span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p
            className={cn(
              'truncate text-body text-text',
              done && 'text-muted line-through decoration-line',
            )}
          >
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip>{task.category}</Chip>
            {task.priority === 'alta' && !done && <Chip tone="accent">alta</Chip>}
            {task.status === 'vencida' && <Chip tone="danger">vencida</Chip>}
            {!showTime && (
              <Chip>
                <Clock3 size={10} aria-hidden="true" />
                {formatDuration(task.durationMin)}
              </Chip>
            )}
            {task.recurrence && (
              <Chip>
                <RefreshCw size={10} aria-hidden="true" />
                {task.recurrence}
              </Chip>
            )}
            {task.locked && (
              <Chip>
                <Lock size={10} aria-hidden="true" />
                fijo
              </Chip>
            )}
            {task.externalOrigin && (
              <IntegrationIcon id={task.externalOrigin} size={18} className="border-none bg-transparent text-muted" />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onPostpone && !task.locked && !done && (
            <Tooltip label="Posponer 30 min">
              <button
                type="button"
                aria-label={`Posponer "${task.title}" 30 minutos`}
                onClick={(event) => {
                  event.stopPropagation()
                  onPostpone(task)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors duration-150 ease-out hover:text-text"
              >
                <Clock3 size={14} aria-hidden="true" />
              </button>
            </Tooltip>
          )}

          <button
            type="button"
            aria-label={done ? `Reabrir "${task.title}"` : `Completar "${task.title}"`}
            aria-pressed={done}
            onClick={(event) => {
              event.stopPropagation()
              onComplete(task)
            }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150 ease-out',
              done
                ? 'border-accent bg-accentDim text-accent'
                : 'border-line text-muted hover:border-accent hover:text-accent',
            )}
          >
            <Check size={14} aria-hidden="true" />
          </button>

          <ChevronRight
            size={16}
            aria-hidden="true"
            className="hidden self-center text-muted nav:block"
          />
        </div>
      </div>
    </motion.li>
  )
}
