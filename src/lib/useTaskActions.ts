import { useToast } from '@/components/ui'
import { useAppStore } from '@/store/useAppStore'
import type { Task } from '@/lib/types'
import { formatDuration } from '@/lib/dates'

/** Acciones de tarea con su aviso emergente y su deshacer. */
export function useTaskActions() {
  const toast = useToast()
  const toggleComplete = useAppStore((state) => state.toggleComplete)
  const postponeTask = useAppStore((state) => state.postponeTask)
  const removeTask = useAppStore((state) => state.removeTask)
  const restoreLastRemoved = useAppStore((state) => state.restoreLastRemoved)

  const complete = (task: Task) => {
    const wasDone = task.status === 'completada'
    toggleComplete(task.id)
    toast({
      message: wasDone ? 'Tarea reabierta' : 'Tarea completada',
      actionLabel: 'Deshacer',
      onAction: () => toggleComplete(task.id),
    })
  }

  const postpone = (task: Task, minutes = 30) => {
    postponeTask(task.id, minutes)
    toast({
      message: `Pospuesta ${formatDuration(minutes)}`,
      actionLabel: 'Deshacer',
      onAction: () => postponeTask(task.id, -minutes),
    })
  }

  const remove = (task: Task) => {
    removeTask(task.id)
    toast({
      message: 'Tarea eliminada',
      actionLabel: 'Deshacer',
      onAction: () => restoreLastRemoved(),
    })
  }

  return { complete, postpone, remove }
}
