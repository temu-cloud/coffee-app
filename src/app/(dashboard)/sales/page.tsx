'use client'

import { useCallback, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useSales, useCreateSale } from '@/hooks/useSales'
import SaleFilters from '@/components/sales/SaleFilters'
import SaleTable from '@/components/sales/SaleTable'
import SaleForm from '@/components/sales/SaleForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { DailySale } from '@/types'

export default function SalesPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canCreate = role === 'SUPER_ADMIN' || role === 'ADMIN'

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const { data, isLoading } = useSales({ from: from || undefined, to: to || undefined, page: 1, pageSize: 50 })
  const createMutation = useCreateSale()

  const handleFilter = useCallback((f: string, t: string) => {
    setFrom(f)
    setTo(t)
  }, [])

  async function handleFormSubmit(data: Partial<DailySale>) {
    try {
      await createMutation.mutateAsync(data)
      toast('Sale recorded successfully')
      setFormOpen(false)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Something went wrong', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Sales</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} records total</p>
        </div>
        {canCreate && <Button onClick={() => setFormOpen(true)}>+ Record Sale</Button>}
      </div>

      <SaleFilters onFilter={handleFilter} />

      <SaleTable sales={data?.data ?? []} loading={isLoading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Record Sale">
        <SaleForm onSubmit={handleFormSubmit} loading={createMutation.isPending} />
      </Modal>
    </div>
  )
}
