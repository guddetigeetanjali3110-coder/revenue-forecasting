import dataset from "./dataset.json"

export type Record = {
  year: number
  m: number // month index 0-11
  region: string
  category: string
  product: string
  channel: string
  units: number
  revenue: number
  cost: number
  profit: number
}

export type Meta = {
  years: number[]
  regions: string[]
  categories: string[]
  channels: string[]
  products: string[]
  months: string[]
  rowCount: number
  groupCount: number
}

const records = dataset.records as Record[]
export const meta = dataset.meta as Meta

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export type Filters = {
  year?: number | "all"
  region?: string | "all"
}

export function filterRecords(filters: Filters): Record[] {
  const { year = "all", region = "all" } = filters
  return records.filter((r) => {
    if (year !== "all" && r.year !== year) return false
    if (region !== "all" && r.region !== region) return false
    return true
  })
}

export type Kpis = {
  revenue: number
  cost: number
  profit: number
  units: number
  margin: number
  transactions: number
}

export function computeKpis(rows: Record[]): Kpis {
  let revenue = 0
  let cost = 0
  let profit = 0
  let units = 0
  for (const r of rows) {
    revenue += r.revenue
    cost += r.cost
    profit += r.profit
    units += r.units
  }
  return {
    revenue,
    cost,
    profit,
    units,
    margin: revenue ? (profit / revenue) * 100 : 0,
    transactions: rows.length,
  }
}

export type MonthPoint = {
  t: number
  label: string
  year: number
  m: number
  revenue: number
  cost: number
  profit: number
  units: number
}

/** Aggregate to a chronological monthly time series. */
export function monthlySeries(rows: Record[]): MonthPoint[] {
  const map = new Map<string, MonthPoint>()
  for (const r of rows) {
    const key = `${r.year}-${r.m}`
    let p = map.get(key)
    if (!p) {
      p = {
        t: 0,
        label: `${MONTH_ABBR[r.m]} '${String(r.year).slice(2)}`,
        year: r.year,
        m: r.m,
        revenue: 0,
        cost: 0,
        profit: 0,
        units: 0,
      }
      map.set(key, p)
    }
    p.revenue += r.revenue
    p.cost += r.cost
    p.profit += r.profit
    p.units += r.units
  }
  const arr = Array.from(map.values()).sort(
    (a, b) => a.year - b.year || a.m - b.m,
  )
  arr.forEach((p, i) => (p.t = i))
  return arr
}

export type Breakdown = { name: string; revenue: number; profit: number; units: number }

function groupBy(rows: Record[], key: keyof Record): Breakdown[] {
  const map = new Map<string, Breakdown>()
  for (const r of rows) {
    const name = String(r[key])
    let g = map.get(name)
    if (!g) {
      g = { name, revenue: 0, profit: 0, units: 0 }
      map.set(name, g)
    }
    g.revenue += r.revenue
    g.profit += r.profit
    g.units += r.units
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}

export const byRegion = (rows: Record[]) => groupBy(rows, "region")
export const byCategory = (rows: Record[]) => groupBy(rows, "category")
export const byChannel = (rows: Record[]) => groupBy(rows, "channel")
export const byProduct = (rows: Record[]) => groupBy(rows, "product")

export function topProducts(rows: Record[], n = 5): Breakdown[] {
  return byProduct(rows).slice(0, n)
}

// ----- Forecasting: simple linear regression (ordinary least squares) -----

export type Regression = {
  slope: number
  intercept: number
  rSquared: number
  n: number
}

export function linearRegression(points: { t: number; y: number }[]): Regression {
  const n = points.length
  if (n === 0) return { slope: 0, intercept: 0, rSquared: 0, n }
  let sumT = 0
  let sumY = 0
  let sumTT = 0
  let sumTY = 0
  for (const { t, y } of points) {
    sumT += t
    sumY += y
    sumTT += t * t
    sumTY += t * y
  }
  const denom = n * sumTT - sumT * sumT
  const slope = denom === 0 ? 0 : (n * sumTY - sumT * sumY) / denom
  const intercept = (sumY - slope * sumT) / n

  // R^2
  const meanY = sumY / n
  let ssTot = 0
  let ssRes = 0
  for (const { t, y } of points) {
    const pred = slope * t + intercept
    ssTot += (y - meanY) ** 2
    ssRes += (y - pred) ** 2
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  return { slope, intercept, rSquared, n }
}

export type ForecastPoint = {
  t: number
  label: string
  actual: number | null
  trend: number
  forecast: number | null
}

export type ForecastResult = {
  regression: Regression
  points: ForecastPoint[]
  historyCount: number
  horizon: number
  nextRevenue: number
  totalForecastRevenue: number
  avgHistoricalRevenue: number
  growthPerMonth: number
}

/**
 * Historical monthly revenue -> time index -> linear trend -> future forecast.
 */
export function buildForecast(rows: Record[], horizon = 12): ForecastResult {
  const series = monthlySeries(rows)
  const reg = linearRegression(series.map((p) => ({ t: p.t, y: p.revenue })))

  const points: ForecastPoint[] = series.map((p) => ({
    t: p.t,
    label: p.label,
    actual: p.revenue,
    trend: reg.slope * p.t + reg.intercept,
    forecast: null,
  }))

  // continue month labels into the future
  const last = series[series.length - 1]
  let year = last ? last.year : 2023
  let m = last ? last.m : 11

  // bridge point so the forecast line connects to history
  if (points.length > 0) {
    points[points.length - 1].forecast = points[points.length - 1].trend
  }

  for (let i = 1; i <= horizon; i++) {
    m += 1
    if (m > 11) {
      m = 0
      year += 1
    }
    const t = series.length - 1 + i
    const val = reg.slope * t + reg.intercept
    points.push({
      t,
      label: `${MONTH_ABBR[m]} '${String(year).slice(2)}`,
      actual: null,
      trend: val,
      forecast: val,
    })
  }

  const avgHistoricalRevenue = series.length
    ? series.reduce((s, p) => s + p.revenue, 0) / series.length
    : 0
  const futurePoints = points.filter((p) => p.actual === null && p.forecast !== null)
  const totalForecastRevenue = futurePoints.reduce((s, p) => s + (p.forecast ?? 0), 0)
  const nextRevenue = futurePoints.length ? (futurePoints[0].forecast ?? 0) : 0

  return {
    regression: reg,
    points,
    historyCount: series.length,
    horizon,
    nextRevenue,
    totalForecastRevenue,
    avgHistoricalRevenue,
    growthPerMonth: reg.slope,
  }
}
