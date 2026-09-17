"use client"

import type { ReactNode } from "react"

type Item = {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: Item[]
  label?: ReactNode
  formatter?: (value: number, name?: string) => string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      {label !== undefined && label !== null ? (
        <div className="mb-1 text-xs font-semibold text-foreground">{label}</div>
      ) : null}
      <div className="space-y-1">
        {payload.map((item, i) => {
          if (item.value === null || item.value === undefined) return null
          const num = typeof item.value === "number" ? item.value : Number(item.value)
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-medium tabular-nums text-foreground">
                {formatter ? formatter(num, item.name) : num.toLocaleString("en-IN")}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
