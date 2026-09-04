import type { Category, Priority, Recurrence, Task } from '@/lib/types'
import { CATEGORIES, PRIORITIES } from '@/lib/types'
import { Card, Field, Input, Select, Textarea, Toggle } from '@/components/ui'
import { atMinutes, dayKey, formatDuration, minutesOfDay, toDate } from '@/lib/dates'

const DURATIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240]
const REMINDERS = [0, 10, 15, 30, 60]

interface TaskEditorProps {
  task: Task
  onChange: (patch: Partial<Task>) => void
}

/** Todos los campos de una tarea, editables en línea. */
export function TaskEditor({ task, onChange }: TaskEditorProps) {
  const scheduled = task.scheduledAt ? toDate(task.scheduledAt) : null

  const setDay = (value: string) => {
    if (!value) return
    const minutes = scheduled ? minutesOfDay(scheduled) : 9 * 60
    onChange({ scheduledAt: atMinutes(toDate(`${value}T00:00:00`), minutes).toISOString() })
  }

  const setTime = (value: string) => {
    if (!value) return
    const [hours, minutes] = value.split(':').map(Number)
    const base = scheduled ?? new Date()
    onChange({ scheduledAt: atMinutes(base, hours * 60 + minutes).toISOString() })
  }

  return (
    <Card className="flex flex-col gap-4">
      <Field label="Título">
        {(props) => (
          <Input
            {...props}
            value={task.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        )}
      </Field>

      <Field label="Notas" hint="Para los detalles que no caben en el título.">
        {(props) => (
          <Textarea
            {...props}
            rows={3}
            value={task.notes ?? ''}
            placeholder="Sin notas"
            onChange={(event) => onChange({ notes: event.target.value })}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoría">
          {(props) => (
            <Select
              {...props}
              value={task.category}
              onChange={(event) => onChange({ category: event.target.value as Category })}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Prioridad">
          {(props) => (
            <Select
              {...props}
              value={task.priority}
              onChange={(event) => onChange({ priority: event.target.value as Priority })}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Día">
          {(props) => (
            <Input
              {...props}
              type="date"
              value={scheduled ? dayKey(scheduled) : ''}
              onChange={(event) => setDay(event.target.value)}
            />
          )}
        </Field>

        <Field label="Hora">
          {(props) => (
            <Input
              {...props}
              type="time"
              step={900}
              value={scheduled ? `${String(scheduled.getHours()).padStart(2, '0')}:${String(scheduled.getMinutes()).padStart(2, '0')}` : ''}
              onChange={(event) => setTime(event.target.value)}
            />
          )}
        </Field>

        <Field label="Duración">
          {(props) => (
            <Select
              {...props}
              value={String(task.durationMin)}
              onChange={(event) => onChange({ durationMin: Number(event.target.value) })}
            >
              {DURATIONS.map((value) => (
                <option key={value} value={value}>
                  {formatDuration(value)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Fecha límite">
          {(props) => (
            <Input
              {...props}
              type="date"
              value={task.deadline ? dayKey(task.deadline) : ''}
              onChange={(event) =>
                onChange({
                  deadline: event.target.value
                    ? atMinutes(toDate(`${event.target.value}T00:00:00`), 23 * 60 + 59).toISOString()
                    : null,
                })
              }
            />
          )}
        </Field>

        <Field label="Recordatorio">
          {(props) => (
            <Select
              {...props}
              value={String(task.reminderMin ?? 0)}
              onChange={(event) => onChange({ reminderMin: Number(event.target.value) })}
            >
              {REMINDERS.map((value) => (
                <option key={value} value={value}>
                  {value === 0 ? 'Sin recordatorio' : `${value} min antes`}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Repetición">
          {(props) => (
            <Select
              {...props}
              value={task.recurrence ?? 'ninguna'}
              onChange={(event) =>
                onChange({
                  recurrence:
                    event.target.value === 'ninguna'
                      ? null
                      : (event.target.value as Exclude<Recurrence, null>),
                })
              }
            >
              <option value="ninguna">No se repite</option>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
            </Select>
          )}
        </Field>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
        <span className="flex flex-col">
          <span className="text-body text-text">Bloque fijo</span>
          <span className="text-aux text-muted">No se puede mover ni acomodar solo.</span>
        </span>
        <Toggle
          checked={task.locked}
          onChange={(value) => onChange({ locked: value })}
          label="Bloque fijo"
        />
      </div>
    </Card>
  )
}
