import { NavLink } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { Button } from '@/components/ui'
import { NAV_ITEMS } from './navItems'
import { cn } from '@/lib/cn'
import { formatDuration } from '@/lib/dates'
import { PALETTE_SHORTCUT } from '@/lib/platform'
import type { DayCapacity } from '@/lib/capacity'

interface SidebarProps {
  today: DayCapacity
  onCapture: () => void
}

export function Sidebar({ today, onCapture }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-line bg-surface px-4 py-6 nav:flex">
      <Logo />

      <Button variant="primary" fullWidth onClick={onCapture}>
        <Mic size={16} aria-hidden="true" />
        Capturar
      </Button>

      <nav className="flex flex-col gap-1" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-button px-3 py-2 text-aux transition-colors duration-150 ease-out',
                isActive
                  ? 'bg-elevated text-text'
                  : 'text-muted hover:bg-elevated hover:text-text',
              )
            }
          >
            <item.icon size={16} aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-card border border-line bg-elevated p-3">
          <CapacityRing value={today.percent} size="sm" label="Carga de hoy" />
          <div className="flex flex-col">
            <span className="text-aux text-text">Hoy al {today.percent}%</span>
            <span className="text-micro text-muted">
              {formatDuration(today.freeMin)} libres
            </span>
          </div>
        </div>
        <p className="px-1 text-micro text-muted">
          Presiona <kbd className="font-sans text-text">{PALETTE_SHORTCUT}</kbd> para buscar o
          saltar.
        </p>
      </div>
    </aside>
  )
}
