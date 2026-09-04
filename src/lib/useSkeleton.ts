import { useEffect, useState } from 'react'

/** Muestra el esqueleto de carga durante los primeros milisegundos de una vista. */
export function useSkeleton(ms = 400): boolean {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(timer)
  }, [ms])

  return loading
}
