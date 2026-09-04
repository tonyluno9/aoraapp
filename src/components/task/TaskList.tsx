import { AnimatePresence } from 'framer-motion'
import type { Task } from '@/lib/types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  onComplete: (task: Task) => void
  onPostpone?: (task: Task) => void
  showTime?: boolean
}

export function TaskList({ tasks, onComplete, onPostpone, showTime = true }: TaskListProps) {
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onComplete={onComplete}
            onPostpone={onPostpone}
            showTime={showTime}
          />
        ))}
      </AnimatePresence>
    </ul>
  )
}
