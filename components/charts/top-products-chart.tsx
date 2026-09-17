"use client"

import { PALETTE } from "@/lib/chart-theme"
import { formatCurrency } from "@/lib/format"

type Point = { name: string; revenue: number; profit: number }

export function TopProductsChart({ data }: { data: Point[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  return (
    <ol className="space-y-3">
      {data.map((d, i) => (
        <li key={d.name}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              {d.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatCurrency(d.revenue)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.revenue / max) * 100}%`,
                background: PALETTE[i % PALETTE.length],
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}
