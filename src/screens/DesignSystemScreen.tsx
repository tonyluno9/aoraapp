import { useState } from 'react'
import { Check, Mic, Plus, Trash2 } from 'lucide-react'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { Logo } from '@/components/brand/Logo'
import { AppIcon } from '@/components/brand/AppIcon'
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Input,
  Modal,
  Sheet,
  Skeleton,
  Textarea,
  Toggle,
  Tooltip,
  useToast,
} from '@/components/ui'

const TOKENS: Array<{ name: string; className: string }> = [
  { name: 'ink', className: 'bg-ink' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'elevated', className: 'bg-elevated' },
  { name: 'line', className: 'bg-line' },
  { name: 'text', className: 'bg-text' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'accentDim', className: 'bg-accentDim' },
  { name: 'warn', className: 'bg-warn' },
  { name: 'warnDim', className: 'bg-warnDim' },
  { name: 'danger', className: 'bg-danger' },
]

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-subtitle font-medium text-text">{title}</h2>
        {hint && <p className="text-aux text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

export function DesignSystemScreen() {
  const toast = useToast()
  const [load, setLoad] = useState(72)
  const [modalOpen, setModalOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [recordatorio, setRecordatorio] = useState(true)
  const [sincronizar, setSincronizar] = useState(false)
  const [correo, setCorreo] = useState('')
  const [correoError, setCorreoError] = useState<string | undefined>(undefined)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-6 border-b border-line pb-8">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Chip tone="accent">Fase 1</Chip>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-title font-medium text-text">Sistema de diseño</h1>
          <p className="max-w-lg text-body text-muted">
            Tokens, anillo de carga y componentes base. Todo el color sale del tema; ningún
            componente escribe un hexadecimal.
          </p>
        </div>
      </header>

      <Section
        title="Anillo de carga"
        hint="Cambia el valor y observa el cambio a ámbar arriba de 100."
      >
        <Card className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex flex-col items-center gap-3">
              <CapacityRing value={load} size="lg" />
              <span className="text-micro text-muted">lg</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CapacityRing value={load} size="md" />
              <span className="text-micro text-muted">md</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CapacityRing value={load} size="sm" />
              <span className="text-micro text-muted">sm</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <AppIcon size={44} />
              <span className="text-micro text-muted">ícono</span>
            </div>
          </div>

          <Field label={`Carga simulada: ${load}%`}>
            {(props) => (
              <input
                {...props}
                type="range"
                min={0}
                max={140}
                step={1}
                value={load}
                onChange={(event) => setLoad(Number(event.target.value))}
              />
            )}
          </Field>

          <div className="flex flex-wrap gap-2">
            {[34, 72, 96, 118].map((value) => (
              <Button key={value} size="sm" onClick={() => setLoad(value)}>
                {value}%
              </Button>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Paleta">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {TOKENS.map((token) => (
            <div key={token.name} className="flex flex-col gap-2">
              <div className={`h-12 rounded-card border border-line ${token.className}`} />
              <span className="text-micro text-muted">{token.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografía" hint="Inter en dos pesos. Siempre en formato de oración.">
        <Card className="flex flex-col gap-3">
          <p className="text-title font-medium">Título de 28 px</p>
          <p className="text-subtitle">Subtítulo de 20 px</p>
          <p className="text-body">Cuerpo de 16 px para el contenido de la interfaz.</p>
          <p className="text-aux text-muted">Auxiliar de 13 px para metadatos.</p>
          <p className="text-micro text-muted">Micro de 11 px para píldoras y etiquetas.</p>
        </Card>
      </Section>

      <Section title="Botones">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Confirmar todo</Button>
            <Button variant="secondary">Ajustar</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger">Eliminar</Button>
            <Button variant="primary" loading>
              Procesando
            </Button>
            <Button disabled>Deshabilitado</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Pequeño</Button>
            <Button size="md">Mediano</Button>
            <Button size="lg" variant="primary">
              Grande
            </Button>
            <Tooltip label="Nueva tarea">
              <Button iconOnly aria-label="Nueva tarea">
                <Plus size={16} aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip label="Capturar por voz">
              <Button iconOnly variant="primary" aria-label="Capturar por voz">
                <Mic size={16} aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip label="Eliminar" side="bottom">
              <Button iconOnly variant="danger" aria-label="Eliminar">
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </Tooltip>
          </div>
        </Card>
      </Section>

      <Section title="Píldoras e interruptores">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Chip>escuela</Chip>
            <Chip>trabajo</Chip>
            <Chip tone="accent">flexible</Chip>
            <Chip tone="warn">sobrecargado</Chip>
            <Chip tone="danger">vencida</Chip>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="flex flex-col">
                <span className="text-body">Recordatorio</span>
                <span className="text-aux text-muted">Avisar 15 minutos antes</span>
              </span>
              <Toggle checked={recordatorio} onChange={setRecordatorio} label="Recordatorio" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex flex-col">
                <span className="text-body">Sincronizar calendario</span>
                <span className="text-aux text-muted">Traer eventos externos</span>
              </span>
              <Toggle
                checked={sincronizar}
                onChange={setSincronizar}
                label="Sincronizar calendario"
              />
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Campos">
        <Card className="flex flex-col gap-4">
          <Field label="Correo" error={correoError} hint="Se usa solo para entrar.">
            {(props) => (
              <Input
                {...props}
                type="email"
                placeholder="marcelo@correo.com"
                value={correo}
                onChange={(event) => {
                  setCorreo(event.target.value)
                  setCorreoError(undefined)
                }}
                onBlur={() =>
                  setCorreoError(correo.trim() === '' ? 'Escribe tu correo.' : undefined)
                }
              />
            )}
          </Field>
          <Field label="Notas">
            {(props) => <Textarea {...props} rows={3} placeholder="Detalles de la tarea" />}
          </Field>
        </Card>
      </Section>

      <Section title="Capas y avisos">
        <Card className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
          <Button onClick={() => setSheetOpen(true)}>Abrir hoja</Button>
          <Button
            onClick={() =>
              toast({
                message: 'Tarea completada',
                actionLabel: 'Deshacer',
                onAction: () => toast({ message: 'Se restauró la tarea' }),
              })
            }
          >
            Mostrar aviso
          </Button>
          <Button
            variant="ghost"
            onClick={() => toast({ message: 'El martes no te cabe', tone: 'warn' })}
          >
            Aviso de sobrecarga
          </Button>
        </Card>
      </Section>

      <Section title="Estados">
        <div className="grid gap-4 sm:grid-cols-2">
          <EmptyState
            title="Nada pendiente por hoy"
            description="Cuando captures algo, aparecerá aquí acomodado en tu día."
            action={<Button variant="primary">Capturar tarea</Button>}
          />
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton circle className="h-10 w-10" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </Card>
        </div>
      </Section>

      <footer className="flex items-center gap-2 border-t border-line pt-8 text-aux text-muted">
        <Check size={14} aria-hidden="true" />
        Fase 1 lista: andamiaje, tokens, anillo y componentes base.
      </footer>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Eliminar tarea"
        description="Esta acción no se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setModalOpen(false)
                toast({ message: 'Tarea eliminada', actionLabel: 'Deshacer' })
              }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-body text-muted">
          Se quitará la tarea de tu semana y se liberarán 45 minutos del jueves.
        </p>
      </Modal>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Capturar"
        footer={
          <Button variant="primary" fullWidth onClick={() => setSheetOpen(false)}>
            Confirmar todo
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-aux text-muted">
            En la fase 6 esta hoja recibe el dictado y muestra las tareas interpretadas.
          </p>
          <Field label="Dilo con tus palabras" hiddenLabel>
            {(props) => (
              <Textarea
                {...props}
                rows={4}
                placeholder="Mañana tengo que entregar el reporte de Cálculo…"
              />
            )}
          </Field>
        </div>
      </Sheet>
    </div>
  )
}
