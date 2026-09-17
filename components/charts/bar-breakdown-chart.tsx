"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompact, formatCurrency } from "@/lib/format"

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig

// Vertical bars, good for a handful of categories/regions.
export function BarBreakdownChart({
  data,
  highlight,
  height = 280,
}: {
  data: { name: string; revenue: number }[]
  highlight?: string
  height?: number
}) {
  return (
    <ChartContainer config={config} style={{ height }} className="w-full">
      <BarChart data={data} margin={{ left: 4, right: 8, top: 20, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-medium">{formatCurrency(Number(value))}</span>
              )}
            />
          }
        />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={
                highlight && entry.name !== highlight
                  ? "color-mix(in oklch, var(--chart-1) 35%, transparent)"
                  : "var(--chart-1)"
              }
            />
          ))}
          <LabelList
            dataKey="revenue"
            position="top"
            className="fill-muted-foreground text-[10px]"
            formatter={(v: number) => formatCompact(v)}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
