import type { Metadata } from "next"
import { CalendarClock, Gauge, Sigma, TrendingUp } from "lucide-react"
import {
  buildForecast,
  computeKpis,
  filterRecords,
  meta,
} from "@/lib/analytics"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { KpiCard } from "@/components/kpi-card"
import { FilterBar } from "@/components/filter-bar"
import { ForecastChart } from "@/components/charts/forecast-chart"

export const metadata: Metadata = {
  title: "Forecast",
  description:
    "12-month revenue forecast using ordinary least-squares linear regression on monthly revenue.",
}

const HORIZON = 12

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; region?: string }>
}) {
  const sp = await searchParams
  const year = sp.year && sp.year !== "all" ? Number(sp.year) : "all"
  const region = sp.region ?? "all"

  const rows = filterRecords({ year, region })
  const kpis = computeKpis(rows)
  const forecast = buildForecast(rows, HORIZON)

  const futurePoints = forecast.points.filter(
    (p) => p.actual === null && p.forecast !== null,
  )
  const splitLabel =
    forecast.points.find((p) => p.actual !== null && p.forecast !== null)?.label

  const momGrowth =
    forecast.avgHistoricalRevenue > 0
      ? (forecast.growthPerMonth / forecast.avgHistoricalRevenue) * 100
      : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Revenue Forecast
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {HORIZON}-month projection via ordinary least-squares linear
          regression on monthly revenue.
        </p>
      </header>

      <div className="mb-6">
        <FilterBar years={meta.years} regions={meta.regions} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Next Month"
          value={formatCurrency(forecast.nextRevenue)}
          sub="Projected revenue"
          icon={CalendarClock}
          accent="primary"
        />
        <KpiCard
          label={`Next ${HORIZON} Months`}
          value={formatCurrency(forecast.totalForecastRevenue)}
          sub="Cumulative forecast"
          icon={TrendingUp}
          accent="positive"
        />
        <KpiCard
          label="Monthly Growth"
          value={formatPercent(momGrowth)}
          sub={`${formatCurrency(forecast.growthPerMonth)} / month`}
          icon={Sigma}
          accent="indigo"
        />
        <KpiCard
          label="Model Fit (R²)"
          value={forecast.regression.rSquared.toFixed(3)}
          sub={`${forecast.historyCount} months of history`}
          icon={Gauge}
          accent="accent"
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Historical revenue & forecast"
            description="Solid area is actual revenue; dashed line is the projected trend."
          />
          <CardBody>
            <ForecastChart
              data={forecast.points.map((p) => ({
                label: p.label,
                actual: p.actual,
                forecast: p.forecast,
                trend: p.trend,
              }))}
              splitLabel={splitLabel}
              height={400}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly forecast detail"
            description={`Projected revenue for the next ${HORIZON} months`}
          />
          <CardBody className="p-0">
            <div className="scroll-thin max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Month</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Forecast revenue
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      vs. avg month
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {futurePoints.map((p) => {
                    const delta =
                      forecast.avgHistoricalRevenue > 0
                        ? ((p.forecast! - forecast.avgHistoricalRevenue) /
                            forecast.avgHistoricalRevenue) *
                          100
                        : 0
                    return (
                      <tr
                        key={p.label}
                        className="border-t border-border hover:bg-muted/50"
                      >
                        <td className="px-5 py-2.5 font-medium">{p.label}</td>
                        <td className="px-5 py-2.5 text-right tabular-nums">
                          {formatCurrency(p.forecast!)}
                        </td>
                        <td
                          className={`px-5 py-2.5 text-right tabular-nums ${
                            delta >= 0 ? "text-positive" : "text-negative"
                          }`}
                        >
                          {delta >= 0 ? "+" : ""}
                          {formatPercent(delta)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="How it works"
            description="Model summary"
          />
          <CardBody className="space-y-4 text-sm text-muted-foreground">
            <p>
              Monthly revenue is fitted to a straight line{" "}
              <span className="whitespace-nowrap font-mono text-foreground">
                y = mt + b
              </span>{" "}
              using ordinary least squares, then extrapolated forward.
            </p>
            <dl className="space-y-2">
              <Row label="Slope (m)" value={`${formatCurrency(forecast.regression.slope)} / mo`} />
              <Row label="Intercept (b)" value={formatCurrency(forecast.regression.intercept)} />
              <Row label="R²" value={forecast.regression.rSquared.toFixed(4)} />
              <Row label="History (n)" value={`${forecast.regression.n} months`} />
              <Row
                label="Avg month"
                value={formatCurrency(forecast.avgHistoricalRevenue)}
              />
            </dl>
            <p className="text-xs">
              A positive slope indicates growth. R² near 1.0 means the linear
              trend explains most of the variation in monthly revenue.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
      <dt>{label}</dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  )
}
