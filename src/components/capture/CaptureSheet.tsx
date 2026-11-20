import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Keyboard, Mic, Sparkles } from 'lucide-react'
import { Button, Field, Sheet, Textarea, useToast } from '@/components/ui'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { useAppStore, visibleTasks } from '@/store/useAppStore'
import { DEMO_DICTATION, STAGE_LABEL, interpretWithAI, type AIStage } from '@/lib/fakeAI'
import { findTimeClash, scheduleTasks } from '@/lib/scheduler'
import { speechSupported, startSpeech, type SpeechSession } from '@/lib/speech'
import { formatTime, startOfDay, toDate } from '@/lib/dates'
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
  const integrations = useAppStore((state) => state.integrations)
  const availability = useAppStore((state) => state.availability)
  const addTask = useAppStore((state) => state.addTask)

  const [mode, setMode] = useState<Mode>('texto')
  const [phase, setPhase] = useState<Phase>('idle')
  const [text, setText] = useState('')
  const [stage, setStage] = useState<AIStage>('escuchando')
  const [drafts, setDrafts] = useState<CaptureDraft[]>([])
  const [adjusting, setAdjusting] = useState(false)
  const dictationTimer = useRef<number | null>(null)
  const speechSession = useRef<SpeechSession | null>(null)
  const transcript = useRef('')
  const [voiceSource, setVoiceSource] = useState<'micro' | 'demo'>('micro')
  const [voiceError, setVoiceError] = useState<string | null>(null)
  // Cada interpretación lleva un número; si llega una más nueva o se cierra la hoja, la vieja se ignora.
  const runId = useRef(0)

  useEffect(() => {
    if (open) return
    setMode('texto')
    setPhase('idle')
    setText('')
    setDrafts([])
    setAdjusting(false)
    setVoiceError(null)
    runId.current += 1
    stopDictation()
  }, [open])

  useEffect(() => () => stopDictation(), [])

  /** Detiene cualquier dictado en curso: el del micrófono y el de demostración. */
  function stopDictation() {
    if (dictationTimer.current) {
      window.clearInterval(dictationTimer.current)
      dictationTimer.current = null
    }
    speechSession.current?.abort()
    speechSession.current = null
  }

  const run = async (phrase: string, fromVoice: boolean) => {
    stopDictation()
    if (phrase.trim().length === 0) return
    setPhase('procesando')
    const id = ++runId.current
    const parsed = await interpretWithAI(phrase, setStage, { skipListening: fromVoice })
    if (id !== runId.current) return

    const asTask = (item: (typeof parsed)[number]): Task => ({
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      status: item.scheduledAt ? 'programada' : 'pendiente',
      durationMin: item.durationMin,
      scheduledAt: item.scheduledAt ?? null,
      deadline: item.deadline,
      locked: false,
      source: fromVoice ? 'voz' : 'texto',
    })

    const pending = parsed.filter((item) => !item.scheduledAt).map(asTask)
    // Las tareas con hora dicha ocupan su lugar: las flexibles de la misma frase no deben caer encima.
    const withTime = parsed.filter((item) => item.scheduledAt).map(asTask)

    // Se acomodan una por una: si la persona dijo un día ("mañana entregar…"), se busca hueco
    // desde ese día y no antes; cada tarea colocada ocupa su lugar para la siguiente.
    const now = new Date()
    const busy: Task[] = [...tasks, ...withTime]
    const result: ReturnType<typeof scheduleTasks> = { placements: [], conflicts: [] }
    for (const task of pending) {
      const item = parsed.find((entry) => entry.id === task.id)
      const dayStart = item?.preferredDay ? startOfDay(toDate(item.preferredDay)) : null
      const from = dayStart && dayStart.getTime() > now.getTime() ? dayStart : now
      const single = scheduleTasks([task], busy, availability, from)
      result.placements.push(...single.placements)
      result.conflicts.push(...single.conflicts)
      const placement = single.placements[0]
      if (placement) busy.push({ ...task, scheduledAt: placement.scheduledAt, status: 'programada' })
    }

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

  // `run` cambia en cada render; el micrófono avisa más tarde, así que usa siempre la última.
  const runRef = useRef(run)
  runRef.current = run

  /** Graba con el micrófono; si el navegador no tiene dictado, usa la demostración. */
  const startDictation = () => {
    // Si ya se está dictando, un segundo toque no arranca otro dictado encima.
    if (phase === 'dictando') return
    if (!speechSupported()) {
      startDemo()
      return
    }
    stopDictation()
    setMode('voz')
    setVoiceSource('micro')
    setVoiceError(null)
    setText('')
    transcript.current = ''

    let failed = false
    const session = startSpeech({
      onText: (value) => {
        transcript.current = value
        setText(value)
      },
      onError: (message) => {
        failed = true
        setVoiceError(message)
      },
      onEnd: () => {
        if (speechSession.current !== session) return
        speechSession.current = null
        const heard = transcript.current.trim()
        if (heard.length > 0 && !failed) {
          void runRef.current(heard, true)
          return
        }
        setPhase('idle')
        if (!failed) setVoiceError('No te escuché. Toca "Grabar otra vez" o usa la frase de demostración.')
      },
    })

    if (!session) {
      startDemo()
      return
    }
    speechSession.current = session
    setPhase('dictando')
  }

  /** "Detener y acomodar": corta el micrófono e interpreta lo que se alcanzó a escuchar. */
  const finishDictation = () => {
    const heard = voiceSource === 'micro' ? transcript.current.trim() : text
    stopDictation()
    if (heard.trim().length === 0) {
      setPhase('idle')
      setVoiceError('No te escuché. Toca "Grabar otra vez" o usa la frase de demostración.')
      return
    }
    void run(heard, true)
  }

  /** Dictado simulado con la frase de ejemplo, para presentar sin micrófono. */
  const startDemo = () => {
    if (phase === 'dictando') return
    stopDictation()
    setMode('voz')
    setVoiceSource('demo')
    setVoiceError(null)
    setPhase('dictando')
    setText('')
    const words = DEMO_DICTATION.split(' ')
    let index = 0
    dictationTimer.current = window.setInterval(() => {
      index += 1
      setText(words.slice(0, index).join(' '))
      if (index >= words.length) {
        void run(DEMO_DICTATION, true)
      }
    }, 130)
  }

  const confirm = () => {
    for (const draft of drafts) {
      addTask({
        title: draft.title.trim() || 'Tarea nueva',
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
                stopDictation()
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

        {phase === 'idle' && mode === 'texto' && text.trim().length === 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => setText(DEMO_DICTATION)}
          >
            <Sparkles size={14} aria-hidden="true" />
            Usar la frase de ejemplo
          </Button>
        )}

        {phase === 'dictando' && (
          <div className="flex flex-col gap-4">
            <VoiceState text={text} source={voiceSource} />
            <Button variant="secondary" fullWidth onClick={finishDictation}>
              Detener y acomodar
            </Button>
          </div>
        )}

        {phase === 'idle' && mode === 'voz' && (
          <div className="flex flex-col gap-3">
            {voiceError && (
              <p role="alert" className="text-aux text-warn">
                {voiceError}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="primary" fullWidth onClick={startDictation}>
                <Mic size={16} aria-hidden="true" />
                Grabar otra vez
              </Button>
              <Button variant="secondary" fullWidth onClick={startDemo}>
                <Sparkles size={16} aria-hidden="true" />
                Usar la frase de demostración
              </Button>
            </div>
          </div>
        )}

        {phase === 'procesando' && (
          <div role="status" className="flex flex-col items-center gap-4 py-6">
            <motion.div
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <CapacityRing value={28} size="md" showValue={false} decorative />
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
                warning={
                  draft.scheduledAt
                    ? findTimeClash(
                        draft.scheduledAt,
                        draft.durationMin,
                        [
                          ...visibleTasks(tasks, integrations),
                          ...drafts
                            .filter((other) => other.id !== draft.id)
                            .map((other) => ({ ...other, status: 'programada' as const })),
                        ],
                        availability,
                      )
                    : null
                }
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

function VoiceState({ text, source }: { text: string; source: 'micro' | 'demo' }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-4">
      <VoiceWave active className="w-full" />
      <p className="min-h-[72px] text-center text-body text-text">
        {text}
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-middle"
        />
      </p>
      <p className="text-micro text-muted">
        {source === 'micro'
          ? text.length === 0
            ? 'Escuchando… habla y luego toca "Detener y acomodar".'
            : 'Escuchando con tu micrófono.'
          : 'Frase de demostración: no se usa el micrófono.'}
      </p>
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
      aria-pressed={active}
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
