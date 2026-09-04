import { cn } from '@/lib/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Resalta el borde y agrega estado de hover. */
  interactive?: boolean
  padded?: boolean
}

export function Card({
  interactive = false,
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface',
        padded && 'p-4',
        interactive && 'transition-colors duration-150 ease-out hover:border-muted/40',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
