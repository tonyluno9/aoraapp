import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  /** Oculta visualmente la etiqueta, pero la deja para lectores de pantalla. */
  hiddenLabel?: boolean
  className?: string
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode
}

export function Field({ label, hint, error, hiddenLabel, className, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-msg`
  const message = error ?? hint

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className={cn('text-aux text-muted', hiddenLabel && 'sr-only')}
      >
        {label}
      </label>
      {children({
        id,
        'aria-describedby': message ? messageId : undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {message && (
        <p id={messageId} className={cn('text-micro', error ? 'text-danger' : 'text-muted')}>
          {message}
        </p>
      )}
    </div>
  )
}

const CONTROL =
  'w-full rounded-button border border-line bg-elevated px-3 py-2.5 text-body text-text placeholder:text-muted transition-colors duration-150 ease-out hover:border-muted/40 focus:border-accent'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(CONTROL, className)} {...rest} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(CONTROL, 'resize-none', className)} {...rest} />
})

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn(CONTROL, 'appearance-none pr-8', className)} {...rest}>
        {children}
      </select>
    )
  },
)
