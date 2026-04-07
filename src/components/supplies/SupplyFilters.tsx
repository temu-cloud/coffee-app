'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface SupplyFiltersProps {
  onFilter: (search: string) => void
}

export default function SupplyFilters({ onFilter }: SupplyFiltersProps) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onFilter(search), 300)
    return () => clearTimeout(timer)
  }, [search, onFilter])

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-48">
        <Input
          label="Search supplies"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {search && (
        <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
          Clear
        </Button>
      )}
    </div>
  )
}
