// The dataset is Indian (states like West Bengal, Odisha), so amounts are in INR.
// Large numbers use the Indian Crore (1 Cr = 10,000,000) / Lakh (1 L = 100,000) scale.

export function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`
  return `${sign}₹${abs.toFixed(0)}`
}

export function formatFullCurrency(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-IN")
}

export function formatCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(1)}Cr`
  if (abs >= 1_00_000) return `${(value / 1_00_000).toFixed(1)}L`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${value}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`
}
