'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import type { InventoryItem, ItemCategory } from '@/types'

const INGREDIENT_DEFAULTS = [
  'coffee bean', 'sugar', 'tea powder', 'mango powder', 'race powder',
  'orange powder', 'zinjible', 'honey', 'arekie', 'lomi', 'raw milk',
]
const FINISHED_GOOD_DEFAULTS = ['water', 'coca cola', 'sprite', 'mirinda', 'pepsi']

const LS_KEY = (cat: ItemCategory) => `inventory_custom_names_${cat}`

function loadCustomNames(cat: ItemCategory): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY(cat))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCustomName(cat: ItemCategory, name: string) {
  const existing = loadCustomNames(cat)
  if (!existing.includes(name.toLowerCase())) {
    localStorage.setItem(LS_KEY(cat), JSON.stringify([...existing, name.toLowerCase()]))
  }
}

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
  const [selectedName, setSelectedName] = useState(item?.name?.toLowerCase() ?? '')
  const [customInput, setCustomInput] = useState('')
  const [customNames, setCustomNames] = useState<string[]>([])
  const [units, setUnits] = useState(item?.units ?? '')
  const [quantity, setQuantity] = useState(item?.quantity ?? '')
  const [unitCost, setUnitCost] = useState(item?.unitCost ?? '')
  const [supplier, setSupplier] = useState(item?.supplier ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  // Load custom names from localStorage when category changes
  useEffect(() => {
    setCustomNames(loadCustomNames(category))
    if (!item) {
      setSelectedName('')
      setCustomInput('')
    }
  }, [category, item])

  const defaults = category === 'INGREDIENT' ? INGREDIENT_DEFAULTS : FINISHED_GOOD_DEFAULTS
  const allNames = [...defaults, ...customNames.filter((n) => !defaults.includes(n))]
  const nameOptions = [
    ...allNames.map((n) => ({ value: n, label: n.charAt(0).toUpperCase() + n.slice(1) })),
    { value: '__add__', label: '+ Add new...' },
  ]

  const isAddNew = selectedName === '__add__'
  const finalName = isAddNew ? customInput.trim() : selectedName

  const totalCost =
    quantity && unitCost && !isNaN(Number(quantity)) && !isNaN(Number(unitCost))
      ? (Number(quantity) * Number(unitCost)).toFixed(2)
      : ''

  function validate(): boolean {
    const e: FormErrors = {}
    if (!category) e.category = 'Category is required'
    if (!date) e.date = 'Date is required'
    if (!finalName) e.name = 'Name is required'
    else if (/^[0-9]+$/.test(finalName)) e.name = 'Name must contain letters'
    if (!units.trim()) e.units = 'Units is required'
    else if (/^[0-9]+$/.test(units.trim())) e.units = 'Units must contain letters'
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) e.quantity = 'Quantity must be > 0'
    if (!unitCost || isNaN(Number(unitCost)) || Number(unitCost) <= 0) e.unitCost = 'Unit cost must be > 0'
    if (!supplier.trim()) e.supplier = 'Supplier is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    // Persist new custom name
    if (isAddNew && customInput.trim()) {
      saveCustomName(category, customInput.trim())
      setCustomNames(loadCustomNames(category))
    }
    await onSubmit({
      category,
      date: new Date(date).toISOString(),
      name: finalName,
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

      {/* Name dropdown */}
      <Select
        label="Item Name"
        value={selectedName}
        onChange={(e) => { setSelectedName(e.target.value); setCustomInput('') }}
        options={nameOptions}
        placeholder="— select item —"
        error={!isAddNew ? errors.name : undefined}
        disabled={loading}
      />

      {/* Custom name input when "Add new..." selected */}
      {isAddNew && (
        <Input
          label="New item name"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          error={errors.name}
          placeholder="Type new item name..."
          disabled={loading}
          autoFocus
        />
      )}

      <DatePicker label="Date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} disabled={loading} />
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
