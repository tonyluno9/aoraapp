import { cn } from '@/lib/cn'

interface AppIconProps {
  size?: number
  className?: string
}

/** Ícono de la aplicación: el anillo dentro de un contenedor redondeado. */
export function AppIcon({ size = 32, className }: AppIconProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-card border border-line bg-elevated',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="9" strokeWidth="3.5" className="stroke-line" />
        <circle
          cx="12"
          cy="12"
          r="9"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="stroke-accent"
          strokeDasharray={2 * Math.PI * 9}
          strokeDashoffset={2 * Math.PI * 9 * 0.28}
          transform="rotate(-90 12 12)"
        />
      </svg>
    </span>
  )
}
