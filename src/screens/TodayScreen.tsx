import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Inbox, TriangleAlert } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { TaskList } from '@/components/task/TaskList'
import { useAppStore, useVisibleTasks } from '@/store/useAppStore'
import { useUIStore } from '@/store/useUIStore'
import { useTaskActions } from '@/lib/useTaskActions'
import { useSkeleton } from '@/lib/useSkeleton'
import { computeDayCapacity, tasksOfDay } from '@/lib/capacity'
import { STATE_LABEL } from '@/lib/types'
import { dayKey, formatDuration, formatLongDate, greeting } from '@/lib/dates'

export function TodayScreen() {
  const loading = useSkeleton()
  const tasks = useVisibleTasks()
  const availability = useAppStore((state) => state.availability)
  const user = useAppStore((state) => state.user)
  const openCapture = useUIStore((state) => state.openCapture)
  const { complete, postpone } = useTaskActions()

  const today = useMemo(() => new Date(), [])
  const capacity = computeDayCapacity(today, tasks, availability)
  const dayTasks = tasksOfDay(today, tasks)
  const pendingCount = tasks.filter(
    (task) => task.status === 'pendiente' || task.status === 'vencida',
  ).length

  const firstName = user.name.split(' ')[0]

  return (
    <Screen>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-aux text-muted">{formatLongDate(today)}</p>
          <h2 className="text-title font-medium text-text">
            {greeting()}, {firstName}
          </h2>
        </header>

        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Card className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
            <CapacityRing value={capacity.percent} size="lg" label="Carga de hoy" />
            <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
              <p className="text-subtitle text-text">{STATE_LABEL[capacity.state]}</p>
              <p className="text-aux text-muted">
                {formatDuration(capacity.scheduledMin)} programados de{' '}
                {formatDuration(capacity.availableMin)} disponibles.
              </p>
              <p className="text-aux text-muted">
                {capacity.availableMin === 0
                  ? 'Hoy no tienes horario disponible.'
                  : capacity.percent > 100
                    ? `Te sobran ${formatDuration(
                        capacity.scheduledMin - capacity.availableMin,
                      )} sin dónde caber.`
                    : `Te quedan ${formatDuration(capacity.freeMin)} libres.`}
              </p>
            </div>
            {capacity.percent > 100 && (
              <Link to={`/sobrecarga?dia=${dayKey(today)}`} className="w-full sm:w-auto">
                <Button variant="secondary" fullWidth>
                  <TriangleAlert size={16} aria-hidden="true" />
                  Ver sobrecarga
                </Button>
              </Link>
            )}
          </Card>
        )}

        {pendingCount > 0 && !loading && (
          <Link
            to="/pendientes"
            className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 transition-colors duration-150 ease-out hover:border-muted/40"
          >
            <span className="flex items-center gap-3 text-aux text-text">
              <Inbox size={16} className="text-muted" aria-hidden="true" />
              Tienes {pendingCount} {pendingCount === 1 ? 'tarea' : 'tareas'} por acomodar
            </span>
            <ArrowRight size={16} className="text-muted" aria-hidden="true" />
          </Link>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-subtitle text-text">Tu día</h3>
            <span className="text-aux text-muted">
              {dayTasks.length} {dayTasks.length === 1 ? 'tarea' : 'tareas'}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : dayTasks.length === 0 ? (
            <EmptyState
              title={
                capacity.availableMin === 0
                  ? 'Hoy es tu día libre'
                  : 'Nada agendado para hoy'
              }
              description={
                capacity.availableMin === 0
                  ? 'No tienes horario disponible este día. Disfrútalo.'
                  : 'Dilo con tus palabras y AORAA lo acomoda en tus huecos reales.'
              }
              action={
                <Button variant="primary" onClick={openCapture}>
                  Capturar tarea
                </Button>
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
