"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompact, formatCurrency } from "@/lib/format"

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function ChannelDonutChart({
  data,
  centerLabel = "Total",
  height = 280,
}: {
  data: { name: string; revenue: number }[]
  centerLabel?: string
  height?: number
}) {
  const total = data.reduce((s, d) => s + d.revenue, 0)
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.name, { label: d.name, color: PALETTE[i % PALETTE.length] }]),
  )

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={config} style={{ height }} className="mx-auto w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => (
                  <span className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="font-medium">{formatCurrency(Number(value))}</span>
                  </span>
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="name"
            innerRadius="58%"
            outerRadius="88%"
            paddingAngle={2}
            strokeWidth={2}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 6}
                      className="fill-foreground text-lg font-semibold"
                    >
                      {formatCompact(total)}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 14}
                      className="fill-muted-foreground text-xs"
                    >
                      {centerLabel}
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-medium">
              {total > 0 ? `${((d.revenue / total) * 100).toFixed(1)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
