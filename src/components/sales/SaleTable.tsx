'use client'

import Table, { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { DailySale } from '@/types'

interface SaleRow extends DailySale {
  inventoryItem?: { name: string }
  createdBy?: { name: string }
}

interface SaleTableProps {
  sales: SaleRow[]
  loading?: boolean
  onDelete: (sale: SaleRow) => void
}

export default function SaleTable({ sales, loading, onDelete }: SaleTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'ADMIN'

  const columns: Column<SaleRow>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'itemName', header: 'Item', render: (row) => row.inventoryItem?.name ?? '—' },
    { key: 'quantitySold', header: 'Qty Sold' },
    { key: 'saleTotal', header: 'Sale Total' },
    { key: 'recordedBy', header: 'Recorded By', render: (row) => row.createdBy?.name ?? '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        canManage ? (
          <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>Delete</Button>
        ) : null,
    },
  ]

  return (
    <Table columns={columns} data={sales} loading={loading} emptyMessage="No sales records found." />
  )
}
