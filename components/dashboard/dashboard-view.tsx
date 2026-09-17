"use client"

import { useMemo, useState } from "react"
import {
  IndianRupee,
  Wallet,
  TrendingUp,
  Package,
  MapPin,
  Layers,
  Store,
  Trophy,
} from "lucide-react"
import type { Dataset, Scope } from "@/lib/data"
import { linearRegression, predict } from "@/lib/regression"
import { formatCurrency, formatFullCurrency, formatNumber, formatPercent } from "@/lib/format"
import { KpiCard } from "@/components/kpi-card"
import { FilterSelect } from "@/components/filter-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AreaTrendChart } from "@/components/charts/area-trend-chart"
import { ActualForecastChart } from "@/components/charts/actual-forecast-chart"
import { BarBreakdownChart } from "@/components/charts/bar-breakdown-chart"
import { ChannelDonutChart } from "@/components/charts/channel-donut-chart"
import { TopProductsChart } from "@/components/charts/top-products-chart"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function nextLabels(lastLabel: string, count: number): string[] {
  const [mon, year] = lastLabel.split(" ")
  let mi = MONTHS.indexOf(mon)
  let yr = Number.parseInt(year, 10)
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    mi += 1
    if (mi > 11) {
      mi = 0
      yr += 1
    }
    out.push(`${MONTHS[mi]} ${yr}`)
  }
  return out
}

export function DashboardView({
  meta,
  scopes,
}: {
  meta: Dataset["meta"]
  scopes: Record<string, Scope>
}) {
  const [year, setYear] = useState("All")
  const [region, setRegion] = useState("All")

  const scope = scopes[`${year}|${region}`] ?? scopes["All|All"]
  // Region breakdown ignores the region filter so the comparison stays meaningful.
  const regionScope = scopes[`${year}|All`] ?? scopes["All|All"]

  const yearOptions = [
    { value: "All", label: "All Years" },
    ...meta.years.map((y) => ({ value: String(y), label: String(y) })),
  ]
  const regionOptions = [
    { value: "All", label: "All Regions" },
    ...meta.regions.map((r) => ({ value: r, label: r })),
  ]

  const t = scope.totals
  const profitMargin = t.revenue > 0 ? (t.profit / t.revenue) * 100 : 0

  const forecastData = useMemo(() => {
    const series = scope.monthlyTrend
    if (series.length < 2) {
      return { rows: [] as { label: string; actual: number | null; forecast: number | null }[], split: undefined }
    }
    const reg = linearRegression(series.map((m) => m.revenue))
    const horizon = 6
    const rows: { label: string; actual: number | null; forecast: number | null }[] = series.map(
      (m) => ({ label: m.label, actual: m.revenue, forecast: null }),
    )
    // Connect the actual line to the forecast line at the last known point.
    rows[rows.length - 1].forecast = series[series.length - 1].revenue
    const future = nextLabels(series[series.length - 1].label, horizon)
    future.forEach((label, i) => {
      rows.push({ label, actual: null, forecast: Math.round(predict(reg, series.length + i + 1)) })
    })
    return { rows, split: series[series.length - 1].label }
  }, [scope])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-4">
          <FilterSelect
            label="Year"
            value={year}
            onValueChange={setYear}
            options={yearOptions}
          />
          <FilterSelect
            label="Region"
            value={region}
            onValueChange={setRegion}
            options={regionOptions}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{formatNumber(t.transactions)} transactions</Badge>
          <Badge variant="secondary">
            {year === "All" ? `${meta.years[0]}–${meta.years[meta.years.length - 1]}` : year}
          </Badge>
          <Badge variant="secondary">{region === "All" ? "All regions" : region}</Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(t.revenue)}
          sub={formatFullCurrency(t.revenue)}
          icon={IndianRupee}
        />
        <KpiCard
          label="Total Cost"
          value={formatCurrency(t.cost)}
          sub={`${((t.cost / t.revenue) * 100 || 0).toFixed(1)}% of revenue`}
          icon={Wallet}
        />
        <KpiCard
          label="Total Profit"
          value={formatCurrency(t.profit)}
          sub={`${profitMargin.toFixed(1)}% margin`}
          icon={TrendingUp}
          badge={formatPercent(profitMargin, 0)}
          badgeTone="positive"
        />
        <KpiCard
          label="Total Units Sold"
          value={formatNumber(t.units)}
          sub="units across all products"
          icon={Package}
        />
      </div>

      {/* Trend + Forecast */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
            <CardDescription>Aggregated revenue per month for the current filters</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaTrendChart data={scope.monthlyTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">Actual vs Forecast Revenue</CardTitle>
                <CardDescription>
                  Trend-fitted projection for the next 6 months
                </CardDescription>
              </div>
              <TrendingUp className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ActualForecastChart data={forecastData.rows} splitLabel={forecastData.split} />
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <CardTitle className="text-base">Revenue by Region</CardTitle>
            </div>
            <CardDescription>
              {region === "All" ? "All regions compared" : `${region} highlighted vs peers`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarBreakdownChart
              data={regionScope.byRegion.map((r) => ({ name: r.name, revenue: r.revenue }))}
              highlight={region === "All" ? undefined : region}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <CardTitle className="text-base">Revenue by Product Category</CardTitle>
            </div>
            <CardDescription>Revenue split across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <BarBreakdownChart
              data={scope.byCategory.map((r) => ({ name: r.name, revenue: r.revenue }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="size-4 text-primary" />
              <CardTitle className="text-base">Revenue by Sales Channel</CardTitle>
            </div>
            <CardDescription>Share of revenue by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelDonutChart
              data={scope.byChannel.map((r) => ({ name: r.name, revenue: r.revenue }))}
              centerLabel="Revenue"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-primary" />
              <CardTitle className="text-base">Top 5 Products by Revenue</CardTitle>
            </div>
            <CardDescription>Best-performing products for the current filters</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TopProductsChart
              data={scope.topProducts.map((r) => ({ name: r.name, revenue: r.revenue }))}
            />
            <ol className="flex flex-col gap-1.5">
              {scope.topProducts.map((p, i) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </span>
                  <span className="text-muted-foreground">{formatCurrency(p.revenue)}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
