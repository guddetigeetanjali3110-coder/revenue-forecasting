import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Database,
  LineChart,
  TrendingUp,
} from "lucide-react"
import {
  buildForecast,
  computeKpis,
  filterRecords,
  meta,
} from "@/lib/analytics"
import { formatCurrency, formatPercent } from "@/lib/format"
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart"
import { monthlySeries } from "@/lib/analytics"

export default function HomePage() {
  const all = filterRecords({})
  const kpis = computeKpis(all)
  const forecast = buildForecast(all, 12)
  const series = monthlySeries(all).map((p) => ({
    label: p.label,
    revenue: p.revenue,
  }))

  const projectedGrowth =
    kpis.revenue > 0 ? (forecast.totalForecastRevenue / kpis.revenue) * 100 : 0

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(600px circle at 15% 20%, rgba(30,94,255,0.35), transparent 45%), radial-gradient(500px circle at 85% 30%, rgba(14,165,233,0.25), transparent 45%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-navy-foreground/80">
              <TrendingUp className="h-3.5 w-3.5" />
              Linear-Regression Trend Forecasting
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Revenue Forecasting on real sales data
            </h1>
            <p className="mt-5 text-pretty text-lg text-navy-foreground/75">
              An interactive analytics workspace that turns{" "}
              {meta.rowCount.toLocaleString("en-IN")} historical transactions
              into a trend-fitted revenue projection — with dashboards,
              breakdowns, and a transparent forecasting model.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/forecast"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Forecast
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight stats */}
      <section className="mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Historical Revenue"
            value={formatCurrency(kpis.revenue)}
            sub={`${meta.years[0]}–${meta.years[meta.years.length - 1]}`}
          />
          <Stat
            label="Profit Margin"
            value={formatPercent(kpis.margin)}
            sub="Across all regions"
          />
          <Stat
            label="12-Mo Forecast"
            value={formatCurrency(forecast.totalForecastRevenue)}
            sub={`≈ ${formatPercent(projectedGrowth)} of history`}
          />
          <Stat
            label="Model Fit (R²)"
            value={forecast.regression.rSquared.toFixed(3)}
            sub="Linear trend on monthly revenue"
          />
        </div>
      </section>

      {/* Trend preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Monthly revenue trend</h2>
              <p className="text-sm text-muted-foreground">
                Aggregated across every region, product, and channel.
              </p>
            </div>
            <Link
              href="/forecast"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
            >
              See forecast <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <RevenueTrendChart data={series} height={320} />
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <Feature
            icon={BarChart3}
            title="Interactive Dashboard"
            desc="KPIs and breakdowns by region, category, and channel — filterable by year and region."
            href="/dashboard"
          />
          <Feature
            icon={LineChart}
            title="Trend Forecast"
            desc="Ordinary least-squares regression projects revenue 12 months into the future."
            href="/forecast"
          />
          <Feature
            icon={Database}
            title="Data Explorer"
            desc="Inspect the underlying aggregated dataset with sortable, searchable records."
            href="/data"
          />
        </div>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}

function Feature({
  icon: Icon,
  title,
  desc,
  href,
}: {
  icon: typeof BarChart3
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
