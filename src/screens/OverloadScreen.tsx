import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Scissors, Trash2 } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { Button, Card, Chip, EmptyState, buttonClasses, useToast } from '@/components/ui'
import { TaskList } from '@/components/task/TaskList'
import { useAppStore, useVisibleTasks } from '@/store/useAppStore'
import { useTaskActions } from '@/lib/useTaskActions'
import { computeDayCapacity, overloadSuggestions, tasksOfDay } from '@/lib/capacity'
import { STATE_LABEL } from '@/lib/types'
import { DAY_NAME, formatDuration, formatLongDate, isSameDate, toDate } from '@/lib/dates'

const ICONS = {
  mover: ArrowRight,
  recortar: Scissors,
  eliminar: Trash2,
}

export function OverloadScreen() {
  const [params] = useSearchParams()
  const toast = useToast()
  const tasks = useVisibleTasks()
  const availability = useAppStore((state) => state.availability)
  const applySuggestion = useAppStore((state) => state.applySuggestion)
  const { complete, postpone } = useTaskActions()

  const day = useMemo(() => {
    const raw = params.get('dia')
    // Una fecha mal escrita en la dirección no debe romper la pantalla: se usa hoy.
    const parsed = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? toDate(`${raw}T12:00:00`) : null
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date()
  }, [params])

  const capacity = computeDayCapacity(day, tasks, availability)
  const suggestions = overloadSuggestions(day, tasks, availability)
  const dayTasks = tasksOfDay(day, tasks)
  const overloaded = capacity.overloaded
  const name = DAY_NAME[day.getDay()]
  const isToday = isSameDate(day, new Date())

  return (
    <Screen>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-aux text-muted">{formatLongDate(day)}</p>
          <h2 className="text-title font-medium text-text">
            {overloaded ? `El ${name} no te cabe` : `El ${name} te cabe`}
          </h2>
        </header>

        <Card className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <CapacityRing
            value={capacity.percent}
            overloaded={capacity.overloaded}
            size="lg"
            label={`Carga del ${name}`}
          />
          <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
            <p className="text-subtitle text-text">{STATE_LABEL[capacity.state]}</p>
            <p className="text-aux text-muted">
              {formatDuration(capacity.scheduledMin)} programados sobre{' '}
              {formatDuration(capacity.availableMin)} disponibles.
            </p>
            {overloaded ? (
              <p className="text-aux text-warn">
                Sobran {formatDuration(capacity.scheduledMin - capacity.availableMin)} que no
                caben en tu horario.
              </p>
            ) : (
              <p className="text-aux text-muted">
                Te quedan {formatDuration(capacity.freeMin)} libres{isToday ? ' hoy' : ''}.
              </p>
            )}
          </div>
        </Card>

        {overloaded && suggestions.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-subtitle text-text">Tres formas de arreglarlo</h3>
              <p className="text-aux text-muted">
                Salen de las tareas reales de ese día. Al aplicarlas, tu semana se recalcula.
              </p>
            </div>

            {suggestions.map((suggestion) => {
              const Icon = ICONS[suggestion.kind]
              return (
                <Card key={suggestion.id} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted">
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-body text-text">{suggestion.title}</p>
                    <p className="text-aux text-muted">{suggestion.detail}</p>
                    <Chip tone={suggestion.resultPercent > 100 ? 'warn' : 'accent'}>
                      quedaría al {suggestion.resultPercent}%
                    </Chip>
                  </div>
                  <Button
                    size="sm"
                    variant={suggestion.kind === 'eliminar' ? 'danger' : 'secondary'}
                    onClick={() => {
                      applySuggestion(suggestion)
                      toast({
                        message: `Aplicado: ${suggestion.title.toLowerCase()}`,
                        tone: suggestion.kind === 'eliminar' ? 'danger' : 'neutral',
                      })
                    }}
                  >
                    Aplicar
                  </Button>
                </Card>
              )
            })}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="text-subtitle text-text">Lo que hay ese día</h3>
          {dayTasks.length === 0 ? (
            <EmptyState
              title="Ese día está libre"
              description="No hay nada agendado. Buen momento para adelantar pendientes."
              action={
                <Link to="/pendientes" className={buttonClasses({ variant: 'primary' })}>
                  Ver pendientes
                </Link>
              }
            />
          ) : (
            <TaskList tasks={dayTasks} onComplete={complete} onPostpone={postpone} />
          )}
        </section>
      </div>
    </Screen>
  )
}
