'use client'

import Table, { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { SupplyItem } from '@/types'

interface SupplyTableProps {
  items: SupplyItem[]
  loading?: boolean
  onEdit: (item: SupplyItem) => void
}

export default function SupplyTable({ items, loading, onEdit }: SupplyTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FACILITY_MANAGER'

  const columns: Column<SupplyItem>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'name', header: 'Name' },
    { key: 'units', header: 'Units' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unitCost', header: 'Unit Cost' },
    { key: 'totalCost', header: 'Total Cost' },
    { key: 'supplier', header: 'Supplier' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        canManage ? (
          <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>
        ) : null,
    },
  ]

  return (
    <Table columns={columns} data={items} loading={loading} emptyMessage="No supply items found." />
  )
}
