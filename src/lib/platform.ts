/** Detecta si el navegador corre en un sistema de Apple, para mostrar ⌘ o Ctrl. */
export const IS_APPLE =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/i.test(
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
      ?.platform ?? navigator.platform ?? navigator.userAgent,
  )

/** Etiqueta del atajo de la paleta de comandos según el sistema. */
export const PALETTE_SHORTCUT = IS_APPLE ? '⌘K' : 'Ctrl K'
