import { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function Select({ label, error, options, placeholder, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-amber-900">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`px-3 py-2 rounded-lg border text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-white'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
