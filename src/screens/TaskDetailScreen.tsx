import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock3, Trash2, Wand2 } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { Button, Card, EmptyState, Modal, useToast } from '@/components/ui'
import { TaskDetail } from '@/components/task/TaskDetail'
import { TaskEditor } from '@/components/task/TaskEditor'
import { useAppStore } from '@/store/useAppStore'
import { useTaskActions } from '@/lib/useTaskActions'
import { computeDayCapacity } from '@/lib/capacity'
import { nextSlotFor } from '@/lib/scheduler'

export function TaskDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const tasks = useAppStore((state) => state.tasks)
  const availability = useAppStore((state) => state.availability)
  const updateTask = useAppStore((state) => state.updateTask)
  const moveTask = useAppStore((state) => state.moveTask)
  const { complete, postpone, remove } = useTaskActions()
  const [confirming, setConfirming] = useState(false)

  const task = tasks.find((item) => item.id === id)

  if (!task) {
    return (
      <Screen>
        <EmptyState
          title="Esa tarea ya no existe"
          description="Puede que la hayas eliminado o que el enlace sea viejo."
          action={
            <Link to="/hoy">
              <Button variant="primary">Volver a Hoy</Button>
            </Link>
          }
        />
      </Screen>
    )
  }

  const capacity = task.scheduledAt
    ? computeDayCapacity(task.scheduledAt, tasks, availability)
    : null

  const acomodar = () => {
    const placement = nextSlotFor(
      task,
      tasks.filter((item) => item.id !== task.id),
      availability,
      new Date(),
    )
    if (!placement) {
      toast({ message: 'No encontré un hueco en las próximas tres semanas', tone: 'warn' })
      return
    }
    moveTask(task.id, placement.scheduledAt)
    toast({ message: placement.explanation })
  }

  return (
    <Screen>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            {!task.locked && (
              <Button size="sm" onClick={() => postpone(task)}>
                <Clock3 size={14} aria-hidden="true" />
                Posponer
              </Button>
            )}
            <Button
              size="sm"
              variant={task.status === 'completada' ? 'secondary' : 'primary'}
              onClick={() => complete(task)}
            >
              <Check size={14} aria-hidden="true" />
              {task.status === 'completada' ? 'Reabrir' : 'Completar'}
            </Button>
          </div>
        </div>

        <h2 className="text-title font-medium text-text">{task.title}</h2>

        <TaskDetail task={task} capacity={capacity} />

        {!task.scheduledAt && (
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-aux text-muted">
              Esta tarea está sin agendar. AORAA puede buscarle un hueco real.
            </p>
            <Button variant="primary" size="sm" onClick={acomodar}>
              <Wand2 size={14} aria-hidden="true" />
              Acomodar
            </Button>
          </Card>
        )}

        <TaskEditor task={task} onChange={(patch) => updateTask(task.id, patch)} />

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-body text-text">Eliminar tarea</p>
            <p className="text-aux text-muted">Se puede deshacer desde el aviso.</p>
          </div>
          <Button variant="danger" onClick={() => setConfirming(true)}>
            <Trash2 size={14} aria-hidden="true" />
            Eliminar
          </Button>
        </Card>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Eliminar tarea"
        description="Se quitará de tu semana y se liberará su tiempo."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirming(false)
                remove(task)
                navigate('/hoy')
              }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-body text-muted">
          &ldquo;{task.title}&rdquo; dejará de aparecer en Hoy y en Semana.
        </p>
      </Modal>
    </Screen>
  )
}
