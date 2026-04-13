'use client'

import Table, { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { DailySale } from '@/types'

interface SaleTableProps {
  sales: DailySale[]
  loading?: boolean
  onEdit?: (sale: DailySale) => void
  onDelete: (sale: DailySale) => void
}

export default function SaleTable({ sales, loading, onEdit, onDelete }: SaleTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'ADMIN'

  const columns: Column<DailySale>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'itemName', header: 'Item' },
    { key: 'quantitySold', header: 'Qty Sold' },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (row) => Number(row.totalCost ?? 0).toFixed(2),
    },
    {
      key: 'saleTotal',
      header: 'Total Sell',
      render: (row) => Number(row.saleTotal).toFixed(2),
    },
    {
      key: 'profit',
      header: 'Profit',
      render: (row) => {
        const p = Number(row.profit ?? 0)
        return (
          <span className={p >= 0 ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
            {p.toFixed(2)}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        canManage ? (
          <div className="flex gap-2">
            {onEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>}
            <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>Delete</Button>
          </div>
        ) : null,
    },
  ]

  return (
    <Table columns={columns} data={sales} loading={loading} emptyMessage="No sales records found." />
  )
}
