import dataset from "./data.json"

export type GroupRow = {
  name: string
  revenue: number
  cost: number
  profit: number
  units: number
}

export type Scope = {
  totals: {
    revenue: number
    cost: number
    profit: number
    units: number
    transactions: number
  }
  monthlyTrend: { label: string; revenue: number }[]
  byRegion: GroupRow[]
  byCategory: GroupRow[]
  byChannel: GroupRow[]
  topProducts: GroupRow[]
}

export type Dataset = {
  meta: {
    generatedAt: string
    rows: number
    years: number[]
    regions: string[]
    categories: string[]
    channels: string[]
    products: string[]
    dateRange: { start: string; end: string }
  }
  totals: Scope["totals"]
  scopes: Record<string, Scope>
  model: {
    slope: number
    intercept: number
    r2: number
    n: number
    equation: string
    meanMonthlyRevenue: number
  }
  history: {
    t: number
    key: string
    label: string
    year: number
    actual: number
    trend: number
  }[]
  forecast: {
    t: number
    key: string
    label: string
    year: number
    trend: number
    forecast: number
  }[]
  forecastSummary: {
    forecastTotal: number
    trailing12Revenue: number
    forecastStart: string
    forecastEnd: string
    growthPct: number
    avgMonthlyForecast: number
  }
}

export const data = dataset as unknown as Dataset

export function getScope(year: string, region: string): Scope {
  const key = `${year}|${region}`
  return data.scopes[key] ?? data.scopes["All|All"]
}

export type ExplorerRow = {
  id: string
  date: string
  year: number
  quarter: string
  month: string
  region: string
  state: string
  category: string
  product: string
  channel: string
  units: number
  revenue: number
  cost: number
  profit: number
}
