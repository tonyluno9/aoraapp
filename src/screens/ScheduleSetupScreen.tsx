import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { Button, Card, Field, Input, useToast } from '@/components/ui'
import { useAppStore } from '@/store/useAppStore'
import { DAY_INITIAL, DAY_NAME, WEEK_DAY_ORDER, formatDuration, minutesToClock } from '@/lib/dates'
import { dayAvailableMinutes } from '@/lib/capacity'
import { cn } from '@/lib/cn'
import { addDays, startOfDay } from '@/lib/dates'

function clockToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

export function ScheduleSetupScreen() {
  const navigate = useNavigate()
  const toast = useToast()
  const availability = useAppStore((state) => state.availability)
  const setAvailability = useAppStore((state) => state.setAvailability)
  const addFixedBlock = useAppStore((state) => state.addFixedBlock)
  const removeFixedBlock = useAppStore((state) => state.removeFixedBlock)
  const finishScheduleSetup = useAppStore((state) => state.finishScheduleSetup)

  const [label, setLabel] = useState('')
  const [days, setDays] = useState<number[]>([])
  const [start, setStart] = useState('16:00')
  const [end, setEnd] = useState('18:00')
  const [error, setError] = useState<string | undefined>(undefined)

  const toggleDay = (day: number) => {
    const next = availability.days.includes(day)
      ? availability.days.filter((value) => value !== day)
      : [...availability.days, day].sort()
    setAvailability({ days: next })
  }

  const sample = Array.from({ length: 7 }, (_, index) => addDays(startOfDay(new Date()), index))

  const add = () => {
    if (label.trim().length === 0) {
      setError('Ponle un nombre al bloque.')
      return
    }
    if (days.length === 0) {
      setError('Elige al menos un día.')
      return
    }
    if (clockToMinutes(end) <= clockToMinutes(start)) {
      setError('La hora de fin debe ir después de la de inicio.')
      return
    }
    addFixedBlock({
      label: label.trim(),
      days,
      startMin: clockToMinutes(start),
      endMin: clockToMinutes(end),
    })
    setLabel('')
    setDays([])
    setError(undefined)
    toast({ message: 'Bloque fijo agregado' })
  }

  return (
    <Screen>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-title font-medium text-text">Tu horario</h2>
          <p className="text-aux text-muted">
            Con esto calculamos cuánto te cabe. Puedes cambiarlo cuando quieras.
          </p>
        </header>

        <Card className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-body text-text">Días disponibles</p>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAY_ORDER.map((day) => {
                const active = availability.days.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    aria-pressed={active}
                    aria-label={DAY_NAME[day]}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border text-aux transition-colors duration-150 ease-out',
                      active
                        ? 'border-accent bg-accentDim text-text'
                        : 'border-line text-muted hover:text-text',
                    )}
                  >
                    {DAY_INITIAL[day]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Field label={`Empiezas a las ${minutesToClock(availability.startMin)}`}>
              {(props) => (
                <input
                  {...props}
                  type="range"
                  min={0}
                  max={availability.endMin - 60}
                  step={15}
                  value={availability.startMin}
                  onChange={(event) => setAvailability({ startMin: Number(event.target.value) })}
                />
              )}
            </Field>

            <Field label={`Terminas a las ${minutesToClock(availability.endMin)}`}>
              {(props) => (
                <input
                  {...props}
                  type="range"
                  min={availability.startMin + 60}
                  max={24 * 60}
                  step={15}
                  value={availability.endMin}
                  onChange={(event) => setAvailability({ endMin: Number(event.target.value) })}
                />
              )}
            </Field>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            {sample.map((day) => (
              <span
                key={day.toISOString()}
                className="rounded-full border border-line px-3 py-1 text-micro text-muted"
              >
                {DAY_INITIAL[day.getDay()]} ·{' '}
                {formatDuration(dayAvailableMinutes(day, availability))}
              </span>
            ))}
          </div>
        </Card>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-subtitle text-text">Bloques fijos</h3>
            <p className="text-aux text-muted">
              Clases, turnos, entrenamientos: el tiempo que ya está ocupado.
            </p>
          </div>

          {availability.fixedBlocks.map((block) => (
            <Card key={block.id} className="flex items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-body text-text">{block.label}</p>
                <p className="text-aux text-muted">
                  {block.days.map((day) => DAY_INITIAL[day]).join(' ')} ·{' '}
                  {minutesToClock(block.startMin)} a {minutesToClock(block.endMin)}
                </p>
              </div>
              <Button
                size="sm"
                variant="danger"
                iconOnly
                aria-label={`Eliminar ${block.label}`}
                onClick={() => removeFixedBlock(block.id)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </Button>
            </Card>
          ))}

          <Card className="flex flex-col gap-4">
            <p className="text-body text-text">Agregar un bloque</p>

            <Field label="Nombre" error={error}>
              {(props) => (
                <Input
                  {...props}
                  value={label}
                  placeholder="Turno en la cafetería"
                  onChange={(event) => {
                    setLabel(event.target.value)
                    setError(undefined)
                  }}
                />
              )}
            </Field>

            <div className="flex flex-wrap gap-2">
              {WEEK_DAY_ORDER.map((day) => {
                const active = days.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={active}
                    aria-label={DAY_NAME[day]}
                    onClick={() =>
                      setDays((current) =>
                        current.includes(day)
                          ? current.filter((value) => value !== day)
                          : [...current, day].sort(),
                      )
                    }
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border text-aux transition-colors duration-150 ease-out',
                      active
                        ? 'border-accent bg-accentDim text-text'
                        : 'border-line text-muted hover:text-text',
                    )}
                  >
                    {DAY_INITIAL[day]}
                  </button>
                )
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Empieza">
                {(props) => (
                  <Input
                    {...props}
                    type="time"
                    step={900}
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                  />
                )}
              </Field>
              <Field label="Termina">
                {(props) => (
                  <Input
                    {...props}
                    type="time"
                    step={900}
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                )}
              </Field>
            </div>

            <Button onClick={add}>
              <Plus size={14} aria-hidden="true" />
              Agregar bloque
            </Button>
          </Card>
        </section>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            finishScheduleSetup()
            toast({ message: 'Horario guardado' })
            navigate('/hoy')
          }}
        >
          Guardar y ver mi día
        </Button>
      </div>
    </Screen>
  )
}
