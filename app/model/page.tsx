import type { Metadata } from "next"
import { buildForecast, filterRecords, meta, monthlySeries } from "@/lib/analytics"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { FilterBar } from "@/components/filter-bar"
import { ActualVsForecastChart } from "@/components/charts/actual-vs-forecast-chart"

export const metadata: Metadata = {
  title: "Trend & Model",
  description:
    "The linear-regression trend model behind the revenue forecast, explained step by step with residuals and goodness-of-fit.",
}

export default async function ModelPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; region?: string }>
}) {
  const sp = await searchParams
  const year = sp.year && sp.year !== "all" ? Number(sp.year) : "all"
  const region = sp.region ?? "all"

  const rows = filterRecords({ year, region })
  const series = monthlySeries(rows)
  const forecast = buildForecast(rows, 12)
  const { slope, intercept, rSquared, n } = forecast.regression

  // residuals
  const residuals = series.map((p) => {
    const pred = slope * p.t + intercept
    return { label: p.label, actual: p.revenue, pred, residual: p.revenue - pred }
  })
  const mae =
    residuals.reduce((s, r) => s + Math.abs(r.residual), 0) /
    Math.max(residuals.length, 1)
  const rmse = Math.sqrt(
    residuals.reduce((s, r) => s + r.residual ** 2, 0) /
      Math.max(residuals.length, 1),
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Trend &amp; Forecasting Model
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A transparent look at the linear-regression model driving the
          projection.
        </p>
      </header>

      <div className="mb-6">
        <FilterBar years={meta.years} regions={meta.regions} />
      </div>

      {/* Equation */}
      <Card className="mb-6 overflow-hidden">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-b border-border p-6 md:border-b-0 md:border-r">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Fitted equation
            </h2>
            <div className="mt-4 rounded-lg bg-navy p-5 font-mono text-navy-foreground">
              <div className="text-lg">
                revenue = {slope.toFixed(2)} · t + {intercept.toFixed(2)}
              </div>
              <div className="mt-2 text-xs text-navy-foreground/60">
                where t is the month index (0 = {series[0]?.label})
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              The model minimises the sum of squared residuals between actual
              monthly revenue and the fitted line. Each additional month adds{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(slope)}
              </span>{" "}
              of projected revenue.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            <Metric label="Slope (m)" value={`${formatCurrency(slope)}`} sub="per month" />
            <Metric label="Intercept (b)" value={formatCurrency(intercept)} sub="t = 0" />
            <Metric label="R²" value={rSquared.toFixed(4)} sub="goodness of fit" />
            <Metric label="Samples (n)" value={String(n)} sub="months" />
            <Metric label="MAE" value={formatCurrency(mae)} sub="mean abs error" />
            <Metric label="RMSE" value={formatCurrency(rmse)} sub="root mean sq err" />
          </div>
        </div>
      </Card>

      {/* Fit chart */}
      <Card className="mb-6">
        <CardHeader
          title="Model fit — actual vs fitted trend"
          description="How closely the straight-line trend tracks actual monthly revenue"
        />
        <CardBody>
          <ActualVsForecastChart
            data={series.map((p) => ({
              label: p.label,
              actual: p.revenue,
              trend: slope * p.t + intercept,
            }))}
            height={340}
          />
        </CardBody>
      </Card>

      {/* Steps + residual table */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Method" description="Four-step pipeline" />
          <CardBody>
            <ol className="space-y-4">
              <Step n={1} title="Aggregate">
                Roll up {meta.rowCount.toLocaleString("en-IN")} transactions into
                one revenue value per calendar month.
              </Step>
              <Step n={2} title="Index time">
                Convert each month to an integer index t = 0, 1, 2 … so the trend
                can be fit numerically.
              </Step>
              <Step n={3} title="Fit line">
                Solve for slope and intercept using ordinary least squares
                (closed-form normal equations).
              </Step>
              <Step n={4} title="Project">
                Extend t beyond the last observed month to generate the 12-month
                forecast.
              </Step>
            </ol>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Residuals"
            description="Difference between actual and fitted revenue per month"
          />
          <CardBody className="p-0">
            <div className="scroll-thin max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Month</th>
                    <th className="px-5 py-3 text-right font-medium">Actual</th>
                    <th className="px-5 py-3 text-right font-medium">Fitted</th>
                    <th className="px-5 py-3 text-right font-medium">Residual</th>
                  </tr>
                </thead>
                <tbody>
                  {residuals.map((r) => (
                    <tr
                      key={r.label}
                      className="border-t border-border hover:bg-muted/50"
                    >
                      <td className="px-5 py-2.5 font-medium">{r.label}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums">
                        {formatCurrency(r.actual)}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(r.pred)}
                      </td>
                      <td
                        className={`px-5 py-2.5 text-right tabular-nums ${
                          r.residual >= 0 ? "text-positive" : "text-negative"
                        }`}
                      >
                        {r.residual >= 0 ? "+" : ""}
                        {formatCurrency(r.residual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {n}
      </span>
      <div>
        <div className="font-medium">{title}</div>
        <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}
