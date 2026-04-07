'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

const CATEGORIES = [
  'Coffee', 'Dairy', 'Sweeteners', 'Syrups', 'Packaging', 'Equipment', 'Ingredients', 'Other',
]

interface ProductFiltersProps {
  onFilter: (search: string, category: string) => void
}

export default function ProductFilters({ onFilter }: ProductFiltersProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => onFilter(search, category), 300)
    return () => clearTimeout(timer)
  }, [search, category, onFilter])

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-48">
        <Input
          label="Search products"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-44">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          placeholder="All categories"
        />
      </div>
      {(search || category) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSearch(''); setCategory('') }}
        >
          Clear
        </Button>
      )}
    </div>
  )
}
