'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/axios'
import type { DailySale, PriceHistory } from '@/types'

interface SaleFormProps {
  onSubmit: (data: Partial<DailySale>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  itemName?: string
  date?: string
  quantitySold?: string
}

export default function SaleForm({ onSubmit, loading }: SaleFormProps) {
  const [selectedPriceId, setSelectedPriceId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [quantitySold, setQuantitySold] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  // Fetch distinct latest price per item name
  const { data: pricedItems = [] } = useQuery<PriceHistory[]>({
    queryKey: ['prices', 'distinct'],
    queryFn: () => api.get<PriceHistory[]>('/prices', { params: { distinct: true } }).then((r) => r.data),
    staleTime: 30_000,
  })

  const selected = pricedItems.find((p) => p.id === selectedPriceId)
  const unitPrice = selected?.price ?? null

  const saleTotal =
    unitPrice && quantitySold && !isNaN(Number(quantitySold)) && Number(quantitySold) > 0
      ? (Number(unitPrice) * Number(quantitySold)).toFixed(2)
      : ''

  function validate(): boolean {
    const e: FormErrors = {}
    if (!selectedPriceId) e.itemName = 'Please select an item'
    if (!date) e.date = 'Date is required'
    if (!quantitySold || isNaN(Number(quantitySold)) || Number(quantitySold) <= 0)
      e.quantitySold = 'Quantity must be > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      itemName: selected!.itemName,
      unitPrice: String(unitPrice),
      date: new Date(date).toISOString(),
      quantitySold,
      saleTotal,
      priceHistoryId: selectedPriceId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">Item</label>
        {pricedItems.length === 0 ? (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
            No items have a price set yet. Go to Prices to add one first.
          </div>
        ) : (
          <select
            value={selectedPriceId}
            onChange={(e) => { setSelectedPriceId(e.target.value); setQuantitySold('') }}
            className="w-full px-3 py-2.5 rounded-lg border border-amber-200 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            disabled={loading}
          >
            <option value="">— Select an item —</option>
            {pricedItems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.itemName} — {p.price}/unit
              </option>
            ))}
          </select>
        )}
        {errors.itemName && <p className="text-xs text-red-500 mt-1">{errors.itemName}</p>}
      </div>

      {unitPrice && (
        <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Price: <strong>{unitPrice}</strong> per unit
        </div>
      )}

      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} disabled={loading} />
      <Input
        label="Quantity Sold"
        type="number"
        min="0.01"
        step="any"
        value={quantitySold}
        onChange={(e) => setQuantitySold(e.target.value)}
        error={errors.quantitySold}
        disabled={loading}
      />
      {saleTotal && (
        <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
          Sale Total: <strong>{saleTotal}</strong>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Record Sale</Button>
      </div>
    </form>
  )
}
