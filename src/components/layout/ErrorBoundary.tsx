import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState {
  failed: boolean
}

const STORAGE_KEY = 'aoraa-task'

/**
 * Red de seguridad: si una pantalla truena, en lugar de dejar la página en blanco
 * muestra un aviso con salida a Hoy o la opción de volver a los datos de ejemplo.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('AORAA Task: error en pantalla', error, info.componentStack)
  }

  private goHome = () => {
    window.location.assign(`${import.meta.env.BASE_URL}hoy`)
  }

  private resetData = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Sin acceso al almacenamiento: igual recargamos.
    }
    window.location.assign(import.meta.env.BASE_URL)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6">
        <div
          role="alert"
          className="flex w-full max-w-sm flex-col gap-4 rounded-card border border-line bg-surface p-6 text-center"
        >
          <h1 className="text-title font-medium text-text">Algo salió mal</h1>
          <p className="text-aux text-muted">
            Esta pantalla no pudo mostrarse. Tus tareas siguen guardadas.
          </p>
          <button
            type="button"
            onClick={this.goHome}
            className="h-12 rounded-button border border-accent bg-accent px-5 text-body font-medium text-ink"
          >
            Volver a Hoy
          </button>
          <button
            type="button"
            onClick={this.resetData}
            className="h-10 rounded-button border border-line px-4 text-aux text-muted hover:text-text"
          >
            Reiniciar los datos de ejemplo
          </button>
        </div>
      </div>
    )
  }
}
