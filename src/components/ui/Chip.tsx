import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'accent' | 'warn' | 'danger'

const TONES: Record<Tone, string> = {
  neutral: 'bg-elevated text-muted border-line',
  accent: 'bg-accentDim text-accent border-accentDim',
  warn: 'bg-warnDim text-warn border-warnDim',
  danger: 'bg-elevated text-danger border-line',
}

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Chip({ tone = 'neutral', className, children, ...rest }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-micro',
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
