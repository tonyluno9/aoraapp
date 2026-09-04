import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Input } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { AppleGlyph, GoogleGlyph } from '@/integrations/icons'
import { useAppStore } from '@/store/useAppStore'

export function SignInScreen() {
  const navigate = useNavigate()
  const signIn = useAppStore((state) => state.signIn)
  const scheduleConfigured = useAppStore((state) => state.scheduleConfigured)
  const seedEmail = useAppStore((state) => state.user.email)

  const [email, setEmail] = useState(seedEmail)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const enter = (from: 'correo' | 'google' | 'apple') => {
    if (from === 'correo') {
      const next: typeof errors = {}
      if (email.trim().length === 0) next.email = 'Escribe tu correo.'
      if (password.trim().length === 0) next.password = 'Escribe tu contraseña.'
      setErrors(next)
      if (Object.keys(next).length > 0) return
    }

    signIn(from === 'correo' ? email : seedEmail)
    navigate(scheduleConfigured ? '/hoy' : '/configurar-horario')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          <div className="flex flex-col gap-2">
            <h1 className="text-title font-medium text-text">Entra a tu semana</h1>
            <p className="text-aux text-muted">Tú dilo, AORAA lo acomoda.</p>
          </div>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            enter('correo')
          }}
        >
          <Field label="Correo" error={errors.email}>
            {(props) => (
              <Input
                {...props}
                type="email"
                autoComplete="email"
                placeholder="marcelo@correo.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrors((current) => ({ ...current, email: undefined }))
                }}
              />
            )}
          </Field>

          <Field label="Contraseña" error={errors.password}>
            {(props) => (
              <Input
                {...props}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((current) => ({ ...current, password: undefined }))
                }}
              />
            )}
          </Field>

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Entrar
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span className="text-micro text-muted">o entra con</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2">
          <Button size="lg" fullWidth onClick={() => enter('google')}>
            <GoogleGlyph className="h-4 w-4" />
            Continuar con Google
          </Button>
          <Button size="lg" fullWidth onClick={() => enter('apple')}>
            <AppleGlyph className="h-4 w-4" />
            Continuar con Apple
          </Button>
        </div>

        <p className="text-center text-micro text-muted">
          Prototipo de demostración: no se validan credenciales ni se envía nada.
        </p>
      </div>
    </div>
  )
}
