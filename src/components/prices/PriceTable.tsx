'use client'

import Table, { Column } from '@/components/ui/Table'
import type { PriceHistory } from '@/types'

interface PriceRow extends PriceHistory {
  inventoryItem?: { name: string }
}

interface PriceTableProps {
  prices: PriceRow[]
  loading?: boolean
  onSelectItem?: (inventoryItemId: string) => void
}

export default function PriceTable({ prices, loading, onSelectItem }: PriceTableProps) {
  const columns: Column<PriceRow>[] = [
    { key: 'itemName', header: 'Item', render: (row) => row.inventoryItem?.name ?? row.inventoryItemId },
    { key: 'price', header: 'Current Price' },
    { key: 'effectiveDate', header: 'Effective Date', render: (row) => new Date(row.effectiveDate).toLocaleDateString() },
    {
      key: 'history',
      header: 'History',
      render: (row) =>
        onSelectItem ? (
          <button
            onClick={() => onSelectItem(row.inventoryItemId)}
            className="text-amber-700 hover:underline text-sm"
          >
            View history
          </button>
        ) : null,
    },
  ]

  return (
    <Table columns={columns} data={prices} loading={loading} emptyMessage="No prices set yet." />
  )
}
