import { CalendarClock, Clock3, Flag, Timer } from 'lucide-react'
import type { Task } from '@/lib/types'
import type { DayCapacity } from '@/lib/capacity'
import { Card, Chip } from '@/components/ui'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { STATE_LABEL } from '@/lib/types'
import { formatDuration, formatLongDate, formatRelativeDay, formatTime } from '@/lib/dates'

interface TaskDetailProps {
  task: Task
  capacity: DayCapacity | null
}

/** Resumen de la tarea: dónde quedó y cómo afecta al día. */
export function TaskDetail({ task, capacity }: TaskDetailProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip>{task.category}</Chip>
        <Chip tone={task.priority === 'alta' ? 'accent' : 'neutral'}>
          prioridad {task.priority}
        </Chip>
        <Chip tone={task.status === 'vencida' ? 'danger' : 'neutral'}>{task.status}</Chip>
        {task.source !== 'manual' && <Chip>captura por {task.source}</Chip>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Row
          icon={<CalendarClock size={14} aria-hidden="true" />}
          label="Cuándo"
          value={
            task.scheduledAt
              ? `${formatLongDate(task.scheduledAt)} · ${formatTime(task.scheduledAt)}`
              : 'Sin agendar'
          }
        />
        <Row
          icon={<Timer size={14} aria-hidden="true" />}
          label="Duración"
          value={formatDuration(task.durationMin)}
        />
        <Row
          icon={<Flag size={14} aria-hidden="true" />}
          label="Fecha límite"
          value={
            task.deadline
              ? `${formatRelativeDay(task.deadline)} · ${formatLongDate(task.deadline)}`
              : 'Sin fecha límite'
          }
        />
        <Row
          icon={<Clock3 size={14} aria-hidden="true" />}
          label="Recordatorio"
          value={task.reminderMin ? `${task.reminderMin} min antes` : 'Sin recordatorio'}
        />
      </div>

      {capacity && (
        <div className="flex items-center gap-3 border-t border-line pt-4">
          <CapacityRing value={capacity.percent} overloaded={capacity.overloaded} size="sm" label="Carga de ese día" />
          <p className="text-aux text-muted">
            Ese día va al {capacity.percent}%. {STATE_LABEL[capacity.state]}, con{' '}
            {formatDuration(capacity.freeMin)} libres.
          </p>
        </div>
      )}
    </Card>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted">{icon}</span>
      <span className="flex flex-col">
        <span className="text-micro text-muted">{label}</span>
        <span className="text-aux text-text">{value}</span>
      </span>
    </div>
  )
}
