import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface ToastOptions {
  message: string
  /** Texto del botón de la derecha, por ejemplo "Deshacer". */
  actionLabel?: string
  onAction?: () => void
  tone?: 'neutral' | 'warn' | 'danger'
  durationMs?: number
}

interface ToastItem extends ToastOptions {
  id: string
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const push = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setItems((current) => [...current.slice(-2), { ...options, id }])
      // Con una acción (por ejemplo, Deshacer) damos más tiempo para alcanzarla con el teclado.
      const duration = options.durationMs ?? (options.actionLabel ? 10000 : 4000)
      const timer = window.setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          role="status"
          aria-live="polite"
        >
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-4 rounded-button border border-line bg-elevated px-4 py-3 shadow-modal"
              >
                <p
                  className={cn(
                    'text-aux',
                    item.tone === 'warn'
                      ? 'text-warn'
                      : item.tone === 'danger'
                        ? 'text-danger'
                        : 'text-text',
                  )}
                >
                  {item.message}
                </p>
                {item.actionLabel && (
                  <button
                    type="button"
                    className="shrink-0 rounded-button px-1 text-aux font-medium text-accent transition-colors duration-150 ease-out hover:text-text"
                    onClick={() => {
                      item.onAction?.()
                      dismiss(item.id)
                    }}
                  >
                    {item.actionLabel}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

/** Devuelve la función para mostrar un aviso emergente. */
export function useToast(): (options: ToastOptions) => void {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider')
  return context
}
