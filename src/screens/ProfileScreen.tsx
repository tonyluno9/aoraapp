import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Pencil, RotateCcw } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { Button, Card, Chip, Field, Input, Modal, useToast } from '@/components/ui'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { useAppStore, useVisibleTasks } from '@/store/useAppStore'
import { computeDayCapacity } from '@/lib/capacity'
import { formatDuration } from '@/lib/dates'

const LINKS = [
  { to: '/configurar-horario', label: 'Tu horario', hint: 'Días, rango de horas y bloques fijos' },
  { to: '/conexiones', label: 'Conexiones', hint: 'Calendarios y apps' },
  { to: '/planes', label: 'Plan', hint: 'Gratis y Pro' },
]

export function ProfileScreen() {
  const navigate = useNavigate()
  const toast = useToast()
  const user = useAppStore((state) => state.user)
  const availability = useAppStore((state) => state.availability)
  const signOut = useAppStore((state) => state.signOut)
  const resetDemo = useAppStore((state) => state.resetDemo)
  const tasks = useVisibleTasks()
  const [confirming, setConfirming] = useState(false)
  const updateUser = useAppStore((state) => state.updateUser)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const startEditing = () => {
    setName(user.name)
    setEmail(user.email)
    setErrors({})
    setEditing(true)
  }

  const saveProfile = () => {
    const next: typeof errors = {}
    if (name.trim().length === 0) next.name = 'Escribe tu nombre.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Escribe un correo válido.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    updateUser({ name, email })
    setEditing(false)
    toast({ message: 'Perfil actualizado' })
  }

  const capacity = computeDayCapacity(new Date(), tasks, availability)
  const done = tasks.filter((task) => task.status === 'completada').length
  const initials = user.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)

  return (
    <Screen>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-title font-medium text-text">Perfil</h2>
          <p className="text-aux text-muted">Tu cuenta y las preferencias de la app.</p>
        </header>

        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-elevated text-aux text-text">
            {initials}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-body text-text">{user.name}</p>
            <p className="text-aux text-muted">{user.email}</p>
          </div>
          <Chip tone="accent">{user.plan === 'pro' ? 'Plan Pro' : 'Plan gratis'}</Chip>
          {!editing && (
            <Button variant="ghost" size="sm" iconOnly aria-label="Editar perfil" onClick={startEditing}>
              <Pencil size={14} aria-hidden="true" />
            </Button>
          )}
        </Card>

        {editing && (
          <Card>
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                saveProfile()
              }}
            >
              <Field label="Nombre" error={errors.name}>
                {(props) => (
                  <Input
                    {...props}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)
                      setErrors((current) => ({ ...current, name: undefined }))
                    }}
                  />
                )}
              </Field>
              <Field label="Correo" error={errors.email}>
                {(props) => (
                  <Input
                    {...props}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setErrors((current) => ({ ...current, email: undefined }))
                    }}
                  />
                )}
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Guardar
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="flex items-center gap-4">
          <CapacityRing value={capacity.percent} overloaded={capacity.overloaded} size="md" label="Carga de hoy" />
          <div className="flex flex-col">
            <p className="text-aux text-text">Hoy al {capacity.percent}%</p>
            <p className="text-micro text-muted">
              {formatDuration(capacity.freeMin)} libres · {done} tareas completadas
            </p>
          </div>
        </Card>

        <section className="flex flex-col gap-2">
          <h3 className="text-subtitle text-text">Preferencias</h3>
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 transition-colors duration-150 ease-out hover:border-muted/40"
            >
              <span className="flex flex-col">
                <span className="text-body text-text">{link.label}</span>
                <span className="text-aux text-muted">{link.hint}</span>
              </span>
              <ChevronRight size={16} className="text-muted" aria-hidden="true" />
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-subtitle text-text">Sesión</h3>
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <p className="text-body text-text">Modo demostración</p>
              <p className="text-aux text-muted">
                Regresa los datos de ejemplo a su estado original.
              </p>
            </div>
            <Button size="sm" onClick={() => setConfirming(true)}>
              <RotateCcw size={14} aria-hidden="true" />
              Reiniciar datos
            </Button>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <p className="text-body text-text">Cerrar sesión</p>
              <p className="text-aux text-muted">Vuelves a la pantalla de acceso.</p>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                signOut()
                navigate('/entrar')
              }}
            >
              <LogOut size={14} aria-hidden="true" />
              Salir
            </Button>
          </Card>
        </section>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Reiniciar la demostración"
        description="Se restauran las 28 tareas de ejemplo."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                resetDemo()
                setConfirming(false)
                toast({ message: 'Datos de ejemplo restaurados' })
                navigate('/hoy')
              }}
            >
              Reiniciar
            </Button>
          </>
        }
      >
        <p className="text-body text-muted">
          Se pierden las tareas que hayas creado o movido en esta sesión.
        </p>
      </Modal>
    </Screen>
  )
}
