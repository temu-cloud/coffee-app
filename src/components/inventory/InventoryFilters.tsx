'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { ItemCategory } from '@/types'

interface InventoryFiltersProps {
  onFilter: (search: string, category: ItemCategory | '') => void
}

export default function InventoryFilters({ onFilter }: InventoryFiltersProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ItemCategory | ''>('')

  useEffect(() => {
    const timer = setTimeout(() => onFilter(search, category), 300)
    return () => clearTimeout(timer)
  }, [search, category, onFilter])

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-48">
        <Input
          label="Search items"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-48">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ItemCategory | '')}
          options={[
            { value: 'INGREDIENT', label: 'Ingredient' },
            { value: 'FINISHED_GOOD', label: 'Finished Good' },
          ]}
          placeholder="All categories"
        />
      </div>
      {(search || category) && (
        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCategory('') }}>
          Clear
        </Button>
      )}
    </div>
  )
}
