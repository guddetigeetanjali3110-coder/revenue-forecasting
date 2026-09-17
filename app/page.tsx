import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Database,
  LineChart as LineChartIcon,
  Layers,
  Globe2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { data } from "@/lib/data"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { HomeTrendChart } from "@/components/charts/home-trend-chart"

const pipeline = [
  { icon: Database, title: "Historical Revenue", text: "Aggregate transaction-level sales into monthly totals." },
  { icon: Layers, title: "Time Index", text: "Assign a sequential index t = 1…n to each month." },
  { icon: TrendingUp, title: "Trend Analysis", text: "Measure the underlying direction of revenue over time." },
  { icon: LineChartIcon, title: "Linear Regression", text: "Fit y = m·t + c with least squares." },
  { icon: Sparkles, title: "Future Forecast", text: "Project the next 12 months from the fitted line." },
]

export default function HomePage() {
  const { totals, model, forecastSummary, meta, history, forecast } = data

  const combined = [
    ...history.map((h) => ({ label: h.label, actual: h.actual, trend: h.trend, forecast: null as number | null })),
    ...forecast.map((f) => ({ label: f.label, actual: null as number | null, trend: f.trend, forecast: f.forecast })),
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_75%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]"
        />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
              Revenue Forecasting — Trend-Fitted Projection
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Turn historical revenue into a{" "}
              <span className="text-primary">data-driven forecast</span>
            </h1>
            <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              A business analytics platform that fits a linear-regression trend to{" "}
              {formatNumber(meta.rows)} real sales transactions and projects future monthly revenue
              across regions, product categories, and sales channels.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Explore Dashboard <ArrowRight className="size-4" data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/forecast">View Forecast</Link>
              </Button>
            </div>
            <dl className="grid grid-cols-3 gap-4 pt-2">
              <HeroStat label="Total Revenue" value={formatCurrency(totals.revenue)} />
              <HeroStat label="Transactions" value={formatNumber(totals.transactions)} />
              <HeroStat label="Model Fit R²" value={model.r2.toFixed(3)} />
            </dl>
          </div>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">Actual vs Trend vs Forecast</CardTitle>
                  <CardDescription>
                    Monthly revenue, {meta.dateRange.start} → {forecastSummary.forecastEnd}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-chart-4/15 text-chart-4">
                  {formatPercent(forecastSummary.growthPct)} vs last 12 mo
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <HomeTrendChart data={combined} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pipeline */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              The forecasting pipeline
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Every projection follows the same transparent five-step method — no black boxes.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {pipeline.map((step, i) => (
              <li key={step.title}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <step.icon className="size-5" />
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureCard
            icon={BarChart3}
            title="Interactive Dashboard"
            text="Track revenue, cost, profit, and units with year and region filters, plus breakdowns by region, category, and channel."
            href="/dashboard"
            cta="Open dashboard"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Transparent Forecast"
            text={`Project the next 12 months (${forecastSummary.forecastStart} → ${forecastSummary.forecastEnd}) with the fitted trend line and confidence in the method.`}
            href="/forecast"
            cta="See the forecast"
          />
          <FeatureCard
            icon={Globe2}
            title="Explore the Data"
            text={`Filter and search ${formatNumber(meta.rows)} transactions across ${meta.regions.length} regions and ${meta.products.length} products.`}
            href="/data-explorer"
            cta="Open data explorer"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Understand the math behind the projection
            </h2>
            <p className="text-sm text-primary-foreground/80 sm:text-base">
              The model page walks through monthly aggregation, the time index, the least-squares
              trend equation, slope, intercept, and the forecast calculation.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link href="/model">
              View the model <ArrowRight className="size-4" data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tracking-tight sm:text-xl">{value}</dd>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  href,
  cta,
}: {
  icon: typeof BarChart3
  title: string
  text: string
  href: string
  cta: string
}) {
  return (
    <Card className="group h-full transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          {cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
