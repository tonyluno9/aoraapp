import { Sparkles } from 'lucide-react'
import type { Category } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { Card, Chip, Field, Input, Select } from '@/components/ui'
import {
  atMinutes,
  dayKey,
  formatDuration,
  formatLongDate,
  formatTime,
  minutesOfDay,
  startOfDay,
  toDate,
  addDays,
} from '@/lib/dates'

export interface CaptureDraft {
  id: string
  title: string
  category: Category
  durationMin: number
  /** Siempre con día y hora una vez que el motor propuso lugar. */
  scheduledAt: string | null
  deadline: string | null
  explanation: string
  conflict?: string
}

interface ParsedTaskCardProps {
  draft: CaptureDraft
  adjusting: boolean
  onChange: (patch: Partial<CaptureDraft>) => void
}

const DURATIONS = [15, 30, 45, 60, 90, 120, 150, 180]

export function ParsedTaskCard({ draft, adjusting, onChange }: ParsedTaskCardProps) {
  const scheduled = draft.scheduledAt ? toDate(draft.scheduledAt) : null
  const dayOptions = Array.from({ length: 14 }, (_, index) => addDays(startOfDay(new Date()), index))

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-body text-text">{draft.title}</p>
        <Chip>{draft.category}</Chip>
      </div>

      <p className="flex items-start gap-2 text-aux text-muted">
        <Sparkles size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        {draft.conflict ?? draft.explanation}
      </p>

      {!adjusting && scheduled && (
        <p className="text-aux text-text">
          {formatLongDate(scheduled)} · {formatTime(scheduled)} ·{' '}
          {formatDuration(draft.durationMin)}
        </p>
      )}

      {!adjusting && !scheduled && (
        <p className="text-aux text-warn">
          Queda en pendientes: {formatDuration(draft.durationMin)}
        </p>
      )}

      {adjusting && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Día">
            {(props) => (
              <Select
                {...props}
                value={scheduled ? dayKey(scheduled) : ''}
                onChange={(event) => {
                  const day = toDate(`${event.target.value}T00:00:00`)
                  const minutes = scheduled ? minutesOfDay(scheduled) : 9 * 60
                  onChange({ scheduledAt: atMinutes(day, minutes).toISOString() })
                }}
              >
                {!scheduled && <option value="">Sin agendar</option>}
                {dayOptions.map((day) => (
                  <option key={dayKey(day)} value={dayKey(day)}>
                    {formatLongDate(day)}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Hora">
            {(props) => (
              <Input
                {...props}
                type="time"
                step={900}
                value={scheduled ? formatTime(scheduled) : ''}
                onChange={(event) => {
                  const [hours, minutes] = event.target.value.split(':').map(Number)
                  const base = scheduled ?? new Date()
                  onChange({
                    scheduledAt: atMinutes(base, hours * 60 + minutes).toISOString(),
                  })
                }}
              />
            )}
          </Field>

          <Field label="Duración">
            {(props) => (
              <Select
                {...props}
                value={String(draft.durationMin)}
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

          <Field label="Título" className="sm:col-span-2">
            {(props) => (
              <Input
                {...props}
                value={draft.title}
                onChange={(event) => onChange({ title: event.target.value })}
              />
            )}
          </Field>

          <Field label="Categoría">
            {(props) => (
              <Select
                {...props}
                value={draft.category}
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
        </div>
      )}
    </Card>
  )
}
