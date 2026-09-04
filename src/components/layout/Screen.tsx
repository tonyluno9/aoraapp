import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ScreenProps {
  children: React.ReactNode
  /** Contenedor ancho, para la vista semanal. */
  wide?: boolean
  className?: string
}

export function Screen({ children, wide = false, className }: ScreenProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'mx-auto w-full px-4 py-6 nav:px-8 nav:py-8',
        wide ? 'max-w-6xl' : 'max-w-3xl',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
