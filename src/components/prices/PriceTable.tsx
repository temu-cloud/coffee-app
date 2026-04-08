'use client'

import Table, { Column } from '@/components/ui/Table'
import type { PriceHistory } from '@/types'

interface PriceTableProps {
  prices: PriceHistory[]
  loading?: boolean
}

export default function PriceTable({ prices, loading }: PriceTableProps) {
  const columns: Column<PriceHistory>[] = [
    { key: 'itemName', header: 'Item', render: (row) => row.itemName },
    { key: 'price', header: 'Current Price' },
    {
      key: 'effectiveDate',
      header: 'Effective Date',
      render: (row) => new Date(row.effectiveDate).toLocaleDateString(),
    },
  ]

  return (
    <Table columns={columns} data={prices} loading={loading} emptyMessage="No prices set yet." />
  )
}
