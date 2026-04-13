'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'

interface ExpenseFiltersProps {
  onFilter: (from: string, to: string) => void
}

export default function ExpenseFilters({ onFilter }: ExpenseFiltersProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onFilter(from, to), 300)
    return () => clearTimeout(timer)
  }, [from, to, onFilter])

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-44">
        <DatePicker label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="w-44">
        <DatePicker label="To" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {(from || to) && (
        <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo('') }}>
          Clear
        </Button>
      )}
    </div>
  )
}
