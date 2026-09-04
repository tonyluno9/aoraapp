import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useDismissable } from '@/lib/useDismissable'
import { useIsDesktop } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'
import { Button } from './Button'

type ModalSize = 'sm' | 'md' | 'lg'

const SIZES: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-2xl',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: ModalSize
  footer?: React.ReactNode
  children: React.ReactNode
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: ModalProps) {
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
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 32 },
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
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden border border-line bg-elevated shadow-modal',
              'rounded-t-modal sm:rounded-modal',
              SIZES[size],
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-subtitle font-medium text-text">{title}</h2>
                {description && <p className="text-aux text-muted">{description}</p>}
              </div>
              <Button variant="ghost" size="sm" iconOnly aria-label="Cerrar" onClick={onClose}>
                <X size={16} aria-hidden="true" />
              </Button>
            </header>

            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
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
