'use client'

import Table, { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { PriceHistory } from '@/types'

interface PriceTableProps {
  prices: PriceHistory[]
  loading?: boolean
  onEdit?: (item: PriceHistory) => void
  onDelete?: (item: PriceHistory) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  FINISHED_GOOD: 'Finished Good',
  RECIPE: 'Recipe',
  OTHER: 'Other',
}

const CATEGORY_VARIANTS: Record<string, 'success' | 'warning' | 'default'> = {
  FINISHED_GOOD: 'success',
  RECIPE: 'warning',
  OTHER: 'default',
}

export default function PriceTable({ prices, loading, onEdit, onDelete }: PriceTableProps) {
  const columns: Column<PriceHistory>[] = [
    {
      key: 'effectiveDate',
      header: 'Date',
      render: (row) => new Date(row.effectiveDate).toLocaleDateString(),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => {
        const cat = row.category ?? 'OTHER'
        return (
          <Badge variant={CATEGORY_VARIANTS[cat] ?? 'default'}>
            {CATEGORY_LABELS[cat] ?? cat}
          </Badge>
        )
      },
    },
    { key: 'itemName', header: 'Item Name' },
    {
      key: 'unitCost',
      header: 'Unit Cost',
      render: (row) => (row.unitCost != null ? Number(row.unitCost).toFixed(2) : '—'),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => Number(row.price).toFixed(2),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {onEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>}
          {onDelete && <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>Delete</Button>}
        </div>
      ),
    },
  ]

  return (
    <Table columns={columns} data={prices} loading={loading} emptyMessage="No prices set yet." />
  )
}
