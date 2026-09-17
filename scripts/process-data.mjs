import fs from "node:fs"
import path from "node:path"

// Processes the real Revenue Forecasting dataset into precomputed JSON.
// Pipeline: Historical Monthly Revenue -> Time Index -> Trend Analysis ->
//           Linear Regression -> Future Revenue Forecast.

const ROOT = process.cwd()
const CSV = path.join(ROOT, "Revenue_Forecasting_Industrial_Dataset.csv")
const OUT = path.join(ROOT, "lib", "data.json")

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const MONTH_INDEX = Object.fromEntries(MONTH_ORDER.map((m, i) => [m, i]))
const MONTH_SHORT = MONTH_ORDER.map((m) => m.slice(0, 3))

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines[0].split(",")
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",")
    if (cols.length < headers.length) continue
    const row = {}
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cols[j]
    rows.push(row)
  }
  return rows
}

const raw = fs.readFileSync(CSV, "utf8")
const rows = parseCSV(raw)

const num = (v) => {
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : 0
}
const round2 = (n) => Math.round(n * 100) / 100
const round0 = (n) => Math.round(n)

const records = rows.map((r) => ({
  id: r.Transaction_ID,
  date: r.Date,
  year: Number.parseInt(r.Year, 10),
  quarter: r.Quarter,
  month: r.Month,
  region: r.Region,
  state: r.State,
  category: r.Product_Category,
  product: r.Product,
  channel: r.Sales_Channel,
  units: num(r.Units_Sold),
  revenue: num(r.Revenue),
  cost: num(r.Cost),
  profit: num(r.Profit),
}))

const years = [...new Set(records.map((r) => r.year))].sort()
const regions = [...new Set(records.map((r) => r.region))].sort()
const categories = [...new Set(records.map((r) => r.category))].sort()
const channels = [...new Set(records.map((r) => r.channel))].sort()
const products = [...new Set(records.map((r) => r.product))].sort()

// ---- Totals ----
const totals = records.reduce(
  (acc, r) => {
    acc.revenue += r.revenue
    acc.cost += r.cost
    acc.profit += r.profit
    acc.units += r.units
    return acc
  },
  { revenue: 0, cost: 0, profit: 0, units: 0 },
)
totals.revenue = round2(totals.revenue)
totals.cost = round2(totals.cost)
totals.profit = round2(totals.profit)
totals.transactions = records.length

