import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Database, GitBranch, LineChart, Layers } from "lucide-react"
import { computeKpis, filterRecords, meta } from "@/lib/analytics"
import { formatCurrency, formatNumber } from "@/lib/format"
import { Card, CardBody, CardHeader } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About",
  description:
    "About the Revenue Forecasting project — dataset, methodology, and technology stack.",
}

export default function AboutPage() {
  const rows = filterRecords({})
  const kpis = computeKpis(rows)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <LineChart className="h-3.5 w-3.5" />
          Academic Project
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          About this project
        </h1>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          Revenue Forecasting is a business-analytics workspace that fits a
          linear-regression trend to historical sales and projects revenue into
          the future. It is designed to make the forecasting method transparent,
          not a black box.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader title="Dataset" />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 h-5 w-5 text-primary" />
              <p>
                {formatNumber(meta.rowCount)} aggregated transaction records
                spanning {meta.years[0]}–{meta.years[meta.years.length - 1]},
                totalling {formatCurrency(kpis.revenue)} in revenue.
              </p>
            </div>
            <ul className="space-y-1.5 pl-8">
              <li>{meta.regions.length} regions</li>
              <li>{meta.categories.length} product categories</li>
              <li>{meta.products.length} products</li>
              <li>{meta.channels.length} sales channels</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Methodology" />
          <CardBody className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <GitBranch className="mt-0.5 h-5 w-5 text-primary" />
              <p>
                Monthly revenue is fit to a straight line using ordinary
                least-squares regression, then extrapolated 12 months ahead.
              </p>
            </div>
            <p>
              Goodness-of-fit is reported with R², MAE, and RMSE so the quality
              of the projection is always visible. See the{" "}
              <Link href="/model" className="font-medium text-primary hover:underline">
                Trend &amp; Model
              </Link>{" "}
              page for the full breakdown.
            </p>
          </CardBody>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader title="Technology" />
          <CardBody>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Layers className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p>
                  Built with Next.js (App Router) and React Server Components,
                  with Recharts for visualisation and Tailwind CSS for styling.
                  All aggregation and regression run on the server, so the raw
                  dataset never ships to the browser.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Next.js", "React", "TypeScript", "Recharts", "Tailwind CSS"].map(
                    (t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {t}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
        >
          Open Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/forecast"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-muted"
        >
          View Forecast
        </Link>
      </div>
    </div>
  )
}
