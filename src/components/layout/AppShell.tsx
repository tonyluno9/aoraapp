import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { CaptureSheet } from '@/components/capture/CaptureSheet'
import { useAppStore, useVisibleTasks } from '@/store/useAppStore'
import { useUIStore } from '@/store/useUIStore'
import { useShortcuts } from '@/lib/useShortcuts'
import { computeDayCapacity } from '@/lib/capacity'

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const captureOpen = useUIStore((state) => state.captureOpen)
  const openCapture = useUIStore((state) => state.openCapture)
  const closeCapture = useUIStore((state) => state.closeCapture)
  const setPalette = useUIStore((state) => state.setPalette)
  const availability = useAppStore((state) => state.availability)
  const refreshStatuses = useAppStore((state) => state.refreshStatuses)
  const tasks = useVisibleTasks()

  useShortcuts()

  // Al cambiar de pantalla, el foco va al contenido para que el lector de pantalla
  // anuncie la nueva vista en lugar de quedarse en el enlace que se pulsó.
  const mainRef = useRef<HTMLElement | null>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    refreshStatuses()
  }, [refreshStatuses])

  useEffect(() => {
    if (location.pathname === '/capturar') openCapture()
  }, [location.pathname, openCapture])

  const closeSheet = () => {
    closeCapture()
    if (location.pathname === '/capturar') navigate('/hoy')
  }

  const todayCapacity = computeDayCapacity(new Date(), tasks, availability)

  return (
    <div className="flex min-h-screen bg-ink">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-button focus:bg-accent focus:px-4 focus:py-2 focus:text-aux focus:font-medium focus:text-ink"
      >
        Saltar al contenido
      </a>
      <Sidebar today={todayCapacity} onCapture={openCapture} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar onCapture={openCapture} onSearch={() => setPalette(true)} />
        <main
          id="contenido"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 pb-28 focus:outline-none focus-visible:ring-0 nav:pb-10"
        >
          <Outlet />
        </main>
      </div>

      <BottomNav onCapture={openCapture} />
      <CaptureSheet open={captureOpen} onClose={closeSheet} />
      <CommandPalette />
    </div>
  )
}
