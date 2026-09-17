"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompact } from "@/lib/format"

const config = {
  actual: { label: "Actual", color: "var(--chart-1)" },
  trend: { label: "Trend", color: "var(--chart-3)" },
  forecast: { label: "Forecast", color: "var(--chart-5)" },
} satisfies ChartConfig

export function HomeTrendChart({
  data,
}: {
  data: { label: string; actual: number | null; trend: number; forecast: number | null }[]
}) {
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
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
          width={44}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="actual"
          type="monotone"
          stroke="var(--color-actual)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
        <Line
          dataKey="trend"
          type="monotone"
          stroke="var(--color-trend)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
        />
        <Line
          dataKey="forecast"
          type="monotone"
          stroke="var(--color-forecast)"
          strokeWidth={2.5}
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
