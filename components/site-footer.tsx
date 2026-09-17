import Link from "next/link"
import { LineChart } from "lucide-react"
import { data } from "@/lib/data"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-sm flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LineChart className="size-4" />
              </span>
              <span className="text-sm font-semibold">RevenueForecast</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Trend-fitted revenue projection built on {data.meta.rows.toLocaleString("en-IN")}{" "}
              real transactions ({data.meta.dateRange.start} to {data.meta.dateRange.end}).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol
              title="Explore"
              items={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/forecast", label: "Forecast" },
                { href: "/data-explorer", label: "Data Explorer" },
              ]}
            />
            <FooterCol
              title="Method"
              items={[
                { href: "/model", label: "Trend Model" },
                { href: "/about", label: "About Project" },
              ]}
            />
            <FooterCol
              title="Dataset"
              items={[
                { href: "/data-explorer", label: `${data.meta.years.length} years` },
                { href: "/data-explorer", label: `${data.meta.regions.length} regions` },
                { href: "/data-explorer", label: `${data.meta.products.length} products` },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Revenue Forecasting — Trend-Fitted Projection. Academic analytics project.</p>
          <p>Model: Linear Regression (Least Squares) on monthly revenue.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  items,
}: {
  title: string
  items: { href: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</h3>
      {items.map((item, i) => (
        <Link
          key={`${item.href}-${i}`}
          href={item.href}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
