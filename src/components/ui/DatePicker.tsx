'use client'

import { useState, useRef, useEffect } from 'react'
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface DatePickerProps {
  label?: string
  error?: string
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export default function DatePicker({
  label,
  error,
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  disabled = false,
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const selectedDate = value ? new Date(value) : null

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange?.({ target: { value: formatDate(newDate) } })
    setIsOpen(false)
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

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
          <span className={selectedDate ? 'text-amber-900' : 'text-gray-400'}>
            {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
          </span>
          <FiCalendar className={`w-4 h-4 text-amber-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-70 mt-1 bg-white border border-amber-200 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <FiChevronLeft className="w-4 h-4 text-amber-600" />
              </button>
              <span className="text-sm font-medium text-amber-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <FiChevronRight className="w-4 h-4 text-amber-600" />
              </button>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-1 px-3 pt-3">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-amber-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-3">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isSelected = selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === currentMonth.getMonth() &&
                  selectedDate?.getFullYear() === currentMonth.getFullYear()
                const isToday = new Date().getDate() === day &&
                  new Date().getMonth() === currentMonth.getMonth() &&
                  new Date().getFullYear() === currentMonth.getFullYear()
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelect(day)}
                    className={`h-8 text-sm rounded-lg transition-colors
                      ${isSelected
                        ? 'bg-amber-500 text-white font-medium'
                        : isToday
                          ? 'border border-amber-300 text-amber-700 font-medium'
                          : 'text-amber-800 hover:bg-amber-50'
                      }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}