import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface TooltipProps {
  label: string
  side?: 'top' | 'bottom'
  children: React.ReactNode
  className?: string
}

export function Tooltip({ label, side = 'top', children, className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 whitespace-nowrap',
              'rounded-button border border-line bg-elevated px-2 py-1 text-micro text-text',
              side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
