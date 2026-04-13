'use client'

import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { InventoryItem } from '@/types'
import { FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface InventoryTableProps {
  items: InventoryItem[]
  loading?: boolean
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onViewHistory?: (item: InventoryItem) => void
}

export default function InventoryTable({ items, loading, onEdit, onDelete, onViewHistory }: InventoryTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FACILITY_MANAGER'

  const columns: Column<InventoryItem>[] = [
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <Badge    variant={row.category === 'INGREDIENT' ? 'warning' : 'success'}>
          {row.category === 'INGREDIENT' ? 'Ingredient' : 'Finished Good'}
        </Badge>
      ),
    },
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
      render: (row) => (
        <div className="flex gap-2 ">
          {onViewHistory && (
            <Button size="sm" variant="secondary" onClick={() => onViewHistory(row)}><FiClock className="w-3 h-3" /></Button>
          )}
          {canManage && (
            <>
              <Button size="sm" variant="secondary" onClick={() => onEdit(row)}><FiEdit2 className="w-3 h-3" /></Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(row)}> <FiTrash2 className="w-3 h-3" /></Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <Table columns={columns} data={items} loading={loading} emptyMessage="No inventory items found." />
  )
}
