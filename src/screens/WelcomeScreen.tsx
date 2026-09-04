import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CapacityRing } from '@/components/brand/CapacityRing'
import { Logo } from '@/components/brand/Logo'
import { VoiceWave } from '@/components/capture/VoiceWave'
import { Button } from '@/components/ui'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/cn'

const STEPS = [
  {
    title: 'Tú dilo, AORAA lo acomoda',
    body: 'Escribe o dicta lo que tienes que hacer. Nosotros le buscamos lugar en tu semana real.',
  },
  {
    title: 'Habla como hablas',
    body: '"Mañana entrego el reporte y el viernes voy al dentista a las cinco" es suficiente. AORAA entiende días, horas y duraciones.',
  },
  {
    title: 'Sabrás si te cabe',
    body: 'El anillo te dice cuánto llevas del día. Si te pasas, te proponemos qué mover, qué recortar y qué soltar.',
  },
]

export function WelcomeScreen() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const finishOnboarding = useAppStore((state) => state.finishOnboarding)
  const [step, setStep] = useState(0)

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((value) => value + 1)
      return
    }
    finishOnboarding()
    navigate('/entrar')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between gap-8 px-6 py-10">
      <header className="flex w-full max-w-md items-center justify-between">
        <Logo compact size={28} />
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="Paso de la bienvenida">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={cn(
                'h-1 w-8 rounded-full transition-colors duration-150 ease-out',
                index <= step ? 'bg-accent' : 'bg-line',
              )}
            />
          ))}
        </div>
      </header>

      <main className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8"
          >
            {step === 0 && (
              <div className="flex flex-col items-center gap-6">
                <CapacityRing value={64} size="lg" showValue={false} label="AORAA Task" />
                <span className="text-subtitle font-medium tracking-[0.18em] text-text">
                  AORAA TASK
                </span>
              </div>
            )}

            {step === 1 && (
              <div className="flex w-full flex-col items-center gap-4">
                <VoiceWave active className="w-full" />
                <p className="text-aux text-muted">Escuchando…</p>
              </div>
            )}

            {step === 2 && <CapacityRing value={72} size="lg" label="Ejemplo de carga al 72%" />}

            <div className="flex flex-col gap-3">
              <h1 className="text-title font-medium text-text">{STEPS[step].title}</h1>
              <p className="text-body text-muted">{STEPS[step].body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="flex w-full max-w-md flex-col gap-3">
        <Button variant="primary" size="lg" fullWidth onClick={next}>
          {step === STEPS.length - 1 ? 'Entrar' : 'Siguiente'}
        </Button>
        {step > 0 ? (
          <Button variant="ghost" fullWidth onClick={() => setStep((value) => value - 1)}>
            Atrás
          </Button>
        ) : (
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              finishOnboarding()
              navigate('/entrar')
            }}
          >
            Saltar la introducción
          </Button>
        )}
      </footer>
    </div>
  )
}
