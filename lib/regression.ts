// Ordinary least-squares linear regression: y = slope * t + intercept.
// Same method used to build the global model in scripts/process-data.mjs, so
// filtered views on the client stay consistent with the precomputed forecast.

export type Regression = {
  slope: number
  intercept: number
  r2: number
  n: number
}

export function linearRegression(values: number[]): Regression {
  const n = values.length
  if (n === 0) return { slope: 0, intercept: 0, r2: 0, n: 0 }

  const xs = values.map((_, i) => i + 1)
  const sumX = xs.reduce((s, x) => s + x, 0)
  const sumY = values.reduce((s, y) => s + y, 0)
  const sumXY = xs.reduce((s, x, i) => s + x * values[i], 0)
  const sumXX = xs.reduce((s, x) => s + x * x, 0)

  const denom = n * sumXX - sumX * sumX
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  const ssTot = values.reduce((s, y) => s + (y - meanY) ** 2, 0)
  const ssRes = values.reduce((s, y, i) => s + (y - (slope * xs[i] + intercept)) ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, r2, n }
}

export function predict(reg: Regression, t: number): number {
  return reg.slope * t + reg.intercept
}
