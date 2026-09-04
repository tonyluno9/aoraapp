import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
  /** Redondeo completo, para avatares y píldoras. */
  circle?: boolean
}

export function Skeleton({ className, circle = false }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-elevated',
        circle ? 'rounded-full' : 'rounded-card',
        className,
      )}
    />
  )
}
