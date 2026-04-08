'use client'

import { useState } from 'react'
import { usePrices, useCreatePrice } from '@/hooks/usePrices'
import PriceForm from '@/components/prices/PriceForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { PriceHistory } from '@/types'
import Skeleton from '@/components/ui/Skeleton'

export default function PricesPage() {
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)

  const { data: prices, isLoading } = usePrices()
  const createMutation = useCreatePrice()

  // Latest price per item name
  const latestPriceMap = new Map<string, PriceHistory>()
  if (Array.isArray(prices)) {
    for (const p of prices) {
      const existing = latestPriceMap.get(p.itemName)
      if (!existing || p.effectiveDate > existing.effectiveDate) {
        latestPriceMap.set(p.itemName, p)
      }
    }
  }
  const currentPrices = Array.from(latestPriceMap.values())

  async function handleFormSubmit(data: Partial<PriceHistory>) {
    try {
      await createMutation.mutateAsync(data)
      toast('Price set successfully')
      setFormOpen(false)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Something went wrong', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Prices</h2>
          <p className="text-sm text-amber-500">Set selling prices for any item</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>+ Set Price</Button>
      </div>

      {isLoading ? (
        <Skeleton height="h-40" />
      ) : currentPrices.length === 0 ? (
        <p className="text-sm text-amber-400 text-center py-8">No prices set yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-amber-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 border-b border-amber-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Current Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Effective Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-50">
              {currentPrices.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/50">
                  <td className="px-4 py-3 text-amber-900 font-medium">{p.itemName}</td>
                  <td className="px-4 py-3 text-right text-amber-900">{p.price}</td>
                  <td className="px-4 py-3 text-amber-600">{new Date(p.effectiveDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Set Price">
        <PriceForm onSubmit={handleFormSubmit} loading={createMutation.isPending} />
      </Modal>
    </div>
  )
}
