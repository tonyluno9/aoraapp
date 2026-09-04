export type Category = 'escuela' | 'trabajo' | 'salud' | 'personal' | 'deporte'
export type Priority = 'alta' | 'media' | 'baja'
export type TaskStatus = 'programada' | 'completada' | 'pendiente' | 'vencida'
export type TaskSource = 'voz' | 'texto' | 'manual' | 'calendario'
export type ExternalOrigin = 'google' | 'apple'
export type Recurrence = 'diaria' | 'semanal' | null

export interface Task {
  id: string
  title: string
  notes?: string
  category: Category
  priority: Priority
  status: TaskStatus
  /** Duración estimada en minutos. */
  durationMin: number
  /** ISO; null si está sin agendar. */
  scheduledAt: string | null
  deadline: string | null
  /** true = bloque fijo, no se puede mover. */
  locked: boolean
  source: TaskSource
  externalOrigin?: ExternalOrigin
  reminderMin?: number
  recurrence?: Recurrence
}

export interface FixedBlock {
  id: string
  label: string
  /** 0 domingo a 6 sábado. */
  days: number[]
  startMin: number
  endMin: number
}

export interface Availability {
  /** 0 domingo a 6 sábado. */
  days: number[]
  /** Minutos desde medianoche. */
  startMin: number
  endMin: number
  fixedBlocks: FixedBlock[]
}

export interface User {
  name: string
  email: string
  plan: 'gratis' | 'pro'
}

export type IntegrationId = 'google' | 'apple' | 'notion' | 'slack' | 'todoist' | 'teams'

export interface Integration {
  id: IntegrationId
  name: string
  description: string
  connected: boolean
  /** false = próximamente. */
  available: boolean
}

export type CapacityState = 'holgado' | 'equilibrado' | 'apretado' | 'sobrecargado'

export const CATEGORIES: Category[] = ['escuela', 'trabajo', 'salud', 'personal', 'deporte']
export const PRIORITIES: Priority[] = ['alta', 'media', 'baja']

export const CATEGORY_LABEL: Record<Category, string> = {
  escuela: 'escuela',
  trabajo: 'trabajo',
  salud: 'salud',
  personal: 'personal',
  deporte: 'deporte',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: 'prioridad alta',
  media: 'prioridad media',
  baja: 'prioridad baja',
}

export const STATE_LABEL: Record<CapacityState, string> = {
  holgado: 'Día holgado',
  equilibrado: 'Día equilibrado',
  apretado: 'Día apretado',
  sobrecargado: 'Día sobrecargado',
}
