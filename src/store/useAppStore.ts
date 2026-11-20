import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Availability,
  FixedBlock,
  Integration,
  IntegrationId,
  Task,
  User,
} from '@/lib/types'
import type { ParsedTask } from '@/lib/parser'
import type { Suggestion } from '@/lib/capacity'
import { SEED_INTEGRATIONS, buildSeed } from '@/lib/seed'
import { scheduleTasks, type ScheduleResult } from '@/lib/scheduler'
import { addDays, atMinutes, startOfDay, toDate } from '@/lib/dates'
import { uid } from '@/lib/id'

interface AppState {
  user: User
  availability: Availability
  tasks: Task[]
  integrations: Integration[]
  authed: boolean
  onboarded: boolean
  scheduleConfigured: boolean
  lastRemoved: Task | null

  signIn: (email: string) => void
  updateUser: (patch: { name?: string; email?: string }) => void
  signOut: () => void
  finishOnboarding: () => void
  finishScheduleSetup: () => void

  addTask: (task: Omit<Task, 'id'>) => Task
  addParsedTasks: (parsed: ParsedTask[], source: Task['source']) => Task[]
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleComplete: (id: string) => void
  moveTask: (id: string, scheduledAtISO: string) => void
  postponeTask: (id: string, minutes: number) => void
  removeTask: (id: string) => void
  restoreLastRemoved: () => void

  scheduleAllPending: () => ScheduleResult
  applySuggestion: (suggestion: Suggestion) => void

  setAvailability: (patch: Partial<Omit<Availability, 'fixedBlocks'>>) => void
  addFixedBlock: (block: Omit<FixedBlock, 'id'>) => void
  removeFixedBlock: (id: string) => void

  setIntegration: (id: IntegrationId, connected: boolean) => void
  refreshStatuses: () => void
  resetDemo: () => void
}

