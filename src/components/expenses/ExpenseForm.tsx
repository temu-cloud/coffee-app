'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { DailyExpense } from '@/types'

interface ExpenseFormProps {
  onSubmit: (data: Partial<DailyExpense>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  date?: string
  itemName?: string
  quantity?: string
  unitPrice?: string
}

export default function ExpenseForm({ onSubmit, loading }: ExpenseFormProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const totalPrice =
    quantity && unitPrice && !isNaN(Number(quantity)) && !isNaN(Number(unitPrice))
      ? (Number(quantity) * Number(unitPrice)).toFixed(2)
      : ''

  function validate(): boolean {
    const e: FormErrors = {}
    if (!date) e.date = 'Date is required'
    if (!itemName.trim()) e.itemName = 'Item name is required'
    else if (/^[0-9]+$/.test(itemName.trim())) e.itemName = 'Item name must contain letters'
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) e.quantity = 'Quantity must be > 0'
    if (!unitPrice || isNaN(Number(unitPrice)) || Number(unitPrice) <= 0) e.unitPrice = 'Unit price must be > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      date: new Date(date).toISOString(),
      itemName: itemName.trim(),
      quantity,
      unitPrice,
      totalPrice,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} disabled={loading} />
      <Input label="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} error={errors.itemName} placeholder="e.g. Milk" disabled={loading} />
      <Input label="Quantity" type="number" min="0.01" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} error={errors.quantity} disabled={loading} />
      <Input label="Unit Price" type="number" min="0.01" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} error={errors.unitPrice} disabled={loading} />
      <Input label="Total Price (auto-computed)" value={totalPrice} readOnly className="bg-amber-50 cursor-not-allowed" />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Add Expense</Button>
      </div>
    </form>
  )
}
