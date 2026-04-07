import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-amber-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`px-3 py-2 rounded-lg border text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-white'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input