function initialState() {
  const seed = buildSeed()
  return {
    user: seed.user,
    availability: seed.availability,
    tasks: seed.tasks,
    integrations: SEED_INTEGRATIONS.map((item) => ({ ...item })),
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState(),
      authed: false,
      onboarded: false,
      scheduleConfigured: false,
      lastRemoved: null,

      updateUser: (patch) =>
        set((state) => ({
          user: {
            ...state.user,
            name: patch.name?.trim() || state.user.name,
            email: patch.email?.trim() || state.user.email,
          },
        })),

      signIn: (email) =>
        set((state) => ({
          authed: true,
          user: { ...state.user, email: email.trim() || state.user.email },
        })),

      signOut: () => set({ authed: false }),
      finishOnboarding: () => set({ onboarded: true }),
      finishScheduleSetup: () => set({ scheduleConfigured: true }),

      addTask: (task) => {
        const created: Task = { ...task, id: uid('task') }
        set((state) => ({ tasks: [...state.tasks, created] }))
        return created
      },

      addParsedTasks: (parsed, source) => {
        const created: Task[] = parsed.map((item) => ({
          id: uid('task'),
          title: item.title,
          category: item.category,
          priority: item.priority,
          status: item.scheduledAt ? 'programada' : 'pendiente',
          durationMin: item.durationMin,
          scheduledAt: item.scheduledAt,
          deadline: item.deadline,
          locked: false,
          source,
          recurrence: null,
        }))
        set((state) => ({ tasks: [...state.tasks, ...created] }))
        return created
      },

      updateTask: (id, patch) =>
        set((state) => {
          // Un título vacío nunca se guarda.
          const safe =
            patch.title !== undefined && patch.title.trim().length === 0
              ? { ...patch, title: undefined }
              : patch
          return {
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...safe, title: safe.title?.trim() || task.title }
                : task,
            ),
          }
        }),

      toggleComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task
            if (task.status === 'completada') {
              return { ...task, status: task.scheduledAt ? 'programada' : 'pendiente' }
            }
            return { ...task, status: 'completada' }
          }),
        })),

      moveTask: (id, scheduledAtISO) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  scheduledAt: scheduledAtISO,
                  status: task.status === 'completada' ? 'completada' : 'programada',
                }
              : task,
          ),
        })),

      postponeTask: (id, minutes) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task
            const base = task.scheduledAt ? toDate(task.scheduledAt) : new Date()
            const next = new Date(base.getTime() + minutes * 60000)
            return { ...task, scheduledAt: next.toISOString(), status: 'programada' }
          }),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          lastRemoved: state.tasks.find((task) => task.id === id) ?? null,
        })),

      restoreLastRemoved: () =>
        set((state) =>
          state.lastRemoved
            ? { tasks: [...state.tasks, state.lastRemoved], lastRemoved: null }
            : state,
        ),

      scheduleAllPending: () => {
        const state = get()
        const toPlace = state.tasks.filter(
          (task) => task.status !== 'completada' && !task.scheduledAt,
        )
        const overdue = state.tasks.filter(
          (task) => task.status === 'vencida' && task.scheduledAt !== null,
        )
        const now = new Date()
        // Una fecha límite que ya pasó no puede respetarse: se busca el primer hueco libre
        // y la nueva fecha límite pasa a ser el final de ese día.
        const expired = (task: Task) =>
          task.deadline !== null && toDate(task.deadline).getTime() < now.getTime()
        const candidates = [...toPlace, ...overdue].map((task) =>
          expired(task) ? { ...task, deadline: null } : task,
        )
        const busy = state.tasks.filter((task) => !candidates.some((item) => item.id === task.id))
        const result = scheduleTasks(candidates, busy, state.availability, now)

        set({
          tasks: state.tasks.map((task) => {
            const placement = result.placements.find((item) => item.taskId === task.id)
            if (!placement) return task
            const deadline = expired(task)
              ? atMinutes(startOfDay(toDate(placement.scheduledAt)), 23 * 60 + 59).toISOString()
              : task.deadline
            return { ...task, scheduledAt: placement.scheduledAt, deadline, status: 'programada' }
          }),
        })

        return result
      },

      applySuggestion: (suggestion) => {
        const state = get()
        if (suggestion.kind === 'eliminar') {
          get().removeTask(suggestion.taskId)
          return
        }
        if (suggestion.kind === 'recortar' && suggestion.newDurationMin) {
          get().updateTask(suggestion.taskId, { durationMin: suggestion.newDurationMin })
          return
        }
        if (suggestion.kind === 'mover' && suggestion.targetDateISO) {
          const task = state.tasks.find((item) => item.id === suggestion.taskId)
          if (!task) return
          const others = state.tasks.filter((item) => item.id !== task.id)
          const targetDay = toDate(suggestion.targetDateISO)
          const result = scheduleTasks(
            [{ ...task, scheduledAt: null }],
            others,
            state.availability,
            targetDay,
          )
          const placement = result.placements[0]
          const fallback = atMinutes(targetDay, state.availability.startMin).toISOString()
          get().moveTask(task.id, placement ? placement.scheduledAt : fallback)
        }
      },

      setAvailability: (patch) =>
        set((state) => ({ availability: { ...state.availability, ...patch } })),

      addFixedBlock: (block) =>
        set((state) => ({
          availability: {
            ...state.availability,
            fixedBlocks: [...state.availability.fixedBlocks, { ...block, id: uid('block') }],
          },
        })),

      removeFixedBlock: (id) =>
        set((state) => ({
          availability: {
            ...state.availability,
            fixedBlocks: state.availability.fixedBlocks.filter((block) => block.id !== id),
          },
        })),

      setIntegration: (id, connected) =>
        set((state) => ({
          integrations: state.integrations.map((item) =>
            item.id === id ? { ...item, connected } : item,
          ),
        })),

      refreshStatuses: () =>
        set((state) => {
          const now = Date.now()
          return {
            tasks: state.tasks.map((task) => {
              if (task.status === 'completada') return task
              const overdue = task.deadline ? toDate(task.deadline).getTime() < now : false
              if (overdue && task.status !== 'vencida') return { ...task, status: 'vencida' }
              if (!overdue && task.status === 'vencida') {
                return { ...task, status: task.scheduledAt ? 'programada' : 'pendiente' }
              }
              return task
            }),
          }
        }),

      resetDemo: () =>
        set({
          ...initialState(),
          lastRemoved: null,
        }),
    }),
    {
      name: 'aoraa-task',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        availability: state.availability,
        tasks: state.tasks,
        integrations: state.integrations,
        authed: state.authed,
        onboarded: state.onboarded,
        scheduleConfigured: state.scheduleConfigured,
      }),
    },
  ),
)

/** Tareas visibles: las de un calendario desconectado no se muestran. */
export function visibleTasks(tasks: Task[], integrations: Integration[]): Task[] {
  return tasks.filter((task) => {
    if (!task.externalOrigin) return true
    const integration = integrations.find((item) => item.id === task.externalOrigin)
    return integration ? integration.connected : true
  })
}

export function useVisibleTasks(): Task[] {
  const tasks = useAppStore((state) => state.tasks)
  const integrations = useAppStore((state) => state.integrations)
  return visibleTasks(tasks, integrations)
}

export function nextWeekDay(from: Date, offset: number): Date {
  return addDays(from, offset)
}
