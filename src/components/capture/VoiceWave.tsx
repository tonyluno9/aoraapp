import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface VoiceWaveProps {
  active: boolean
  bars?: number
  className?: string
}

/** Onda de audio: barras que respiran mientras se dicta. */
export function VoiceWave({ active, bars = 28, className }: VoiceWaveProps) {
  const reduceMotion = useReducedMotion()
  const heights = Array.from({ length: bars }, (_, index) => 0.35 + Math.abs(Math.sin(index * 1.7)) * 0.65)

  return (
    <div
      className={cn('flex h-16 items-center justify-center gap-1', className)}
      aria-hidden="true"
    >
      {heights.map((height, index) => (
        <motion.span
          key={index}
          className={cn('w-1 rounded-full', active ? 'bg-accent' : 'bg-line')}
          style={{ height: `${Math.round(height * 100)}%` }}
          initial={{ scaleY: 0.25 }}
          animate={
            active && !reduceMotion
              ? { scaleY: [0.25, 1, 0.45, 0.9, 0.3] }
              : { scaleY: 0.35 }
          }
          transition={
            active && !reduceMotion
              ? {
                  duration: 1.4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: index * 0.045,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  )
}
