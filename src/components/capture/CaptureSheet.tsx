import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Keyboard, Mic } from 'lucide-react'
import { Button, Field, Sheet, Textarea, useToast } from '@/components/ui'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { useAppStore } from '@/store/useAppStore'
import { DEMO_DICTATION, STAGE_LABEL, interpretWithAI, type AIStage } from '@/lib/fakeAI'
import { scheduleTasks } from '@/lib/scheduler'
import { formatTime } from '@/lib/dates'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/cn'
import { ParsedTaskCard, type CaptureDraft } from './ParsedTaskCard'
import { VoiceWave } from './VoiceWave'

type Phase = 'idle' | 'dictando' | 'procesando' | 'revision'
type Mode = 'texto' | 'voz'

interface CaptureSheetProps {
  open: boolean
  onClose: () => void
}

export function CaptureSheet({ open, onClose }: CaptureSheetProps) {
  const toast = useToast()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const tasks = useAppStore((state) => state.tasks)
  const availability = useAppStore((state) => state.availability)
  const addTask = useAppStore((state) => state.addTask)

  const [mode, setMode] = useState<Mode>('texto')
  const [phase, setPhase] = useState<Phase>('idle')
  const [text, setText] = useState('')
  const [stage, setStage] = useState<AIStage>('escuchando')
  const [drafts, setDrafts] = useState<CaptureDraft[]>([])
  const [adjusting, setAdjusting] = useState(false)
  const dictationTimer = useRef<number | null>(null)

  useEffect(() => {
    if (open) return
    setMode('texto')
    setPhase('idle')
    setText('')
    setDrafts([])
    setAdjusting(false)
    if (dictationTimer.current) {
      window.clearInterval(dictationTimer.current)
      dictationTimer.current = null
    }
  }, [open])

  useEffect(
    () => () => {
      if (dictationTimer.current) window.clearInterval(dictationTimer.current)
    },
    [],
  )

  const run = async (phrase: string, fromVoice: boolean) => {
    if (phrase.trim().length === 0) return
    setPhase('procesando')
    const parsed = await interpretWithAI(phrase, setStage, { skipListening: fromVoice })

    const pending: Task[] = parsed
      .filter((item) => !item.scheduledAt)
      .map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        priority: item.priority,
        status: 'pendiente',
        durationMin: item.durationMin,
        scheduledAt: null,
        deadline: item.deadline,
        locked: false,
        source: fromVoice ? 'voz' : 'texto',
      }))

    const result = scheduleTasks(pending, tasks, availability, new Date())

    setDrafts(
      parsed.map((item) => {
        const placement = result.placements.find((entry) => entry.taskId === item.id)
        const conflict = result.conflicts.find((entry) => entry.taskId === item.id)
        return {
          id: item.id,
          title: item.title,
          category: item.category,
          durationMin: item.durationMin,
          scheduledAt: item.scheduledAt ?? placement?.scheduledAt ?? null,
          deadline: item.deadline,
          explanation: item.scheduledAt
            ? `Respetamos la hora que dijiste: ${formatTime(item.scheduledAt)}.`
            : (placement?.explanation ?? 'Sin hueco disponible; queda en pendientes.'),
          conflict: conflict?.reason,
        }
      }),
    )
    setPhase('revision')
  }

  const startDictation = () => {
    setMode('voz')
    setPhase('dictando')
    setText('')
    const words = DEMO_DICTATION.split(' ')
    let index = 0
    dictationTimer.current = window.setInterval(() => {
      index += 1
      setText(words.slice(0, index).join(' '))
      if (index >= words.length) {
        if (dictationTimer.current) window.clearInterval(dictationTimer.current)
        dictationTimer.current = null
        void run(DEMO_DICTATION, true)
      }
    }, 130)
  }

  const confirm = () => {
    for (const draft of drafts) {
      addTask({
        title: draft.title,
        category: draft.category,
        priority: 'media',
        status: draft.scheduledAt ? 'programada' : 'pendiente',
        durationMin: draft.durationMin,
        scheduledAt: draft.scheduledAt,
        deadline: draft.deadline,
        locked: false,
        source: mode === 'voz' ? 'voz' : 'texto',
        recurrence: null,
      })
    }
    const count = drafts.length
    onClose()
    toast({
      message: count === 1 ? 'Se agregó 1 tarea' : `Se agregaron ${count} tareas`,
      actionLabel: 'Ver semana',
      onAction: () => navigate('/semana'),
    })
  }

  const footer =
    phase === 'revision' ? (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setAdjusting((value) => !value)}>
          {adjusting ? 'Listo' : 'Ajustar'}
        </Button>
        <Button variant="primary" fullWidth onClick={confirm}>
          Confirmar todo
        </Button>
      </div>
    ) : phase === 'idle' && mode === 'texto' ? (
      <Button variant="primary" fullWidth onClick={() => void run(text, false)} disabled={text.trim().length === 0}>
        Interpretar
      </Button>
    ) : null

  return (
    <Sheet open={open} onClose={onClose} title="Capturar" footer={footer}>
      <div className="flex flex-col gap-5">
        {phase !== 'procesando' && phase !== 'revision' && (
          <div className="flex gap-2">
            <ModeButton
              active={mode === 'texto'}
              onClick={() => {
                setMode('texto')
                setPhase('idle')
              }}
              icon={<Keyboard size={14} aria-hidden="true" />}
              label="Texto"
            />
            <ModeButton
              active={mode === 'voz'}
              onClick={startDictation}
              icon={<Mic size={14} aria-hidden="true" />}
              label="Voz"
            />
          </div>
        )}

        {phase === 'idle' && mode === 'texto' && (
          <Field
            label="Dilo con tus palabras"
            hint="Puedes juntar varias tareas en una sola frase."
          >
            {(props) => (
              <Textarea
                {...props}
                rows={4}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={DEMO_DICTATION}
              />
            )}
          </Field>
        )}

        {phase === 'dictando' && (
          <div className="flex flex-col gap-4">
            <VoiceState text={text} />
            <Button variant="secondary" fullWidth onClick={() => void run(text, true)}>
              Detener y acomodar
            </Button>
          </div>
        )}

        {phase === 'procesando' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <motion.div
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <CapacityRing value={28} size="md" showValue={false} label="Procesando" />
            </motion.div>
            <p className="text-body text-text">{STAGE_LABEL[stage]}</p>
            <p className="max-w-xs text-center text-aux text-muted">&ldquo;{text}&rdquo;</p>
          </div>
        )}

        {phase === 'revision' && (
          <div className="flex flex-col gap-3">
            <p className="text-aux text-muted">
              {drafts.length === 1
                ? 'Entendí una tarea y la acomodé así:'
                : `Entendí ${drafts.length} tareas y las acomodé así:`}
            </p>
            {drafts.map((draft) => (
              <ParsedTaskCard
                key={draft.id}
                draft={draft}
                adjusting={adjusting}
                onChange={(patch) =>
                  setDrafts((current) =>
                    current.map((item) => (item.id === draft.id ? { ...item, ...patch } : item)),
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}

function VoiceState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-4">
      <VoiceWave active className="w-full" />
      <p className="min-h-[72px] text-center text-body text-text">
        {text}
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-middle" />
      </p>
      <p className="text-micro text-muted">Simulación de dictado: no se usa el micrófono.</p>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-button border px-3 py-2 text-aux transition-colors duration-150 ease-out',
        active ? 'border-accent bg-accentDim text-text' : 'border-line text-muted hover:text-text',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
