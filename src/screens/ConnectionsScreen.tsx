import { useState } from 'react'
import { Screen } from '@/components/layout/Screen'
import { Card, Chip, Toggle, useToast } from '@/components/ui'
import { IntegrationIcon } from '@/integrations/icons'
import { useAppStore } from '@/store/useAppStore'
import type { IntegrationId } from '@/lib/types'
import { useSkeleton } from '@/lib/useSkeleton'
import { Skeleton } from '@/components/ui'

export function ConnectionsScreen() {
  const loading = useSkeleton()
  const toast = useToast()
  const integrations = useAppStore((state) => state.integrations)
  const setIntegration = useAppStore((state) => state.setIntegration)
  const tasks = useAppStore((state) => state.tasks)
  const [busy, setBusy] = useState<IntegrationId | null>(null)

  const toggle = (id: IntegrationId, next: boolean) => {
    setBusy(id)
    window.setTimeout(() => {
      setIntegration(id, next)
      setBusy(null)
      const name = integrations.find((item) => item.id === id)?.name ?? 'La app'
      const count = tasks.filter((task) => task.externalOrigin === id).length
      toast({
        message: next
          ? `${name} conectado${count > 0 ? `: regresan ${count} eventos` : ''}`
          : `${name} desconectado${count > 0 ? `: se ocultan ${count} eventos` : ''}`,
      })
    }, 800)
  }

  const available = integrations.filter((item) => item.available)
  const soon = integrations.filter((item) => !item.available)

  return (
    <Screen>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-title font-medium text-text">Conexiones</h2>
          <p className="text-aux text-muted">
            Lo que traes de otras apps se respeta al acomodar tu semana.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            {available.map((integration) => {
              const count = tasks.filter((task) => task.externalOrigin === integration.id).length
              return (
                <Card key={integration.id} className="flex items-center gap-4">
                  <IntegrationIcon id={integration.id} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body text-text">{integration.name}</p>
                      {integration.connected ? (
                        <Chip tone="accent">conectado</Chip>
                      ) : (
                        <Chip>sin conectar</Chip>
                      )}
                    </div>
                    <p className="text-aux text-muted">{integration.description}</p>
                    {count > 0 && (
                      <p className="text-micro text-muted">
                        {count} {count === 1 ? 'evento' : 'eventos'} en tu calendario
                      </p>
                    )}
                  </div>
                  <Toggle
                    checked={integration.connected}
                    busy={busy === integration.id}
                    onChange={(next) => toggle(integration.id, next)}
                    label={integration.name}
                  />
                </Card>
              )
            })}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="text-subtitle text-text">Próximamente</h3>
          <div className="flex flex-col gap-3">
            {soon.map((integration) => (
              <Card
                key={integration.id}
                className="flex items-center gap-4 border-dashed bg-transparent"
              >
                <IntegrationIcon id={integration.id} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-body text-text">{integration.name}</p>
                  <p className="text-aux text-muted">{integration.description}</p>
                </div>
                <Chip>próximamente</Chip>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Screen>
  )
}
