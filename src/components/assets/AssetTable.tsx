'use client'

import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { Asset, AssetCondition } from '@/types'

interface AssetTableProps {
  assets: Asset[]
  loading?: boolean
  onEdit: (asset: Asset) => void
}

const conditionVariant: Record<AssetCondition, 'success' | 'info' | 'warning' | 'danger'> = {
  EXCELLENT: 'success',
  GOOD: 'info',
  FAIR: 'warning',
  POOR: 'danger',
}

export default function AssetTable({ assets, loading, onEdit }: AssetTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FACILITY_MANAGER'

  const columns: Column<Asset>[] = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'acquisitionDate', header: 'Acquired', render: (row) => new Date(row.acquisitionDate).toLocaleDateString() },
    { key: 'quantity', header: 'Qty' },
    { key: 'unitCost', header: 'Unit Cost' },
    { key: 'totalCost', header: 'Total Cost' },
    {
      key: 'condition',
      header: 'Condition',
      render: (row) => (
        <Badge variant={conditionVariant[row.condition]}>{row.condition}</Badge>
      ),
    },
    { key: 'notes', header: 'Notes', render: (row) => row.notes ?? '—' },
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
    <Table columns={columns} data={assets} loading={loading} emptyMessage="No assets found." />
  )
}
