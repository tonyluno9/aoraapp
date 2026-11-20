import type { Availability, Category, Integration, Priority, Task, User } from './types'
import { addDays, atMinutes, isSameDate, startOfDay } from './dates'
import { scheduleTasks } from './scheduler'

export interface SeedData {
  user: User
  availability: Availability
  tasks: Task[]
}

export const SEED_USER: User = {
  name: 'Marcelo Guzmán',
  email: 'marcelo@correo.com',
  plan: 'pro',
}

export const SEED_AVAILABILITY: Availability = {
  days: [1, 2, 3, 4, 5, 6],
  startMin: 7 * 60,
  endMin: 22 * 60,
  fixedBlocks: [
    {
      id: 'block-clases',
      label: 'Clases',
      days: [1, 2, 3, 4, 5],
      startMin: 9 * 60,
      endMin: 14 * 60,
    },
    {
      id: 'block-cafeteria',
      label: 'Turno en la cafetería',
      days: [1, 3, 5],
      startMin: 16 * 60,
      endMin: 20 * 60,
    },
    {
      id: 'block-sabado-am',
      label: 'Sábado fuera de horario',
      days: [6],
      startMin: 7 * 60,
      endMin: 9 * 60,
    },
    {
      id: 'block-sabado-pm',
      label: 'Sábado fuera de horario',
      days: [6],
      startMin: 18 * 60,
      endMin: 22 * 60,
    },
  ],
}

export const SEED_INTEGRATIONS: Integration[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    description: 'Trae tus eventos y respeta tus bloques ocupados.',
    connected: true,
    available: true,
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    description: 'Sincroniza los eventos de tu iPhone.',
    connected: true,
    available: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Convierte tus bases de datos en tareas.',
    connected: false,
    available: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Captura tareas desde un mensaje.',
    connected: false,
    available: false,
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Importa tus proyectos y etiquetas.',
    connected: false,
    available: false,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Agenda alrededor de tus reuniones.',
    connected: false,
    available: false,
  },
]

function nextWeekday(from: Date, weekday: number): Date {
  const base = startOfDay(from)
  const diff = (weekday - base.getDay() + 7) % 7
  return addDays(base, diff)
}

/** Evita caer en domingo, que no tiene horario disponible. */
function skipSunday(date: Date): Date {
  return date.getDay() === 0 ? addDays(date, 1) : date
}

interface Draft {
  id: string
  title: string
  category: Category
  priority: Priority
  durationMin: number
  day: Date
  startMin?: number
  status?: Task['status']
  locked?: boolean
  notes?: string
  source?: Task['source']
  externalOrigin?: Task['externalOrigin']
  reminderMin?: number
  deadlineDay?: Date
  deadlineMin?: number
  unscheduled?: boolean
  recurrence?: Task['recurrence']
}

function toTask(draft: Draft): Task {
  const scheduled =
    draft.unscheduled || draft.startMin === undefined
      ? null
      : atMinutes(draft.day, draft.startMin).toISOString()

  const deadline = draft.deadlineDay
    ? atMinutes(draft.deadlineDay, draft.deadlineMin ?? 23 * 60 + 59).toISOString()
    : null

  return {
    id: draft.id,
    title: draft.title,
    notes: draft.notes,
    category: draft.category,
    priority: draft.priority,
    status: draft.status ?? 'programada',
    durationMin: draft.durationMin,
    scheduledAt: scheduled,
    deadline,
    locked: draft.locked ?? false,
    source: draft.source ?? 'manual',
    externalOrigin: draft.externalOrigin,
    reminderMin: draft.reminderMin,
    recurrence: draft.recurrence ?? null,
  }
}

/**
 * Datos de semilla: 28 tareas entre esta semana y la siguiente,
 * con el martes deliberadamente al 118% de carga.
 */
