'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { Asset, AssetCondition } from '@/types'

interface AssetFormProps {
  asset?: Asset | null
  onSubmit: (data: Partial<Asset>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  name?: string
  category?: string
  acquisitionDate?: string
  quantity?: string
  unitCost?: string
  condition?: string
}

export default function AssetForm({ asset, onSubmit, loading }: AssetFormProps) {
  const [name, setName] = useState(asset?.name ?? '')
  const [category, setCategory] = useState(asset?.category ?? '')
  const [acquisitionDate, setAcquisitionDate] = useState(asset?.acquisitionDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [quantity, setQuantity] = useState(String(asset?.quantity ?? ''))
  const [unitCost, setUnitCost] = useState(asset?.unitCost ?? '')
  const [condition, setCondition] = useState<AssetCondition>(asset?.condition ?? 'GOOD')
  const [notes, setNotes] = useState(asset?.notes ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const totalCost =
    quantity && unitCost && !isNaN(Number(quantity)) && !isNaN(Number(unitCost))
      ? (Number(quantity) * Number(unitCost)).toFixed(2)
      : ''

  function validate(): boolean {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!category.trim()) e.category = 'Category is required'
    if (!acquisitionDate) e.acquisitionDate = 'Acquisition date is required'
    if (!quantity || isNaN(Number(quantity)) || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
      e.quantity = 'Quantity must be a positive integer'
    if (!unitCost || isNaN(Number(unitCost)) || Number(unitCost) <= 0) e.unitCost = 'Unit cost must be > 0'
    if (!condition) e.condition = 'Condition is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      name: name.trim(),
      category: category.trim(),
      acquisitionDate: new Date(acquisitionDate).toISOString(),
      quantity: Number(quantity),
      unitCost,
      totalCost,
      condition,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Espresso Machine" disabled={loading} />
      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} error={errors.category} placeholder="e.g. Equipment" disabled={loading} />
      <Input label="Acquisition Date" type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} error={errors.acquisitionDate} disabled={loading} />
      <Input label="Quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} error={errors.quantity} disabled={loading} />
      <Input label="Unit Cost" type="number" min="0.01" step="any" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} error={errors.unitCost} disabled={loading} />
      <Input label="Total Cost (auto-computed)" value={totalCost} readOnly className="bg-amber-50 cursor-not-allowed" />
      <Select
        label="Condition"
        value={condition}
        onChange={(e) => setCondition(e.target.value as AssetCondition)}
        options={[
          { value: 'EXCELLENT', label: 'Excellent' },
          { value: 'GOOD', label: 'Good' },
          { value: 'FAIR', label: 'Fair' },
          { value: 'POOR', label: 'Poor' },
        ]}
        error={errors.condition}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-amber-900">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any additional notes…"
          disabled={loading}
          className="px-3 py-2 rounded-lg border border-amber-200 bg-white text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{asset ? 'Save Changes' : 'Add Asset'}</Button>
      </div>
    </form>
  )
}
