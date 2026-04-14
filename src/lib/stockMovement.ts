import { PrismaClient } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

/**
 * Upsert a StockMovement record — add to quantityAdded and recompute remaining.
 */
export async function addToStock(tx: TxClient, itemName: string, qty: number) {
  const name = itemName.toLowerCase()
  const existing = await tx.stockMovement.findUnique({ where: { itemName: name } })
  if (existing) {
    const newAdded = Number(existing.quantityAdded) + qty
    const newRemaining = newAdded - Number(existing.quantitySold)
    await tx.stockMovement.update({
      where: { itemName: name },
      data: { quantityAdded: newAdded, quantityRemaining: newRemaining },
    })
  } else {
    await tx.stockMovement.create({
      data: { itemName: name, quantityAdded: qty, quantitySold: 0, quantityRemaining: qty },
    })
  }
}

/**
 * Upsert a StockMovement record — add to quantitySold and recompute remaining.
 */
export async function deductFromStock(tx: TxClient, itemName: string, qty: number) {
  const name = itemName.toLowerCase()
  const existing = await tx.stockMovement.findUnique({ where: { itemName: name } })
  if (existing) {
    const newSold = Number(existing.quantitySold) + qty
    const newRemaining = Number(existing.quantityAdded) - newSold
    await tx.stockMovement.update({
      where: { itemName: name },
      data: { quantitySold: newSold, quantityRemaining: newRemaining },
    })
  } else {
    await tx.stockMovement.create({
      data: { itemName: name, quantityAdded: 0, quantitySold: qty, quantityRemaining: -qty },
    })
  }
}

/** Recipe deduction map: recipe name → array of [ingredientName, qtyPerUnit] */
export const RECIPE_DEDUCTIONS: Record<string, [string, number][]> = {
  'coffee':       [['coffee bean', 11.11111 / 1000], ['sugar', 10 / 1000]],
  'normal tea':   [['tea powder', 10 / 900],          ['sugar', 20 / 1000]],
  'race tea':     [['race powder', 66.66667 / 1000],  ['sugar', 10 / 1000]],
  'mango tea':    [['mango powder', 30 / 900],         ['sugar', 10 / 1000]],
  'orange tea':   [['orange powder', 30 / 900],        ['sugar', 10 / 1000]],
  'special tea':  [
    ['mango powder', 25 / 900], ['sugar', 10 / 1000], ['orange powder', 25 / 900],
    ['zinjible', 33.33333 / 1000], ['honey', 10 / 1000], ['arekie', 20 / 1000], ['lomi', 20 / 1000],
  ],
  'spreas tea':   [['coffee bean', 17.64706 / 1000], ['sugar', 10 / 1000], ['tea powder', 5 / 900]],
  'milk':         [['raw milk', 150 / 1000], ['sugar', 10 / 1000]],
  'macchiato':    [['raw milk', 100 / 1000], ['sugar', 10 / 1000], ['coffee bean', 17.64706 / 1000]],
  'keshir':       [['zinjible', 50 / 1000], ['sugar', 10 / 1000]],
}
