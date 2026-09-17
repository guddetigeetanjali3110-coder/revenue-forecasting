"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { PALETTE } from "@/lib/chart-theme"
import { formatCurrency } from "@/lib/format"
import { ChartTooltip } from "./chart-tooltip"

type Point = { name: string; revenue: number }

export function ChannelDonutChart({
  data,
  height = 300,
}: {
  data: Point[]
  height?: number
}) {
  const total = data.reduce((s, d) => s + d.revenue, 0)
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="w-full sm:w-1/2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 sm:w-1/2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-foreground">{d.name}</span>
            <span className="ml-auto font-medium tabular-nums text-muted-foreground">
              {total ? ((d.revenue / total) * 100).toFixed(1) : "0.0"}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
