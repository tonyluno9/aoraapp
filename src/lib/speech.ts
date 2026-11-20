/**
 * Dictado con el micrófono usando el reconocimiento de voz del navegador
 * (Web Speech API). Safari y Chrome lo traen; Firefox no.
 * El audio lo procesa el propio navegador: la app no lo guarda ni lo envía a ningún lado.
 */

interface RecognitionAlternative {
  transcript: string
}

interface RecognitionResult {
  readonly length: number
  [index: number]: RecognitionAlternative
}

interface RecognitionEvent {
  results: { readonly length: number; [index: number]: RecognitionResult }
}

interface RecognitionErrorEvent {
  error: string
}

interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type RecognitionConstructor = new () => Recognition

function getConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}

export function speechSupported(): boolean {
  return getConstructor() !== null
}

export interface SpeechSession {
  /** Corta el micrófono sin avisar con `onEnd`. */
  abort: () => void
}

interface SpeechHandlers {
  /** Todo lo escuchado hasta ahora, incluido lo que aún no es definitivo. */
  onText: (transcript: string) => void
  /** El navegador dejó de escuchar por su cuenta (silencio, error o límite de tiempo). */
  onEnd: () => void
  onError: (message: string) => void
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':
    'El navegador no tiene permiso para usar el micrófono. Permítelo e inténtalo otra vez, o usa la frase de demostración.',
  'service-not-allowed':
    'El dictado está desactivado en este navegador o en tu Mac. Puedes usar la frase de demostración.',
  'audio-capture': 'No encontré un micrófono conectado.',
  network: 'El dictado del navegador necesita internet. Revisa tu conexión o usa la frase de demostración.',
}

export function startSpeech(handlers: SpeechHandlers): SpeechSession | null {
  const Constructor = getConstructor()
  if (!Constructor) return null

  const recognition = new Constructor()
  recognition.lang = 'es-MX'
  recognition.continuous = true
  recognition.interimResults = true

  let active = true

  recognition.onresult = (event) => {
    if (!active) return
    let transcript = ''
    for (let index = 0; index < event.results.length; index += 1) {
      transcript += event.results[index][0]?.transcript ?? ''
    }
    handlers.onText(transcript.replace(/\s+/g, ' ').trim())
  }

  recognition.onerror = (event) => {
    if (!active) return
    // "no-speech" y "aborted" no son errores para la persona: el final se maneja en onEnd.
    if (event.error === 'no-speech' || event.error === 'aborted') return
    handlers.onError(ERROR_MESSAGES[event.error] ?? 'No pude usar el micrófono. Usa la frase de demostración.')
  }

  recognition.onend = () => {
    if (!active) return
    active = false
    handlers.onEnd()
  }

  try {
    recognition.start()
  } catch {
    return null
  }

  return {
    abort: () => {
      active = false
      try {
        recognition.abort()
      } catch {
        // Ya estaba detenido.
      }
    },
  }
}
