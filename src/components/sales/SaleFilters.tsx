'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface SaleFiltersProps {
  onFilter: (from: string, to: string) => void
}

export default function SaleFilters({ onFilter }: SaleFiltersProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onFilter(from, to), 300)
    return () => clearTimeout(timer)
  }, [from, to, onFilter])

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-44">
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="w-44">
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {(from || to) && (
        <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo('') }}>
          Clear
        </Button>
      )}
    </div>
  )
}
