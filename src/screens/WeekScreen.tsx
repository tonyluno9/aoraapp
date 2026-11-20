import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { WeekGrid } from '@/components/calendar/WeekGrid'
import { Button, Card, Skeleton, useToast } from '@/components/ui'
import { useAppStore, useVisibleTasks } from '@/store/useAppStore'
import { useSkeleton } from '@/lib/useSkeleton'
import { computeDayCapacity } from '@/lib/capacity'
import {
  DAY_NAME,
  addDays,
  dayKey,
  formatTime,
  toDate,
  weekDates,
  weekStart,
} from '@/lib/dates'

export function WeekScreen() {
  const loading = useSkeleton()
  const navigate = useNavigate()
  const toast = useToast()
  const tasks = useVisibleTasks()
  const allTasks = useAppStore((state) => state.tasks)
  const availability = useAppStore((state) => state.availability)
  const moveTask = useAppStore((state) => state.moveTask)

  const [anchor, setAnchor] = useState(() => weekStart(new Date()))
  const days = weekDates(anchor)

  const onMove = (taskId: string, scheduledAtISO: string) => {
    const task = allTasks.find((item) => item.id === taskId)
    if (!task) return
    const previous = task.scheduledAt
    moveTask(taskId, scheduledAtISO)

    const nextTasks = allTasks.map((item) =>
      item.id === taskId ? { ...item, scheduledAt: scheduledAtISO } : item,
    )
    const target = toDate(scheduledAtISO)
    const targetLoad = computeDayCapacity(target, nextTasks, availability)
    const originLoad = previous
      ? computeDayCapacity(toDate(previous), nextTasks, availability)
      : null

    toast({
      message: originLoad
        ? `Movida al ${DAY_NAME[target.getDay()]} ${formatTime(target)}. ${
            DAY_NAME[toDate(previous as string).getDay()]
          } ${originLoad.percent}%, ${DAY_NAME[target.getDay()]} ${targetLoad.percent}%.`
        : `Movida al ${DAY_NAME[target.getDay()]} a las ${formatTime(target)}.`,
      actionLabel: 'Deshacer',
      onAction: () => moveTask(taskId, previous ?? scheduledAtISO),
    })
  }

  return (
    <Screen wide>
      <div className="flex flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-title font-medium text-text">Tu semana</h2>
            <p className="text-aux text-muted">
              Arrastra un bloque a otro día u hora. Los bloques fijos no se mueven.
            </p>
            <p id="week-move-hint" className="sr-only">
              Con el teclado: Alt más flechas arriba y abajo mueve 15 minutos; Alt más flechas
              izquierda y derecha cambia de día.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              iconOnly
              aria-label="Semana anterior"
              onClick={() => setAnchor((value) => addDays(value, -7))}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </Button>
            <Button size="sm" onClick={() => setAnchor(weekStart(new Date()))}>
              Esta semana
            </Button>
            <Button
              size="sm"
              iconOnly
              aria-label="Semana siguiente"
              onClick={() => setAnchor((value) => addDays(value, 7))}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </header>

        {loading ? (
          <Skeleton className="h-[520px] w-full" />
        ) : (
          <WeekGrid
            days={days}
            tasks={tasks}
            availability={availability}
            onMove={onMove}
            onSelectDay={(date) => navigate(`/sobrecarga?dia=${dayKey(date)}`)}
          />
        )}

        <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 text-micro text-muted">
          <span className="flex items-center gap-2">
            <span className="h-3 w-[3px] rounded-full bg-accent" aria-hidden="true" />
            Flexible: se puede arrastrar
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-[3px] rounded-full bg-line" aria-hidden="true" />
            Bloque fijo o completado
          </span>
          <span className="flex items-center gap-2">
            <span className="h-px w-4 bg-accent" aria-hidden="true" />
            Hora actual
          </span>
          <span>Toca el anillo de un día para ver su carga.</span>
        </Card>
      </div>
    </Screen>
  )
}
