import { minutesToClock } from '@/lib/dates'
import { cn } from '@/lib/cn'

interface TimeGutterProps {
  startMin: number
  endMin: number
  pxPerMin: number
}

export function TimeGutter({ startMin, endMin, pxPerMin }: TimeGutterProps) {
  const hours: number[] = []
  for (let minute = startMin; minute <= endMin; minute += 60) hours.push(minute)

  return (
    <div
      className="relative w-12 shrink-0 border-r border-line"
      style={{ height: (endMin - startMin) * pxPerMin }}
      aria-hidden="true"
    >
      {hours.map((minute) => (
        <span
          key={minute}
          className={cn(
            'absolute right-2 text-micro tabular-nums text-muted',
            // La primera hora se pegaría al borde superior y quedaría cortada a la mitad.
            minute === startMin ? 'translate-y-0.5' : '-translate-y-1/2',
          )}
          style={{ top: (minute - startMin) * pxPerMin }}
        >
          {minutesToClock(minute)}
        </span>
      ))}
    </div>
  )
}
