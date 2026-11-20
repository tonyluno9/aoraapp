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
  sm: 'h-8 text-aux gap-1.5',
  md: 'h-10 text-aux gap-2',
  lg: 'h-12 text-body gap-2',
}

// El relleno va aparte: `cn` no resuelve choques de Tailwind, así que un botón de
// solo ícono no debe recibir también el relleno lateral (si no, el ícono se aplasta).
const PADDING: Record<Size, string> = {
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-5',
}

const ICON_WIDTH: Record<Size, string> = {
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
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
    iconOnly ? `${ICON_WIDTH[size]} shrink-0` : PADDING[size],
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
