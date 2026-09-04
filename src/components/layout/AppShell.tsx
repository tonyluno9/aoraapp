import { useEffect } from 'react'
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
      <Sidebar today={todayCapacity} onCapture={openCapture} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar onCapture={openCapture} onSearch={() => setPalette(true)} />
        <main className="flex-1 pb-28 nav:pb-10">
          <Outlet />
        </main>
      </div>

      <BottomNav onCapture={openCapture} />
      <CaptureSheet open={captureOpen} onClose={closeSheet} />
      <CommandPalette />
    </div>
  )
}
