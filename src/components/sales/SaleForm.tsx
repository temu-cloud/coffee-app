'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/axios'
import type { DailySale, PriceHistory } from '@/types'

interface SaleFormProps {
  sale?: DailySale | null
  onSubmit: (data: Partial<DailySale>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  itemName?: string
  date?: string
  quantitySold?: string
}

export default function SaleForm({ sale, onSubmit, loading }: SaleFormProps) {
  const [selectedPriceId, setSelectedPriceId] = useState(sale?.priceHistoryId ?? '')
  const [date, setDate] = useState(sale?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [quantitySold, setQuantitySold] = useState(sale?.quantitySold ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  // Fetch distinct latest price per item name
  const { data: pricedItems = [] } = useQuery<PriceHistory[]>({
    queryKey: ['prices', 'distinct'],
    queryFn: () => api.get<PriceHistory[]>('/prices', { params: { distinct: true } }).then((r) => r.data),
    staleTime: 30_000,
  })

  const selected = pricedItems.find((p) => p.id === selectedPriceId)
  const unitPrice = selected?.price ?? null
  const unitCost = selected?.unitCost ?? null

  const qty = Number(quantitySold)
  const saleTotal =
    unitPrice && qty > 0 ? (Number(unitPrice) * qty).toFixed(2) : ''
  const totalCost =
    unitCost != null && qty > 0 ? (Number(unitCost) * qty).toFixed(2) : ''
  const profit =
    saleTotal && totalCost ? (Number(saleTotal) - Number(totalCost)).toFixed(2) : ''

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
      unitCost: unitCost != null ? String(unitCost) : '0',
      date: new Date(date).toISOString(),
      quantitySold,
      saleTotal,
      totalCost: totalCost || '0',
      profit: profit || '0',
      priceHistoryId: selectedPriceId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Item selector */}
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

      {/* Cost per unit (read-only) */}
      {selected && (
        unitCost != null && Number(unitCost) > 0 ? (
          <Input
            label="Cost per unit"
            value={Number(unitCost).toFixed(4)}
            readOnly
            className="bg-amber-50 cursor-not-allowed"
          />
        ) : (
          <div className="px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
            ⚠ No unit cost recorded for this item — profit will be calculated as 0.
          </div>
        )
      )}

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        disabled={loading}
      />
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

      {/* Summary */}
      {saleTotal && (
        <div className="rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 px-3 py-2 space-y-1">
          <div>Sale Total: <strong>{saleTotal}</strong></div>
          {totalCost && <div>Total Cost: <strong>{totalCost}</strong></div>}
          {profit && <div>Profit: <strong>{profit}</strong></div>}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{sale ? 'Save Changes' : 'Record Sale'}</Button>
      </div>
    </form>
  )
}
