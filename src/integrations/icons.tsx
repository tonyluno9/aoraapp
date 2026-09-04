import type { ReactElement } from 'react'
import type { IntegrationId } from '@/lib/types'
import { cn } from '@/lib/cn'

interface GlyphProps {
  className?: string
}

/**
 * Glifos monocromáticos simplificados, dibujados aquí mismo.
 * Todos heredan currentColor y comparten el mismo trazo.
 */

export function GoogleGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 12.2c0 5-3.4 8.3-8.4 8.3A8.5 8.5 0 1 1 18.4 5.7l-2.5 2.4a5 5 0 1 0-3.3 8.8c2.6 0 4.3-1.5 4.7-3.5h-4.7v-3.2H21c.1.3 0 .7 0 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function AppleGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16.3 12.8c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.2Z"
        fill="currentColor"
      />
      <path
        d="M14.4 6.3c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 2-.5 2.6-1.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function NotionGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.5 16V8.4l7 7.2V8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SlackGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9.5 4.5v5M14.5 14.5v5M4.5 14.5h5M14.5 9.5h5" />
        <path d="M9.5 14.5h5v-5h-5z" />
      </g>
    </svg>
  )
}

export function TodoistGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.5 9.2 10 11.4l6-3.4M7.5 14.2 10 16.4l6-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TeamsGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="6.5" width="10" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.2 9.8h4.6M8.5 9.8v4.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17.2" cy="7.6" r="2.1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15 11.5h3.6c.8 0 1.4.6 1.4 1.4v2.6a2.5 2.5 0 0 1-2.5 2.5H15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

const GLYPHS: Record<IntegrationId, (props: GlyphProps) => ReactElement> = {
  google: GoogleGlyph,
  apple: AppleGlyph,
  notion: NotionGlyph,
  slack: SlackGlyph,
  todoist: TodoistGlyph,
  teams: TeamsGlyph,
}

interface IntegrationIconProps {
  id: IntegrationId
  className?: string
  size?: number
}

/** Contenedor cuadrado de 32px con el glifo dentro. */
export function IntegrationIcon({ id, className, size = 32 }: IntegrationIconProps) {
  const Glyph = GLYPHS[id]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-card border border-line bg-elevated text-text',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Glyph className="h-[62%] w-[62%]" />
    </span>
  )
}
