'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { computeRecipeCost, RECIPE_NAMES, RECIPE_INGREDIENTS } from '@/lib/recipes'
import type { PriceHistory, InventoryItem, IngredientCost } from '@/types'

type PriceCategory = 'FINISHED_GOOD' | 'RECIPE' | 'OTHER'

interface PriceFormProps {
  item?: PriceHistory | null
  onSubmit: (data: Partial<PriceHistory>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  category?: string
  itemName?: string
  unitCost?: string
  price?: string
  effectiveDate?: string
}

export default function PriceForm({ item, onSubmit, loading }: PriceFormProps) {
  const [category, setCategory] = useState<PriceCategory>((item?.category as PriceCategory) ?? 'OTHER')
  const [itemName, setItemName] = useState(item?.itemName ?? '')
  const [unitCost, setUnitCost] = useState(item?.unitCost ?? '')
  const [price, setPrice] = useState(item?.price ?? '')
  const [effectiveDate, setEffectiveDate] = useState(
    item?.effectiveDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  )
  const [errors, setErrors] = useState<FormErrors>({})

  // Finished Good state
  const [finishedGoods, setFinishedGoods] = useState<InventoryItem[]>([])
  const [selectedFgId, setSelectedFgId] = useState('')

  // Recipe state
  const [selectedRecipe, setSelectedRecipe] = useState('')
  const [ingredientCosts, setIngredientCosts] = useState<Record<string, number>>({})
  const [missingIngredients, setMissingIngredients] = useState<string[]>([])

  // Fetch finished goods when category = FINISHED_GOOD
  useEffect(() => {
    if (category !== 'FINISHED_GOOD') return
    fetch('/api/inventory?category=FINISHED_GOOD&pageSize=100')
      .then((r) => r.json())
      .then((d) => setFinishedGoods(Array.isArray(d.data) ? d.data : []))
      .catch(() => setFinishedGoods([]))
  }, [category])

  // Fetch ingredient costs when category = RECIPE
  useEffect(() => {
    if (category !== 'RECIPE') return
    fetch('/api/inventory/ingredient-costs')
      .then((r) => r.json())
      .then((data: IngredientCost[]) => {
        const map: Record<string, number> = {}
        if (Array.isArray(data)) {
          data.forEach((ic) => { map[ic.name.toLowerCase()] = Number(ic.unitCost) })
        }
        setIngredientCosts(map)
      })
      .catch(() => setIngredientCosts({}))
  }, [category])

  // Auto-compute unit cost when recipe changes
  useEffect(() => {
    if (category !== 'RECIPE' || !selectedRecipe) return
    const computed = computeRecipeCost(selectedRecipe, ingredientCosts)
    setUnitCost(computed.toFixed(4))
    setItemName(selectedRecipe)

    // Check for missing ingredients
    const required = RECIPE_INGREDIENTS[selectedRecipe as keyof typeof RECIPE_INGREDIENTS] ?? []
    const missing = required.filter((ing) => !(ing.toLowerCase() in ingredientCosts))
    setMissingIngredients(missing)
  }, [selectedRecipe, ingredientCosts, category])

  // Auto-populate unit cost when finished good selected
  function handleFgSelect(id: string) {
    setSelectedFgId(id)
    const fg = finishedGoods.find((f) => f.id === id)
    if (fg) {
      setItemName(fg.name)
      setUnitCost(fg.unitCost)
    }
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!category) e.category = 'Category is required'
    if (!effectiveDate) e.effectiveDate = 'Date is required'

    if (category === 'FINISHED_GOOD') {
      if (!selectedFgId) e.itemName = 'Please select a finished good'
    } else if (category === 'RECIPE') {
      if (!selectedRecipe) e.itemName = 'Please select a recipe'
    } else {
      if (!itemName.trim()) e.itemName = 'Item name is required'
      else if (/^[0-9]+$/.test(itemName.trim())) e.itemName = 'Item name must contain letters'
      if (!unitCost || isNaN(Number(unitCost)) || Number(unitCost) < 0) e.unitCost = 'Unit cost must be a valid number'
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = 'Price must be > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      itemName: itemName.trim(),
      price,
      effectiveDate: new Date(effectiveDate).toISOString(),
      category,
      unitCost: unitCost !== '' ? unitCost : null,
      inventoryItemId: category === 'FINISHED_GOOD' ? selectedFgId : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category */}
      <Select
        label="Category"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value as PriceCategory)
          setItemName('')
          setUnitCost('')
          setSelectedFgId('')
          setSelectedRecipe('')
          setMissingIngredients([])
          setErrors({})
        }}
        options={[
          { value: 'FINISHED_GOOD', label: 'Finished Good' },
          { value: 'RECIPE', label: 'Recipe' },
          { value: 'OTHER', label: 'Other' },
        ]}
        error={errors.category}
        disabled={loading}
      />

      {/* Finished Good sub-fields */}
      {category === 'FINISHED_GOOD' && (
        <>
          <Select
            label="Select Finished Good"
            value={selectedFgId}
            onChange={(e) => handleFgSelect(e.target.value)}
            options={finishedGoods.map((fg) => ({ value: fg.id, label: fg.name }))}
            placeholder="— choose item —"
            error={errors.itemName}
            disabled={loading}
          />
          {unitCost && (
            <Input label="Unit Cost (from inventory)" value={unitCost} readOnly className="bg-amber-50 cursor-not-allowed" />
          )}
        </>
      )}

      {/* Recipe sub-fields */}
      {category === 'RECIPE' && (
        <>
          <Select
            label="Select Recipe"
            value={selectedRecipe}
            onChange={(e) => setSelectedRecipe(e.target.value)}
            options={RECIPE_NAMES.map((r) => ({ value: r, label: r }))}
            placeholder="— choose recipe —"
            error={errors.itemName}
            disabled={loading}
          />
          {missingIngredients.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠ Missing ingredients (cost treated as 0): {missingIngredients.join(', ')}
            </p>
          )}
          {unitCost && (
            <Input label="Computed Unit Cost" value={unitCost} readOnly className="bg-amber-50 cursor-not-allowed" />
          )}
        </>
      )}

      {/* Other sub-fields */}
      {category === 'OTHER' && (
        <>
          <Input
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            error={errors.itemName}
            placeholder="e.g. Takeaway Cup"
            disabled={loading}
            autoComplete="off"
          />
          <Input
            label="Unit Cost"
            type="number"
            min="0"
            step="any"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            error={errors.unitCost}
            placeholder="e.g. 5.00"
            disabled={loading}
          />
        </>
      )}

      {/* Shared fields */}
      <Input
        label="Selling Price (per unit)"
        type="number"
        min="0.01"
        step="any"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={errors.price}
        placeholder="e.g. 45.00"
        disabled={loading}
      />
      <Input
        label="Effective Date"
        type="date"
        value={effectiveDate}
        onChange={(e) => setEffectiveDate(e.target.value)}
        error={errors.effectiveDate}
        disabled={loading}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{item ? 'Save Changes' : 'Set Price'}</Button>
      </div>
    </form>
  )
}
