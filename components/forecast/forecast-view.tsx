"use client"

import { useMemo, useState } from "react"
import { Sparkles, CalendarRange, Gauge, TrendingUp } from "lucide-react"
import type { Dataset } from "@/lib/data"
import { formatCurrency, formatFullCurrency, formatPercent } from "@/lib/format"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ForecastChart } from "@/components/charts/forecast-chart"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export function ForecastView({ data }: { data: Dataset }) {
  const { model, history, forecastSummary } = data
  const [horizon, setHorizon] = useState("12")

  const { chartData, table, summary } = useMemo(() => {
    const h = Number.parseInt(horizon, 10)
    const round = (n: number) => Math.round(n)

    // Continue month labels from the last historical month.
    const last = history[history.length - 1]
    let [mon, yr] = [last.label.split(" ")[0], Number.parseInt(last.label.split(" ")[1], 10)]
    let mi = MONTHS.indexOf(mon)

    const future = []
    for (let i = 1; i <= h; i++) {
      const t = history.length + i
      mi += 1
      if (mi > 11) {
        mi = 0
        yr += 1
      }
      future.push({
        t,
        label: `${MONTHS[mi]} ${yr}`,
        trend: round(model.slope * t + model.intercept),
        forecast: round(model.slope * t + model.intercept),
      })
    }

    const chart = [
      ...history.map((hh) => ({
        label: hh.label,
        actual: hh.actual,
        trend: hh.trend,
        forecast: null as number | null,
      })),
      ...future.map((f) => ({
        label: f.label,
        actual: null as number | null,
        trend: f.trend,
        forecast: f.forecast,
      })),
    ]
    // Bridge the actual and forecast lines at the split point.
    chart[history.length - 1].forecast = history[history.length - 1].actual

    const forecastTotal = future.reduce((s, f) => s + f.forecast, 0)
    const trailing = history.slice(-h).reduce((s, hh) => s + hh.actual, 0)
    const growth = trailing > 0 ? ((forecastTotal - trailing) / trailing) * 100 : 0

    return {
      chartData: chart,
      table: future,
      summary: {
        forecastTotal,
        avg: forecastTotal / h,
        growth,
        first: future[0]?.label,
        lastLabel: future[future.length - 1]?.label,
      },
    }
  }, [horizon, history, model])

  const splitLabel = history[history.length - 1].label

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Forecast horizon</span>
          <span className="text-xs text-muted-foreground">
            Projecting from {splitLabel} using the fitted trend line
          </span>
        </div>
        <ToggleGroup
          type="single"
          value={horizon}
          onValueChange={(v) => v && setHorizon(v)}
          variant="outline"
        >
          <ToggleGroupItem value="6" aria-label="6 months">6 mo</ToggleGroupItem>
          <ToggleGroupItem value="12" aria-label="12 months">12 mo</ToggleGroupItem>
          <ToggleGroupItem value="18" aria-label="18 months">18 mo</ToggleGroupItem>
          <ToggleGroupItem value="24" aria-label="24 months">24 mo</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={`Forecast (${horizon} mo)`}
          value={formatCurrency(summary.forecastTotal)}
          sub={`${summary.first} → ${summary.lastLabel}`}
          icon={Sparkles}
        />
        <KpiCard
          label="Avg Monthly Forecast"
          value={formatCurrency(summary.avg)}
          sub="mean projected revenue"
          icon={CalendarRange}
        />
        <KpiCard
          label="Projected Growth"
          value={formatPercent(summary.growth)}
          sub={`vs previous ${horizon} months`}
          icon={TrendingUp}
          badge={summary.growth >= 0 ? "Upward" : "Downward"}
          badgeTone={summary.growth >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          label="Model Fit (R²)"
          value={model.r2.toFixed(3)}
          sub={`least squares · n=${model.n}`}
          icon={Gauge}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Historical Revenue, Trend & Forecast</CardTitle>
              <CardDescription>
                Monthly revenue with the fitted linear trend and projected future values
              </CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
              {model.equation}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ForecastChart data={chartData} splitLabel={splitLabel} />
        </CardContent>
      </Card>

      {/* Forecast table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forecast Values</CardTitle>
          <CardDescription>
            Month-by-month projection for the next {horizon} months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Time Index (t)</TableHead>
                  <TableHead className="text-right">Trend Value</TableHead>
                  <TableHead className="text-right">Forecast Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.map((row) => (
                  <TableRow key={row.t}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.t}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(row.trend)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatFullCurrency(row.forecast)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
