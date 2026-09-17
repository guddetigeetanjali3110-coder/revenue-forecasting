"use client"

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompact, formatCurrency } from "@/lib/format"

const config = {
  actual: { label: "Actual", color: "var(--chart-1)" },
  forecast: { label: "Forecast", color: "var(--chart-5)" },
} satisfies ChartConfig

export function ActualForecastChart({
  data,
  splitLabel,
  height = 280,
}: {
  data: { label: string; actual: number | null; forecast: number | null }[]
  splitLabel?: string
  height?: number
}) {
  return (
    <ChartContainer config={config} style={{ height }} className="w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={(v: string) => v.replace(" 20", " '")}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={(value, name) => (
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="capitalize text-muted-foreground">{name}</span>
                  <span className="font-medium">{formatCurrency(Number(value))}</span>
                </span>
              )}
            />
          }
        />
        {splitLabel && (
          <ReferenceLine
            x={splitLabel}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
        )}
        <Line
          dataKey="actual"
          type="monotone"
          stroke="var(--color-actual)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
        <Line
          dataKey="forecast"
          type="monotone"
          stroke="var(--color-forecast)"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          dot={{ r: 2.5 }}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