// ---- Monthly series (year-month) ----
function buildMonthly(recs) {
  const map = new Map()
  for (const r of recs) {
    const key = `${r.year}-${String(MONTH_INDEX[r.month] + 1).padStart(2, "0")}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        year: r.year,
        monthIndex: MONTH_INDEX[r.month],
        label: `${MONTH_SHORT[MONTH_INDEX[r.month]]} ${r.year}`,
        revenue: 0,
        cost: 0,
        profit: 0,
        units: 0,
      })
    }
    const m = map.get(key)
    m.revenue += r.revenue
    m.cost += r.cost
    m.profit += r.profit
    m.units += r.units
  }
  const arr = [...map.values()].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.monthIndex - b.monthIndex,
  )
  arr.forEach((m, i) => {
    m.t = i + 1 // time index
    m.revenue = round2(m.revenue)
    m.cost = round2(m.cost)
    m.profit = round2(m.profit)
  })
  return arr
}

const monthly = buildMonthly(records)

// ---- Linear regression (least squares) on monthly revenue vs time index ----
function linearRegression(points) {
  const n = points.length
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  // R^2
  const meanY = sumY / n
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  return { slope, intercept, r2 }
}

const regPoints = monthly.map((m) => ({ x: m.t, y: m.revenue }))
const { slope, intercept, r2 } = linearRegression(regPoints)

// Historical with fitted trend line
const history = monthly.map((m) => ({
  t: m.t,
  key: m.key,
  label: m.label,
  year: m.year,
  actual: m.revenue,
  trend: round2(slope * m.t + intercept),
}))

// Forecast next 12 months, continuing from the last actual month.
const lastMonth = monthly[monthly.length - 1]
let curYear = lastMonth.year
let curMonthIdx = lastMonth.monthIndex
const forecast = []
for (let i = 1; i <= 12; i++) {
  const t = monthly.length + i
  curMonthIdx += 1
  if (curMonthIdx > 11) {
    curMonthIdx = 0
    curYear += 1
  }
  forecast.push({
    t,
    key: `${curYear}-${String(curMonthIdx + 1).padStart(2, "0")}`,
    label: `${MONTH_SHORT[curMonthIdx]} ${curYear}`,
    year: curYear,
    trend: round2(slope * t + intercept),
    forecast: round2(slope * t + intercept),
  })
}

const forecastTotal = round2(forecast.reduce((s, f) => s + f.forecast, 0))
// Compare next-12 forecast against trailing-12 actual months (apples to apples).
const trailing12 = monthly.slice(-12)
const trailing12Revenue = round2(trailing12.reduce((s, m) => s + m.revenue, 0))

// ---- Group-by helpers ----
function groupSum(recs, key) {
  const map = new Map()
  for (const r of recs) {
    const k = r[key]
    if (!map.has(k)) map.set(k, { name: k, revenue: 0, cost: 0, profit: 0, units: 0 })
    const g = map.get(k)
    g.revenue += r.revenue
    g.cost += r.cost
    g.profit += r.profit
    g.units += r.units
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      revenue: round2(g.revenue),
      cost: round2(g.cost),
      profit: round2(g.profit),
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// Precompute per-year + all filters for region and year combos for the dashboard.
function buildScope(recs) {
  const t = recs.reduce(
    (acc, r) => {
      acc.revenue += r.revenue
      acc.cost += r.cost
      acc.profit += r.profit
      acc.units += r.units
      return acc
    },
    { revenue: 0, cost: 0, profit: 0, units: 0 },
  )
  return {
    totals: {
      revenue: round2(t.revenue),
      cost: round2(t.cost),
      profit: round2(t.profit),
      units: t.units,
      transactions: recs.length,
    },
    monthlyTrend: buildMonthly(recs).map((m) => ({ label: m.label, revenue: m.revenue })),
    byRegion: groupSum(recs, "region"),
    byCategory: groupSum(recs, "category"),
    byChannel: groupSum(recs, "channel"),
    topProducts: groupSum(recs, "product").slice(0, 5),
  }
}

// Build a lookup keyed by `${year}|${region}` with "All" wildcards.
const scopes = {}
const yearOpts = ["All", ...years.map(String)]
const regionOpts = ["All", ...regions]
for (const y of yearOpts) {
  for (const rg of regionOpts) {
    const filtered = records.filter(
      (r) => (y === "All" || r.year === Number(y)) && (rg === "All" || r.region === rg),
    )
    scopes[`${y}|${rg}`] = buildScope(filtered)
  }
}

// ---- Data explorer: monthly aggregate table (compact, real numbers) ----
const explorer = []
for (const r of records) {
  explorer.push({
    id: r.id,
    date: r.date,
    year: r.year,
    quarter: r.quarter,
    month: r.month,
    region: r.region,
    state: r.state,
    category: r.category,
    product: r.product,
    channel: r.channel,
    units: r.units,
    revenue: round0(r.revenue),
    cost: round0(r.cost),
    profit: round0(r.profit),
  })
}

const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    rows: records.length,
    years,
    regions,
    categories,
    channels,
    products,
    dateRange: {
      start: `${years[0]}-01`,
      end: `${years[years.length - 1]}-12`,
    },
  },
  totals,
  scopes,
  model: {
    slope: round2(slope),
    intercept: round2(intercept),
    r2: Math.round(r2 * 10000) / 10000,
    n: monthly.length,
    equation: `Revenue = ${round2(slope)} × t + ${round2(intercept)}`,
    meanMonthlyRevenue: round2(totals.revenue / monthly.length),
  },
  history,
  forecast,
  forecastSummary: {
    forecastTotal,
    trailing12Revenue,
    forecastStart: forecast[0].label,
    forecastEnd: forecast[forecast.length - 1].label,
    growthPct: round2(((forecastTotal - trailing12Revenue) / trailing12Revenue) * 100),
    avgMonthlyForecast: round2(forecastTotal / 12),
  },
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(output))

// Explorer transactions are large; serve them as a static asset fetched on demand.
const PUB = path.join(ROOT, "public", "data")
fs.mkdirSync(PUB, { recursive: true })
fs.writeFileSync(path.join(PUB, "explorer.json"), JSON.stringify({ meta: output.meta, rows: explorer }))

console.log("[v0] Wrote", OUT)
console.log("[v0] rows:", records.length, "months:", monthly.length)
console.log("[v0] slope:", round2(slope), "intercept:", round2(intercept), "r2:", r2)
console.log("[v0] totals:", totals)
console.log("[v0] forecastTotal:", forecastTotal, "growth%:", output.forecastSummary.growthPct)
