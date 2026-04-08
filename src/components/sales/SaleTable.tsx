'use client'

import Table, { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { DailySale } from '@/types'

interface SaleTableProps {
  sales: DailySale[]
  loading?: boolean
  onDelete: (sale: DailySale) => void
}

export default function SaleTable({ sales, loading, onDelete }: SaleTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'ADMIN'

  const columns: Column<DailySale>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'itemName', header: 'Item' },
    { key: 'unitPrice', header: 'Unit Price' },
    { key: 'quantitySold', header: 'Qty Sold' },
    { key: 'saleTotal', header: 'Sale Total' },
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
