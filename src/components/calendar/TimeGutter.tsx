import { minutesToClock } from '@/lib/dates'

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
          className="absolute right-2 -translate-y-1/2 text-micro tabular-nums text-muted"
          style={{ top: (minute - startMin) * pxPerMin }}
        >
          {minutesToClock(minute)}
        </span>
      ))}
    </div>
  )
}
