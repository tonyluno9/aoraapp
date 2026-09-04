import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useDismissable } from '@/lib/useDismissable'
import { useIsDesktop } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'
import { Button } from './Button'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** Contenido fijo al pie de la hoja. */
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/** Hoja modal: sube desde abajo en móvil, panel centrado en escritorio. */
export function Sheet({ open, onClose, title, footer, children, className }: SheetProps) {
  const panelRef = useDismissable(open, onClose)
  const isDesktop = useIsDesktop()
  const reduceMotion = useReducedMotion()

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isDesktop
      ? {
          initial: { opacity: 0, scale: 0.97 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.97 },
        }
      : {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
        }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-ink/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            {...panelMotion}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden border border-line bg-elevated shadow-modal',
              'rounded-t-modal sm:max-w-lg sm:rounded-modal',
              className,
            )}
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-line" aria-hidden="true" />
            </div>

            <header className="flex items-center justify-between gap-4 px-5 pb-4 pt-4">
              <h2 className="text-subtitle font-medium text-text">{title}</h2>
              <Button variant="ghost" size="sm" iconOnly aria-label="Cerrar" onClick={onClose}>
                <X size={16} aria-hidden="true" />
              </Button>
            </header>

            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-5">{children}</div>

            {footer && (
              <footer className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
