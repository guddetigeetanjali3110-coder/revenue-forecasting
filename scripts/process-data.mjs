import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const csvPath = path.join(root, "Revenue_Forecasting_Industrial_Dataset.csv")
const raw = fs.readFileSync(csvPath, "utf8")

const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
const header = lines[0].split(",")

const idx = (name) => header.indexOf(name)
const iYear = idx("Year")
const iMonth = idx("Month")
const iRegion = idx("Region")
const iState = idx("State")
const iCategory = idx("Product_Category")
const iProduct = idx("Product")
const iChannel = idx("Sales_Channel")
const iUnits = idx("Units_Sold")
const iRevenue = idx("Revenue")
const iCost = idx("Cost")
const iProfit = idx("Profit")

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const monthIndex = (m) => MONTHS.indexOf(m)

// Fine-grained aggregation grouped by year, month, region, category, product, channel
const groups = new Map()

for (let i = 1; i < lines.length; i++) {
  const c = lines[i].split(",")
  const year = Number(c[iYear])
  const month = c[iMonth]
  const region = c[iRegion]
  const category = c[iCategory]
  const product = c[iProduct]
  const channel = c[iChannel]
  const units = Number(c[iUnits]) || 0
  const revenue = Number(c[iRevenue]) || 0
  const cost = Number(c[iCost]) || 0
  const profit = Number(c[iProfit]) || 0

  const key = [year, month, region, category, product, channel].join("|")
  let g = groups.get(key)
  if (!g) {
    g = {
      year,
      month,
      m: monthIndex(month),
      region,
      category,
      product,
      channel,
      units: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
    }
    groups.set(key, g)
  }
  g.units += units
  g.revenue += revenue
  g.cost += cost
  g.profit += profit
}

const records = Array.from(groups.values())
  .map((g) => ({
    year: g.year,
    m: g.m,
    region: g.region,
    category: g.category,
    product: g.product,
    channel: g.channel,
    units: Math.round(g.units),
    revenue: Math.round(g.revenue),
    cost: Math.round(g.cost),
    profit: Math.round(g.profit),
  }))
  .sort((a, b) => a.year - b.year || a.m - b.m)

const years = Array.from(new Set(records.map((r) => r.year))).sort()
const regions = Array.from(new Set(records.map((r) => r.region))).sort()
const categories = Array.from(new Set(records.map((r) => r.category))).sort()
const channels = Array.from(new Set(records.map((r) => r.channel))).sort()
const products = Array.from(new Set(records.map((r) => r.product))).sort()

const meta = {
  years,
  regions,
  categories,
  channels,
  products,
  months: MONTHS,
  rowCount: lines.length - 1,
  groupCount: records.length,
}

const out = { meta, records }

const outDir = path.join(root, "lib")
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, "dataset.json"), JSON.stringify(out))

const bytes = fs.statSync(path.join(outDir, "dataset.json")).size
console.log(
  `[v0] wrote lib/dataset.json: ${records.length} groups from ${lines.length - 1} rows, ${(bytes / 1024).toFixed(1)} KB`,
)
