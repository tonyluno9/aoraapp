import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { Button, Card, EmptyState, Skeleton, useToast } from '@/components/ui'
import { TaskList } from '@/components/task/TaskList'
import { useAppStore, useVisibleTasks } from '@/store/useAppStore'
import { useUIStore } from '@/store/useUIStore'
import { useTaskActions } from '@/lib/useTaskActions'
import { useSkeleton } from '@/lib/useSkeleton'
import type { ScheduleResult } from '@/lib/scheduler'

export function PendingScreen() {
  const loading = useSkeleton()
  const toast = useToast()
  const tasks = useVisibleTasks()
  const scheduleAllPending = useAppStore((state) => state.scheduleAllPending)
  const openCapture = useUIStore((state) => state.openCapture)
  const { complete } = useTaskActions()
  const [result, setResult] = useState<ScheduleResult | null>(null)
  const allTasks = useAppStore((state) => state.tasks)
  const titleOf = (id: string) => allTasks.find((task) => task.id === id)?.title ?? 'Tarea'

  const unscheduled = tasks.filter((task) => !task.scheduledAt && task.status !== 'completada')
  const overdue = tasks.filter((task) => task.status === 'vencida' && task.scheduledAt)
  const total = unscheduled.length + overdue.length

  const acomodar = () => {
    const outcome = scheduleAllPending()
    setResult(outcome)
    toast({
      message:
        outcome.placements.length === 0
          ? 'No encontré huecos para lo pendiente'
          : `Se acomodaron ${outcome.placements.length} ${
              outcome.placements.length === 1 ? 'tarea' : 'tareas'
            }`,
      tone: outcome.placements.length === 0 ? 'warn' : 'neutral',
    })
  }

  return (
    <Screen>
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-title font-medium text-text">Pendientes</h2>
            <p className="text-aux text-muted">
              Lo que está sin agendar y lo que se te pasó de fecha.
            </p>
          </div>
          {total > 0 && (
            <Button variant="primary" onClick={acomodar}>
              <Sparkles size={16} aria-hidden="true" />
              Acomodar todo
            </Button>
          )}
        </header>

        {result && (
          <Card className="flex flex-col gap-2">
            <p className="text-body text-text">Esto hizo el motor</p>
            {result.placements.map((placement) => (
              <p key={placement.taskId} className="text-aux text-muted">
                · <span className="text-text">{titleOf(placement.taskId)}:</span>{' '}
                {placement.explanation}
              </p>
            ))}
            {result.conflicts.map((conflict) => (
              <p key={conflict.taskId} className="text-aux text-warn">
                · <span className="text-text">{titleOf(conflict.taskId)}:</span>{' '}
                {conflict.reason}
              </p>
            ))}
            {result.placements.length === 0 && result.conflicts.length === 0 && (
              <p className="text-aux text-muted">No quedaba nada por acomodar.</p>
            )}
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : total === 0 ? (
          <EmptyState
            title="No hay nada pendiente"
            description="Todo lo que capturaste tiene día y hora. Así se siente ir al corriente."
            action={
              <Button variant="primary" onClick={openCapture}>
                Capturar algo nuevo
              </Button>
            }
          />
        ) : (
          <>
            {unscheduled.length > 0 && (
              <section className="flex flex-col gap-3">
                <h3 className="text-subtitle text-text">Sin agendar ({unscheduled.length})</h3>
                <TaskList tasks={unscheduled} onComplete={complete} showTime={false} />
              </section>
            )}

            {overdue.length > 0 && (
              <section className="flex flex-col gap-3">
                <h3 className="text-subtitle text-text">Vencidas ({overdue.length})</h3>
                <TaskList tasks={overdue} onComplete={complete} />
              </section>
            )}
          </>
        )}
      </div>
    </Screen>
  )
}
