import { CalendarDays, Inbox, Link2, Sparkles, Sun, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/hoy', label: 'Hoy', icon: Sun },
  { to: '/semana', label: 'Semana', icon: CalendarDays },
  { to: '/pendientes', label: 'Pendientes', icon: Inbox },
  { to: '/conexiones', label: 'Conexiones', icon: Link2 },
  { to: '/planes', label: 'Planes', icon: Sparkles },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]

export const SCREEN_TITLE: Record<string, string> = {
  '/hoy': 'Hoy',
  '/semana': 'Semana',
  '/capturar': 'Capturar',
  '/pendientes': 'Pendientes',
  '/conexiones': 'Conexiones',
  '/planes': 'Planes',
  '/perfil': 'Perfil',
  '/sobrecarga': 'Sobrecarga',
  '/configurar-horario': 'Tu horario',
}
