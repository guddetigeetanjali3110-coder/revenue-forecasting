// The dataset uses Indian states, so revenue is expressed in Indian Rupees (₹).

export function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)} K`
  return `${sign}₹${abs.toFixed(0)}`
}

export function formatCurrencyFull(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-IN")
}

export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `${(value / 1_00_000).toFixed(2)} L`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)} K`
  return String(Math.round(value))
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}
