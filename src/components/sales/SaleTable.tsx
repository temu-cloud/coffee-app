'use client'

import Table, { Column } from '@/components/ui/Table'
import type { DailySale } from '@/types'

interface SaleRow extends DailySale {
  inventoryItem?: { name: string }
  createdBy?: { name: string }
}

interface SaleTableProps {
  sales: SaleRow[]
  loading?: boolean
}

export default function SaleTable({ sales, loading }: SaleTableProps) {
  const columns: Column<SaleRow>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'itemName', header: 'Item', render: (row) => row.inventoryItem?.name ?? '—' },
    { key: 'quantitySold', header: 'Qty Sold' },
    { key: 'saleTotal', header: 'Sale Total' },
    { key: 'recordedBy', header: 'Recorded By', render: (row) => row.createdBy?.name ?? '—' },
  ]

  return (
    <Table columns={columns} data={sales} loading={loading} emptyMessage="No sales records found." />
  )
}
