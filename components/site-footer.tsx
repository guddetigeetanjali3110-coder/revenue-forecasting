import Link from "next/link"
import { meta } from "@/lib/analytics"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy text-navy-foreground/70">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Revenue Forecasting
            </h3>
            <p className="mt-2 max-w-xs text-sm">
              Trend-fitted revenue projection built on a real industrial sales
              dataset spanning {meta.years[0]}–{meta.years[meta.years.length - 1]}.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link className="hover:text-white" href="/dashboard">Dashboard</Link></li>
              <li><Link className="hover:text-white" href="/forecast">Forecast</Link></li>
              <li><Link className="hover:text-white" href="/model">Trend &amp; Model</Link></li>
              <li><Link className="hover:text-white" href="/data">Data Explorer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Dataset</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>{meta.rowCount.toLocaleString("en-IN")} transaction records</li>
              <li>{meta.regions.length} regions · {meta.categories.length} categories</li>
              <li>{meta.products.length} products · {meta.channels.length} channels</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-xs">
          BTech CSE Academic Project · Linear-Regression Trend Forecasting · Built with
          Next.js &amp; Recharts.
        </div>
      </div>
    </footer>
  )
}
