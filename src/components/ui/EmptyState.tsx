import { CapacityRing } from '@/components/brand/CapacityRing'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title: string
  description: string
  /** Valor del anillo ilustrativo. */
  ringValue?: number
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  ringValue = 0,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-card border border-line bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <CapacityRing value={ringValue} size="md" showValue={false} label="Sin carga" />
      <div className="flex flex-col gap-1">
        <p className="text-body text-text">{title}</p>
        <p className="mx-auto max-w-xs text-aux text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}
