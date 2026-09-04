let counter = 0

/** Identificador corto y único dentro de la sesión. */
export function uid(prefix = 't'): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`
}
