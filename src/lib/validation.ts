/** Returns true if the value parses as a finite number greater than 0 */
export function isPositiveNumber(v: string): boolean {
  const n = Number(v)
  return isFinite(n) && n > 0
}

/** Returns true if the trimmed string contains at least one non-digit character */
export function hasNonNumericChar(v: string): boolean {
  return /[^0-9]/.test(v.trim())
}
