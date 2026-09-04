import { cn } from '@/lib/cn'
import { AppIcon } from './AppIcon'

interface LogoProps {
  /** Oculta el nombre y deja solo el símbolo. */
  compact?: boolean
  size?: number
  className?: string
}

export function Logo({ compact = false, size = 32, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <AppIcon size={size} />
      {!compact && (
        <span className="text-body font-medium tracking-[0.14em] text-text">AORAA TASK</span>
      )}
    </span>
  )
}
