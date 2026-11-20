import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

export type RingSize = 'sm' | 'md' | 'lg'

const GEOMETRY: Record<RingSize, { box: number; stroke: number }> = {
  sm: { box: 28, stroke: 3 },
  md: { box: 56, stroke: 5 },
  lg: { box: 132, stroke: 9 },
}

interface CapacityRingProps {
  /** Porcentaje de carga. Puede pasar de 100. */
  value: number
  size?: RingSize
  /** Muestra el porcentaje al centro. */
  showValue?: boolean
  /** Contenido alterno al centro del anillo. */
  children?: React.ReactNode
  className?: string
  /** Etiqueta accesible del anillo. El porcentaje se agrega solo. */
  label?: string
  /** Oculta el anillo a lectores de pantalla cuando solo adorna. */
  decorative?: boolean
}

export function CapacityRing({
  value,
  size = 'md',
  showValue,
  children,
  className,
  label,
  decorative = false,
}: CapacityRingProps) {
  const reduceMotion = useReducedMotion()
  const { box, stroke } = GEOMETRY[size]
  const radius = (box - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const filled = Math.max(0, Math.min(100, value))
  const offset = circumference * (1 - filled / 100)
  const overloaded = value > 100
  const withValue = showValue ?? size !== 'sm'

  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: box, height: box }}
      {...(decorative
        ? { 'aria-hidden': true }
        : {
            role: 'img',
            'aria-label': `${label ?? 'Carga'}: ${Math.round(value)} por ciento`,
          })}
    >
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line"
        />
        <motion.circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={overloaded ? 'stroke-warn' : 'stroke-accent'}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
          initial={{ strokeDashoffset: reduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {(children || withValue) && (
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          {children ?? (
            <span
              className={cn(
                'font-medium tabular-nums',
                size === 'lg' ? 'text-title' : 'text-micro',
                overloaded ? 'text-warn' : 'text-text',
              )}
            >
              {Math.round(value)}
              <span className={size === 'lg' ? 'text-subtitle text-muted' : 'text-muted'}>%</span>
            </span>
          )}
        </span>
      )}
    </div>
  )
}
