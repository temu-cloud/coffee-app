'use client'

import { useState, useRef, useEffect } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'

interface SelectProps {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  className?: string
  disabled?: boolean
  id?: string
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const selected = value ?? ''
  const selectedLabel = options.find((opt) => opt.value === selected)?.label || placeholder || 'Select an option'

  function handleSelect(val: string) {
    setIsOpen(false)
    onChange?.({ target: { value: val } })
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-1" ref={dropdownRef}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-amber-900">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((v) => !v)}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm text-left cursor-pointer
            flex items-center justify-between transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-white hover:border-amber-300'}
            ${isOpen ? 'ring-2 ring-amber-500 border-amber-500' : ''}
            ${className}`}
        >
          <span className={selected ? 'text-amber-900' : 'text-gray-400'}>
            {selectedLabel}
          </span>
          <FiChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-amber-200 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {placeholder && (
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between transition-colors cursor-pointer
                    ${!selected ? 'bg-amber-50 text-amber-900 font-medium' : 'text-gray-400 hover:bg-amber-50 hover:text-amber-900'}`}
                >
                  <span>{placeholder}</span>
                  {!selected && <FiCheck className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              )}
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between transition-colors cursor-pointer
                    ${selected === opt.value
                      ? 'bg-amber-50 text-amber-900 font-medium'
                      : 'text-amber-800 hover:bg-amber-50 hover:text-amber-900'}`}
                >
                  <span>{opt.label}</span>
                  {selected === opt.value && <FiCheck className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
