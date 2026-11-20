import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  /** Muestra un indicador de carga y bloquea el control. */
  busy?: boolean
  disabled?: boolean
  className?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  busy = false,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      // Mientras carga no lo deshabilitamos: así el foco no se pierde.
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      disabled={disabled}
      onClick={() => {
        if (!busy) onChange(!checked)
      }}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border',
        'transition-colors duration-150 ease-out disabled:opacity-40 aria-busy:cursor-progress',
        checked ? 'border-accent bg-accent' : 'border-line bg-elevated',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full transition-transform duration-150 ease-out',
          checked ? 'translate-x-6 bg-ink' : 'translate-x-1 bg-muted',
        )}
      >
        {busy && <Loader2 size={10} className="animate-spin text-muted" aria-hidden="true" />}
      </span>
    </button>
  )
}
