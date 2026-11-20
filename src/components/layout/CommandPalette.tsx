import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleDot,
  Inbox,
  Link2,
  Mic,
  Search,
  Sliders,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useAppStore, useVisibleTasks } from '@/store/useAppStore'
import { useDismissable } from '@/lib/useDismissable'
import { formatRelativeDay, formatTime } from '@/lib/dates'
import { cn } from '@/lib/cn'

interface Command {
  id: string
  label: string
  hint: string
  icon: LucideIcon
  run: () => void
}

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function CommandPalette() {
  const open = useUIStore((state) => state.paletteOpen)
  const setPalette = useUIStore((state) => state.setPalette)
  const openCapture = useUIStore((state) => state.openCapture)
  const toggleComplete = useAppStore((state) => state.toggleComplete)
  const tasks = useVisibleTasks()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  const close = () => setPalette(false)
  const panelRef = useDismissable(open, close)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setCursor(0)
    }
  }, [open])

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => {
      setPalette(false)
      navigate(to)
    }

    const base: Command[] = [
      { id: 'nav-hoy', label: 'Ir a Hoy', hint: 'Pantalla principal', icon: Sun, run: go('/hoy') },
      {
        id: 'nav-semana',
        label: 'Ir a Semana',
        hint: 'Cuadrícula semanal',
        icon: CalendarDays,
        run: go('/semana'),
      },
      {
        id: 'nueva',
        label: 'Nueva tarea',
        hint: 'Abre la captura',
        icon: Mic,
        run: () => {
          setPalette(false)
          openCapture()
        },
      },
      {
        id: 'nav-pendientes',
        label: 'Ir a Pendientes',
        hint: 'Sin agendar y vencidas',
        icon: Inbox,
        run: go('/pendientes'),
      },
      {
        id: 'nav-conexiones',
        label: 'Ir a Conexiones',
        hint: 'Calendarios y apps',
        icon: Link2,
        run: go('/conexiones'),
      },
      {
        id: 'nav-planes',
        label: 'Ir a Planes',
        hint: 'Gratis y Pro',
        icon: Sparkles,
        run: go('/planes'),
      },
      {
        id: 'nav-perfil',
        label: 'Ir a Perfil',
        hint: 'Tu cuenta',
        icon: UserRound,
        run: go('/perfil'),
      },
      {
        id: 'nav-horario',
        label: 'Configurar horario',
        hint: 'Días, horas y bloques fijos',
        icon: Sliders,
        run: go('/configurar-horario'),
      },
      {
        id: 'nav-bienvenida',
        label: 'Ver la bienvenida',
        hint: 'Los tres pasos del inicio',
        icon: CircleDot,
        run: go('/bienvenida'),
      },
    ]

    const term = fold(query.trim())
    const matches = term.length === 0 ? [] : tasks.filter((task) => fold(task.title).includes(term))

    const taskCommands: Command[] = matches.slice(0, 6).flatMap((task) => {
      const when = task.scheduledAt
        ? `${formatRelativeDay(task.scheduledAt)} a las ${formatTime(task.scheduledAt)}`
        : 'sin agendar'

      const items: Command[] = [
        {
          id: `abrir-${task.id}`,
          label: task.title,
          hint: when,
          icon: ArrowRight,
          run: () => {
            setPalette(false)
            navigate(`/tarea/${task.id}`)
          },
        },
      ]

      if (task.status !== 'completada') {
        items.push({
          id: `completar-${task.id}`,
          label: `Completar "${task.title}"`,
          hint: 'Marcar como hecha',
          icon: Check,
          run: () => {
            setPalette(false)
            toggleComplete(task.id)
          },
        })
      }

      return items
    })

    const filteredBase =
      term.length === 0 ? base : base.filter((command) => fold(command.label).includes(term))

    return [...taskCommands, ...filteredBase]
  }, [query, tasks, navigate, openCapture, setPalette, toggleComplete])

  useEffect(() => {
    setCursor(0)
  }, [query])

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((value) => (commands.length === 0 ? 0 : (value + 1) % commands.length))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((value) =>
        commands.length === 0 ? 0 : (value - 1 + commands.length) % commands.length,
      )
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      commands[cursor]?.run()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-ink/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Paleta de comandos"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-modal border border-line bg-elevated shadow-modal"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search size={16} className="text-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Busca una tarea o salta a una pantalla"
                aria-label="Buscar"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-autocomplete="list"
                aria-activedescendant={
                  commands[cursor] ? `command-${commands[cursor].id}` : undefined
                }
                className="w-full bg-transparent text-body text-text placeholder:text-muted focus:outline-none"
              />
            </div>

            <p className="sr-only" aria-live="polite">
              {commands.length === 0
                ? 'Sin resultados'
                : `${commands.length} ${commands.length === 1 ? 'resultado' : 'resultados'}`}
            </p>

            {commands.length === 0 && (
              <p className="px-4 py-6 text-center text-aux text-muted">
                Nada coincide con &ldquo;{query}&rdquo;.
              </p>
            )}

            <ul
              id="command-list"
              role="listbox"
              aria-label="Resultados"
              className="scrollbar-thin max-h-80 overflow-y-auto py-2 empty:hidden"
            >
              {commands.map((command, index) => (
                <li
                  key={command.id}
                  id={`command-${command.id}`}
                  role="option"
                  aria-selected={index === cursor}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={command.run}
                    onMouseEnter={() => setCursor(index)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ease-out',
                      index === cursor ? 'bg-surface text-text' : 'text-muted hover:text-text',
                    )}
                  >
                    <command.icon size={16} aria-hidden="true" />
                    <span className="flex-1 truncate text-aux text-text">{command.label}</span>
                    <span className="text-micro text-muted">{command.hint}</span>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="flex items-center gap-4 border-t border-line px-4 py-2 text-micro text-muted">
              <span>↑↓ para moverte</span>
              <span>Enter para abrir</span>
              <span>Esc para cerrar</span>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
