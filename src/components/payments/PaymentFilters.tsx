'use client'

import { useEffect, useState } from 'react'
 
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'

interface PaymentFiltersProps {
  onFilter: (from: string, to: string, executed: string) => void
}

export default function PaymentFilters({ onFilter }: PaymentFiltersProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [executed, setExecuted] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onFilter(from, to, executed), 300)
    return () => clearTimeout(timer)
  }, [from, to, executed, onFilter])

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-44">
         <DatePicker
              label="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
      </div>
      <div className="w-44">
         <DatePicker
              label="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
      </div>
      <div className="w-44">
        <Select
          label="Status"
          value={executed}
          onChange={(e) => setExecuted(e.target.value)}
          options={[
            { value: 'false', label: 'Pending' },
            { value: 'true', label: 'Executed' },
          ]}
          placeholder="All statuses"
        />
      </div>
      {(from || to || executed) && (
        <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo(''); setExecuted('') }}>
          Clear
        </Button>
      )}
    </div>
  )
}