export function buildSeed(now: Date = new Date()): SeedData {
  const today = startOfDay(now)
  const tuesday = nextWeekday(today, 2)

  const drafts: Draft[] = [
    // Martes sobrecargado: 705 minutos sobre 600 disponibles.
    {
      id: 'seed-01',
      title: 'Repasar apuntes de Física',
      category: 'escuela',
      priority: 'media',
      durationMin: 75,
      day: tuesday,
      startMin: 7 * 60,
    },
    {
      id: 'seed-02',
      title: 'Estudiar para el examen de Física',
      category: 'escuela',
      priority: 'alta',
      durationMin: 120,
      day: tuesday,
      startMin: 14 * 60,
      deadlineDay: tuesday,
      notes: 'Capítulos 4 y 5, más los ejercicios que dejó el profesor.',
      reminderMin: 30,
    },
    {
      id: 'seed-03',
      title: 'Llamar al dentista',
      category: 'salud',
      priority: 'media',
      durationMin: 45,
      day: tuesday,
      startMin: 8 * 60 + 15,
    },
    {
      id: 'seed-04',
      title: 'Terminar diapositivas de Ética',
      category: 'escuela',
      priority: 'alta',
      durationMin: 120,
      day: tuesday,
      startMin: 16 * 60,
      deadlineDay: addDays(tuesday, 1),
    },
    {
      id: 'seed-05',
      title: 'Junta con el equipo de tesis',
      category: 'trabajo',
      priority: 'alta',
      durationMin: 90,
      day: tuesday,
      startMin: 18 * 60,
      locked: true,
      source: 'calendario',
      externalOrigin: 'google',
    },
    {
      id: 'seed-06',
      title: 'Entrenamiento de natación',
      category: 'deporte',
      priority: 'media',
      durationMin: 90,
      day: tuesday,
      startMin: 19 * 60 + 30,
      recurrence: 'semanal',
    },
    {
      id: 'seed-07',
      title: 'Comprar despensa',
      category: 'personal',
      priority: 'baja',
      durationMin: 45,
      day: tuesday,
      startMin: 21 * 60,
    },
    {
      id: 'seed-08',
      title: 'Revisar el código de la práctica',
      category: 'escuela',
      priority: 'media',
      durationMin: 120,
      day: tuesday,
      startMin: 21 * 60 + 45,
    },

    // Completadas.
    {
      id: 'seed-09',
      title: 'Entregar la tarea de Álgebra',
      category: 'escuela',
      priority: 'alta',
      durationMin: 45,
      day: addDays(today, -1),
      startMin: 14 * 60 + 15,
      status: 'completada',
    },
    {
      id: 'seed-10',
      title: 'Correr en el parque',
      category: 'deporte',
      priority: 'baja',
      durationMin: 60,
      day: addDays(today, -1),
      startMin: 7 * 60,
      status: 'completada',
    },
    {
      id: 'seed-11',
      title: 'Pagar la mensualidad',
      category: 'personal',
      priority: 'alta',
      durationMin: 20,
      day: addDays(today, -2),
      startMin: 15 * 60,
      status: 'completada',
    },
    {
      id: 'seed-12',
      title: 'Revisar los correos del turno',
      category: 'trabajo',
      priority: 'media',
      durationMin: 30,
      day: addDays(today, -2),
      startMin: 15 * 60 + 30,
      status: 'completada',
    },
    {
      id: 'seed-13',
      title: 'Comprar café para la semana',
      category: 'personal',
      priority: 'baja',
      durationMin: 30,
      day: addDays(today, -3),
      startMin: 14 * 60 + 45,
      status: 'completada',
    },
    {
      id: 'seed-14',
      title: 'Leer el capítulo 4 de Ética',
      category: 'escuela',
      priority: 'media',
      durationMin: 60,
      day: addDays(today, -3),
      startMin: 20 * 60,
      status: 'completada',
    },

    // Vencidas.
    {
      id: 'seed-15',
      title: 'Renovar la credencial',
      category: 'personal',
      priority: 'media',
      durationMin: 60,
      day: addDays(today, -2),
      startMin: 14 * 60,
      status: 'vencida',
      deadlineDay: addDays(today, -1),
      notes: 'Llevar comprobante de inscripción y una foto tamaño infantil.',
    },
    {
      id: 'seed-16',
      title: 'Entregar el reporte de Estadística',
      category: 'escuela',
      priority: 'alta',
      durationMin: 45,
      day: addDays(today, -1),
      startMin: 15 * 60 + 15,
      status: 'vencida',
      deadlineDay: addDays(today, -1),
    },
    {
      id: 'seed-17',
      title: 'Confirmar la cita del dentista',
      category: 'salud',
      priority: 'media',
      durationMin: 15,
      day: addDays(today, -3),
      startMin: 14 * 60 + 15,
      status: 'vencida',
      deadlineDay: addDays(today, -2),
    },

    // Sin agendar.
    {
      id: 'seed-18',
      title: 'Comprar los materiales del laboratorio',
      category: 'escuela',
      priority: 'media',
      durationMin: 45,
      day: today,
      unscheduled: true,
      status: 'pendiente',
      deadlineDay: skipSunday(addDays(today, 5)),
    },
    {
      id: 'seed-19',
      title: 'Escribir el ensayo de Ética',
      category: 'escuela',
      priority: 'alta',
      durationMin: 90,
      day: today,
      unscheduled: true,
      status: 'pendiente',
      deadlineDay: skipSunday(addDays(today, 6)),
      notes: 'Dos cuartillas sobre el dilema del tranvía.',
    },
    {
      id: 'seed-20',
      title: 'Actualizar el currículum',
      category: 'trabajo',
      priority: 'baja',
      durationMin: 60,
      day: today,
      unscheduled: true,
      status: 'pendiente',
    },
    {
      id: 'seed-21',
      title: 'Agendar consulta con el médico',
      category: 'salud',
      priority: 'media',
      durationMin: 30,
      day: today,
      unscheduled: true,
      status: 'pendiente',
      deadlineDay: skipSunday(addDays(today, 9)),
    },

    // Repartidas en la semana actual y la siguiente.
    {
      id: 'seed-22',
      title: 'Preparar la exposición de Cálculo',
      category: 'escuela',
      priority: 'alta',
      durationMin: 90,
      day: skipSunday(addDays(today, 1)),
      startMin: 14 * 60,
      deadlineDay: skipSunday(addDays(today, 2)),
    },
    {
      id: 'seed-23',
      title: 'Junta con el asesor de tesis',
      category: 'trabajo',
      priority: 'alta',
      durationMin: 60,
      day: skipSunday(addDays(today, 3)),
      startMin: 14 * 60 + 30,
      locked: true,
      source: 'calendario',
      externalOrigin: 'google',
    },
    {
      id: 'seed-24',
      title: 'Estudiar para el examen de Cálculo',
      category: 'escuela',
      priority: 'alta',
      durationMin: 120,
      day: skipSunday(addDays(today, 8)),
      startMin: 14 * 60,
      deadlineDay: skipSunday(addDays(today, 9)),
    },
    {
      id: 'seed-25',
      title: 'Cita con el dentista',
      category: 'salud',
      priority: 'media',
      durationMin: 60,
      day: skipSunday(addDays(today, 9)),
      startMin: 15 * 60,
      locked: true,
      source: 'calendario',
      externalOrigin: 'apple',
      reminderMin: 60,
    },
  ]

  const tasks = drafts.map(toTask)

  // Tres tareas para el día en curso, acomodadas por el motor en huecos reales.
  const focusDay = isSameDate(today, tuesday) ? addDays(today, 1) : today
  const pending: Task[] = [
    {
      id: 'seed-26',
      title: 'Terminar la práctica de Programación',
      category: 'escuela',
      priority: 'alta',
      status: 'programada',
      durationMin: 90,
      scheduledAt: null,
      deadline: atMinutes(focusDay, 23 * 60 + 59).toISOString(),
      locked: false,
      source: 'texto',
      notes: 'Falta la parte de pruebas.',
    },
    {
      id: 'seed-27',
      title: 'Comprar despensa de la semana',
      category: 'personal',
      priority: 'media',
      status: 'programada',
      durationMin: 60,
      scheduledAt: null,
      deadline: atMinutes(focusDay, 23 * 60 + 59).toISOString(),
      locked: false,
      source: 'voz',
    },
    {
      id: 'seed-28',
      title: 'Entrenamiento de natación',
      category: 'deporte',
      priority: 'media',
      status: 'programada',
      durationMin: 90,
      scheduledAt: null,
      deadline: atMinutes(focusDay, 23 * 60 + 59).toISOString(),
      locked: false,
      source: 'manual',
      recurrence: 'semanal',
    },
  ]

  const { placements } = scheduleTasks(
    pending,
    tasks,
    SEED_AVAILABILITY,
    startOfDay(focusDay),
  )

  for (const task of pending) {
    const placement = placements.find((item) => item.taskId === task.id)
    tasks.push(placement ? { ...task, scheduledAt: placement.scheduledAt } : { ...task, status: 'pendiente' })
  }

  return { user: SEED_USER, availability: SEED_AVAILABILITY, tasks }
}
