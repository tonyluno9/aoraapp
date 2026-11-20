import { Check, Minus } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { Button, Card, Chip, useToast } from '@/components/ui'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/cn'

interface Feature {
  label: string
  free: boolean
  pro: boolean
}

const FEATURES: Feature[] = [
  { label: 'Captura por texto', free: true, pro: true },
  { label: 'Captura por voz', free: false, pro: true },
  { label: 'Anillo de carga diario', free: true, pro: true },
  { label: 'Vista semanal con arrastre', free: true, pro: true },
  { label: 'Acomodo automático ilimitado', free: false, pro: true },
  { label: 'Sugerencias de sobrecarga', free: false, pro: true },
  { label: 'Calendarios conectados', free: false, pro: true },
  { label: 'Tareas activas', free: true, pro: true },
]

export function PlansScreen() {
  const toast = useToast()
  const plan = useAppStore((state) => state.user.plan)

  return (
    <Screen>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-title font-medium text-text">Planes</h2>
          <p className="text-aux text-muted">
            Empieza gratis. Pro es para cuando tu semana ya no cabe en la cabeza.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <PlanCard
            name="Gratis"
            price="$0"
            note="Para probar el ritmo"
            features={FEATURES.map((feature) => ({
              label: feature.label === 'Tareas activas' ? 'Hasta 20 tareas activas' : feature.label,
              included: feature.free,
            }))}
            action={
              plan === 'gratis' ? (
                <Button fullWidth disabled>
                  Tu plan actual
                </Button>
              ) : (
                <Button
                  fullWidth
                  onClick={() => toast({ message: 'Cambiar de plan: próximamente' })}
                >
                  Cambiar a Gratis
                </Button>
              )
            }
          />

          <PlanCard
            highlighted
            name="Pro"
            price="$79 al mes"
            note="Para semanas de verdad"
            features={FEATURES.map((feature) => ({
              label: feature.label === 'Tareas activas' ? 'Tareas ilimitadas' : feature.label,
              included: feature.pro,
            }))}
            action={
              plan === 'pro' ? (
                <Button variant="primary" fullWidth disabled>
                  Ya tienes Pro
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => toast({ message: 'Cambiar de plan: próximamente' })}
                >
                  Pasar a Pro
                </Button>
              )
            }
          />
        </div>
      </div>
    </Screen>
  )
}

function PlanCard({
  name,
  price,
  note,
  features,
  action,
  highlighted = false,
}: {
  name: string
  price: string
  note: string
  features: Array<{ label: string; included: boolean }>
  action: React.ReactNode
  highlighted?: boolean
}) {
  return (
    <Card
      className={cn(
        'flex flex-col gap-5',
        highlighted && 'border-2 border-accent',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-subtitle text-text">{name}</p>
          <p className="text-aux text-muted">{note}</p>
        </div>
        {highlighted && <Chip tone="accent">Recomendado</Chip>}
      </div>

      <p className="text-title font-medium text-text">{price}</p>

      <ul className="flex flex-col gap-2">
        {features.map((feature) => (
          <li key={feature.label} className="flex items-center gap-2 text-aux">
            {feature.included ? (
              <Check size={14} className="text-accent" aria-hidden="true" />
            ) : (
              <Minus size={14} className="text-muted" aria-hidden="true" />
            )}
            <span className={feature.included ? 'text-text' : 'text-muted'}>
              <span className="sr-only">{feature.included ? 'Incluye: ' : 'No incluye: '}</span>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">{action}</div>
    </Card>
  )
}
