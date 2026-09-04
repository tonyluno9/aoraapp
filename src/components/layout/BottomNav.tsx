import { NavLink } from 'react-router-dom'
import { CalendarDays, Inbox, Mic, Sun, UserRound } from 'lucide-react'
import { cn } from '@/lib/cn'

const ITEMS = [
  { to: '/hoy', label: 'Hoy', icon: Sun },
  { to: '/semana', label: 'Semana', icon: CalendarDays },
  { to: '/pendientes', label: 'Pendientes', icon: Inbox },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]

interface BottomNavProps {
  onCapture: () => void
}

export function BottomNav({ onCapture }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-surface px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 nav:hidden"
    >
      {ITEMS.slice(0, 2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}

      <button
        type="button"
        onClick={onCapture}
        aria-label="Capturar tarea"
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-accent text-ink transition-colors duration-150 ease-out hover:bg-accent/90"
      >
        <Mic size={20} aria-hidden="true" />
      </button>

      {ITEMS.slice(2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: typeof Sun
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex w-16 flex-col items-center gap-1 rounded-button py-1 text-micro transition-colors duration-150 ease-out',
          isActive ? 'text-text' : 'text-muted',
        )
      }
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </NavLink>
  )
}
