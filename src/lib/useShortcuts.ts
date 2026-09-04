import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/useUIStore'

/** Atajos globales: ⌘K paleta, N nueva tarea, T hoy, W semana. */
export function useShortcuts(): void {
  const navigate = useNavigate()
  const togglePalette = useUIStore((state) => state.togglePalette)
  const openCapture = useUIStore((state) => state.openCapture)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        togglePalette()
        return
      }

      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (document.querySelector('[role="dialog"]')) return

      const key = event.key.toLowerCase()
      if (key === 'n') {
        event.preventDefault()
        openCapture()
      } else if (key === 't') {
        navigate('/hoy')
      } else if (key === 'w') {
        navigate('/semana')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, openCapture, togglePalette])
}
