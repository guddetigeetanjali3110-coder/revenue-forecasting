import type { Metadata } from "next"
import {
  Boxes,
  Coins,
  DollarSign,
  Percent,
  ShoppingCart,
  TrendingUp,
} from "lucide-react"
import {
  byCategory,
  byChannel,
  byRegion,
  buildForecast,
  computeKpis,
  filterRecords,
  meta,
  monthlySeries,
  topProducts,
} from "@/lib/analytics"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { KpiCard } from "@/components/kpi-card"
import { FilterBar } from "@/components/filter-bar"
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart"
import { BreakdownBarChart } from "@/components/charts/breakdown-bar-chart"
import { ChannelDonutChart } from "@/components/charts/channel-donut-chart"
import { TopProductsChart } from "@/components/charts/top-products-chart"
import { ActualVsForecastChart } from "@/components/charts/actual-vs-forecast-chart"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Interactive revenue analytics dashboard with KPIs and breakdowns by region, category, and channel.",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; region?: string }>
}) {
  const sp = await searchParams
  const year = sp.year && sp.year !== "all" ? Number(sp.year) : "all"
  const region = sp.region ?? "all"

  const rows = filterRecords({ year, region })
  const kpis = computeKpis(rows)
  const series = monthlySeries(rows)
  const regions = byRegion(rows).slice(0, 8)
  const categories = byCategory(rows)
  const channels = byChannel(rows)
  const products = topProducts(rows, 6)
  const forecast = buildForecast(rows, 12)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatNumber(kpis.transactions)} aggregated records
          {year !== "all" ? ` · ${year}` : ` · ${meta.years[0]}–${meta.years[meta.years.length - 1]}`}
          {region !== "all" ? ` · ${region}` : " · all regions"}
        </p>
      </header>

      <div className="mb-6">
        <FilterBar years={meta.years} regions={meta.regions} />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Revenue"
          value={formatCurrency(kpis.revenue)}
          icon={DollarSign}
          accent="primary"
        />
        <KpiCard
          label="Profit"
          value={formatCurrency(kpis.profit)}
          icon={TrendingUp}
          accent="positive"
        />
        <KpiCard
          label="Cost"
          value={formatCurrency(kpis.cost)}
          icon={Coins}
          accent="accent"
        />
        <KpiCard
          label="Margin"
          value={formatPercent(kpis.margin)}
          icon={Percent}
          accent="indigo"
        />
        <KpiCard
          label="Units Sold"
          value={formatNumber(kpis.units)}
          icon={Boxes}
          accent="accent"
        />
        <KpiCard
          label="Transactions"
          value={formatNumber(kpis.transactions)}
          icon={ShoppingCart}
          accent="primary"
        />
      </div>

      {/* Trend + Actual vs Forecast */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Revenue & Profit trend"
            description="Monthly aggregated performance"
          />
          <CardBody>
            <RevenueTrendChart
              data={series.map((p) => ({
                label: p.label,
                revenue: p.revenue,
                profit: p.profit,
              }))}
              showProfit
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Actual vs Forecast (trend)"
            description="Fitted linear trend over the historical window"
          />
          <CardBody>
            <ActualVsForecastChart
              data={forecast.points
                .filter((p) => p.actual !== null)
                .map((p) => ({
                  label: p.label,
                  actual: p.actual,
                  trend: p.trend,
                }))}
            />
          </CardBody>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Revenue by region"
            description="Top performing regions"
          />
          <CardBody>
            <BreakdownBarChart
              data={regions.map((r) => ({ name: r.name, revenue: r.revenue }))}
              layout="vertical"
              height={320}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Revenue by category"
            description="Product category performance"
          />
          <CardBody>
            <BreakdownBarChart
              data={categories.map((c) => ({ name: c.name, revenue: c.revenue }))}
              layout="horizontal"
              height={320}
              colorOffset={2}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Revenue by channel"
            description="Share of total revenue"
          />
          <CardBody>
            <ChannelDonutChart
              data={channels.map((c) => ({ name: c.name, revenue: c.revenue }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Top products"
            description="Ranked by revenue"
          />
          <CardBody>
            <TopProductsChart data={products} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
