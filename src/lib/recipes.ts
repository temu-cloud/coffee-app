/**
 * Predefined recipe names available in the price form.
 */
export const RECIPE_NAMES = [
  'Coffee',
  'Normal Tea',
  'Race Tea',
  'Mango Tea',
  'Orange Tea',
  'Special Tea',
  'Spreas Tea',
  'Milk',
  'Macchiato',
  'Keshir',
] as const

export type RecipeName = (typeof RECIPE_NAMES)[number]

/**
 * Ingredient names required by each recipe (used to look up inventory costs).
 * Keys are lowercase inventory item names.
 */
export const RECIPE_INGREDIENTS: Record<RecipeName, string[]> = {
  Coffee: ['coffee bean', 'sugar'],
  'Normal Tea': ['tea powder', 'sugar'],
  'Race Tea': ['race powder', 'sugar'],
  'Mango Tea': ['mango powder', 'sugar'],
  'Orange Tea': ['orange powder', 'sugar'],
  'Special Tea': ['mango powder', 'sugar', 'orange powder', 'zinjible', 'arekie', 'lomi'],
  'Spreas Tea': ['tea powder', 'sugar', 'coffee bean'],
  Milk: ['raw milk', 'sugar'],
  Macchiato: ['raw milk', 'sugar', 'coffee bean'],
  Keshir: ['zinjible', 'sugar'],
}

/**
 * Computes the unit cost of a recipe given a map of ingredient unit costs.
 * `costs` keys are lowercase ingredient names; missing ingredients contribute 0.
 *
 * Feature: damot-coffee-enhancements, Property 5: Recipe cost formula correctness
 */
export function computeRecipeCost(
  recipe: string,
  costs: Record<string, number>
): number {
  const c = (name: string) => costs[name.toLowerCase()] ?? 0

  switch (recipe) {
    case 'Coffee':
      return (c('coffee bean') / 1000) * 11.11111 + (c('sugar') / 1000) * 10

    case 'Normal Tea':
      return (c('tea powder') / 100) * 10 + (c('sugar') / 1000) * 20

    case 'Race Tea':
      return (c('race powder') / 1000) * 66.66667 + (c('sugar') / 1000) * 10

    case 'Mango Tea':
      return (c('mango powder') / 900) * 30 + (c('sugar') / 1000) * 10

    case 'Orange Tea':
      return (c('orange powder') / 900) * 30 + (c('sugar') / 1000) * 10

    case 'Special Tea':
      return (
        (c('mango powder') / 900) * 25 +
        (c('sugar') / 1000) * 10 +
        (c('orange powder') / 900) * 25 +
        (c('zinjible') / 1000) * 33.3333 +
        (c('arekie') / 1000) * 20 +
        (c('lomi') / 1000) * 20
      )

    case 'Spreas Tea':
      return (
        (c('tea powder') / 1000) * 5 +
        (c('sugar') / 1000) * 10 +
        (c('coffee bean') / 1000) * 17.64706
      )

    case 'Milk':
      return (c('raw milk') / 1000) * 150 + (c('sugar') / 1000) * 10

    case 'Macchiato':
      return (
        (c('raw milk') / 1000) * 30 +
        (c('sugar') / 1000) * 10 +
        (c('coffee bean') / 1000) * 17.64706
      )

    case 'Keshir':
      return (c('zinjible') / 1000) * 50 + (c('sugar') / 1000) * 10

    default:
      return 0
  }
}
