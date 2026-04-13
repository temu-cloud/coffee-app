'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import type { TransactionQuery } from '@/types'

interface TransactionFiltersProps {
  onFilter: (params: Partial<TransactionQuery>) => void
}

export default function TransactionFilters({ onFilter }: TransactionFiltersProps) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter({
        search: search || undefined,
        type: (type as 'STOCK_IN' | 'STOCK_OUT') || undefined,
        from: from || undefined,
        to: to || undefined,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, type, from, to, onFilter])

  function clear() {
    setSearch('')
    setType('')
    setFrom('')
    setTo('')
  }

  const hasFilters = search || type || from || to

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-40">
        <Input
          label="Search product"
          placeholder="Product name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-40">
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'STOCK_IN', label: 'Stock In' },
            { value: 'STOCK_OUT', label: 'Stock Out' },
          ]}
          placeholder="All types"
        />
      </div>
      <div className="w-40">
        <DatePicker label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="w-40">
        <DatePicker label="To" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
      )}
    </div>
  )
}
