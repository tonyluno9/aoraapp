import { useEffect, useState } from 'react'

/** Escucha una media query y devuelve si se cumple. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Verdadero cuando el ancho es de escritorio (900px o más). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 900px)')
}
