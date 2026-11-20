import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PALETTE_SHORTCUT } from '@/lib/platform'
import { Mic, Search } from 'lucide-react'
import { Button } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { SCREEN_TITLE } from './navItems'

interface TopBarProps {
  onCapture: () => void
  onSearch: () => void
}

export function TopBar({ onCapture, onSearch }: TopBarProps) {
  const location = useLocation()
  const title = location.pathname.startsWith('/tarea/')
    ? 'Tarea'
    : (SCREEN_TITLE[location.pathname] ?? 'AORAA Task')

  useEffect(() => {
    document.title = title === 'AORAA Task' ? title : `${title} · AORAA Task`
  }, [title])

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-ink/90 px-4 py-3 backdrop-blur nav:px-8">
      <div className="flex items-center gap-3">
        <span className="nav:hidden">
          <Logo compact size={28} />
        </span>
        <h1 className="text-subtitle font-medium text-text">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onSearch} aria-label="Buscar o saltar">
          <Search size={16} aria-hidden="true" />
          <span className="hidden nav:inline">Buscar</span>
          <span className="hidden text-micro text-muted nav:inline">{PALETTE_SHORTCUT}</span>
        </Button>
        <span className="hidden nav:inline">
          <Button variant="secondary" size="sm" onClick={onCapture}>
            <Mic size={16} aria-hidden="true" />
            Capturar
          </Button>
        </span>
      </div>
    </header>
  )
}
