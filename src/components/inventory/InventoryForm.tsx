'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { InventoryItem, ItemCategory } from '@/types'

interface InventoryFormProps {
  item?: InventoryItem | null
  onSubmit: (data: Partial<InventoryItem>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  category?: string
  date?: string
  name?: string
  units?: string
  quantity?: string
  unitCost?: string
  supplier?: string
}

export default function InventoryForm({ item, onSubmit, loading }: InventoryFormProps) {
  const [category, setCategory] = useState<ItemCategory>(item?.category ?? 'INGREDIENT')
  const [date, setDate] = useState(item?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [name, setName] = useState(item?.name ?? '')
  const [units, setUnits] = useState(item?.units ?? '')
  const [quantity, setQuantity] = useState(item?.quantity ?? '')
  const [unitCost, setUnitCost] = useState(item?.unitCost ?? '')
  const [supplier, setSupplier] = useState(item?.supplier ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const totalCost =
    quantity && unitCost && !isNaN(Number(quantity)) && !isNaN(Number(unitCost))
      ? (Number(quantity) * Number(unitCost)).toFixed(2)
      : ''

  function validate(): boolean {
    const e: FormErrors = {}
    if (!category) e.category = 'Category is required'
    if (!date) e.date = 'Date is required'
    if (!name.trim()) e.name = 'Name is required'
    if (!units.trim()) e.units = 'Units is required'
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) e.quantity = 'Quantity must be > 0'
    if (!unitCost || isNaN(Number(unitCost)) || Number(unitCost) <= 0) e.unitCost = 'Unit cost must be > 0'
    if (!supplier.trim()) e.supplier = 'Supplier is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      category,
      date: new Date(date).toISOString(),
      name: name.trim(),
      units: units.trim(),
      quantity,
      unitCost,
      totalCost,
      supplier: supplier.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value as ItemCategory)}
        options={[
          { value: 'INGREDIENT', label: 'Ingredient' },
          { value: 'FINISHED_GOOD', label: 'Finished Good' },
        ]}
        error={errors.category}
      />
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} disabled={loading} />
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Arabica Beans" disabled={loading} />
      <Input label="Units" value={units} onChange={(e) => setUnits(e.target.value)} error={errors.units} placeholder="e.g. kg, liters, pcs" disabled={loading} />
      <Input label="Quantity" type="number" min="0.01" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} error={errors.quantity} disabled={loading} />
      <Input label="Unit Cost" type="number" min="0.01" step="any" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} error={errors.unitCost} disabled={loading} />
      <Input label="Total Cost (auto-computed)" value={totalCost} readOnly className="bg-amber-50 cursor-not-allowed" />
      <Input label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} error={errors.supplier} placeholder="Supplier name" disabled={loading} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{item ? 'Save Changes' : 'Add Item'}</Button>
      </div>
    </form>
  )
}
