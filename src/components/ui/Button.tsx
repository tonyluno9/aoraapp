import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-ink hover:bg-accent/90 active:bg-accent/80 border border-accent',
  secondary: 'bg-surface text-text border border-line hover:bg-elevated active:bg-elevated',
  ghost: 'bg-transparent text-muted border border-transparent hover:text-text hover:bg-surface',
  danger: 'bg-transparent text-danger border border-line hover:border-danger hover:bg-surface',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-aux gap-1.5',
  md: 'h-10 px-4 text-aux gap-2',
  lg: 'h-12 px-5 text-body gap-2',
}

/** Clases de un botón, para dar el mismo aspecto a un enlace sin anidar controles. */
export function buttonClasses({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  fullWidth = false,
  className,
}: {
  variant?: Variant
  size?: Size
  iconOnly?: boolean
  fullWidth?: boolean
  className?: string
} = {}): string {
  return cn(
    'inline-flex items-center justify-center rounded-button font-medium',
    'transition-colors duration-150 ease-out',
    'disabled:cursor-not-allowed disabled:opacity-40',
    VARIANTS[variant],
    SIZES[size],
    iconOnly && (size === 'sm' ? 'w-8 px-0' : size === 'md' ? 'w-10 px-0' : 'w-12 px-0'),
    fullWidth && 'w-full',
    className,
  )
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  /** Botón cuadrado de solo ícono. Requiere aria-label. */
  iconOnly?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    iconOnly = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, iconOnly, fullWidth, className })}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : children}
    </button>
  )
})
