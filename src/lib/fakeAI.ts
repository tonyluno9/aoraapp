import { parsePhrase, type ParsedTask } from './parser'

export type AIStage = 'escuchando' | 'entendiendo' | 'buscando' | 'listo'

export const STAGE_LABEL: Record<AIStage, string> = {
  escuchando: 'Escuchando…',
  entendiendo: 'Entendiendo lo que dijiste…',
  buscando: 'Buscando huecos en tu semana…',
  listo: 'Listo',
}

/** Frase de la demostración por voz. */
export const DEMO_DICTATION =
  'Mañana tengo que entregar el reporte de Cálculo, el viernes voy al dentista a las cinco y necesito estudiar para el examen del martes'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/**
 * Envuelve al intérprete con los tiempos y estados de una IA.
 * No hay ninguna llamada a un servicio externo: todo se resuelve aquí.
 */
export async function interpretWithAI(
  text: string,
  onStage: (stage: AIStage) => void,
  options: { skipListening?: boolean } = {},
): Promise<ParsedTask[]> {
  const total = 900 + Math.round(Math.random() * 500)
  const slice = Math.round(total / 3)

  if (!options.skipListening) {
    onStage('escuchando')
    await wait(slice)
  }

  onStage('entendiendo')
  await wait(slice)

  onStage('buscando')
  await wait(slice)

  const result = parsePhrase(text)
  onStage('listo')
  return result
}
