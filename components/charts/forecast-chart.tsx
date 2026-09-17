"use client"

import {
  CartesianGrid,
  Line,
  ComposedChart,
  ReferenceLine,
  XAxis,
  YAxis,
  Legend,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompact, formatCurrency } from "@/lib/format"

const config = {
  actual: { label: "Actual Revenue", color: "var(--chart-1)" },
  trend: { label: "Trend Line", color: "var(--chart-3)" },
  forecast: { label: "Forecast", color: "var(--chart-5)" },
} satisfies ChartConfig

export function ForecastChart({
  data,
  splitLabel,
  height = 380,
}: {
  data: {
    label: string
    actual: number | null
    trend: number
    forecast: number | null
  }[]
  splitLabel?: string
  height?: number
}) {
  return (
    <ChartContainer config={config} style={{ height }} className="w-full">
      <ComposedChart data={data} margin={{ left: 4, right: 12, top: 12, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
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
        <Legend
          verticalAlign="top"
          height={36}
          iconType="plainline"
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">{config[value as keyof typeof config]?.label ?? value}</span>
          )}
        />
        {splitLabel && (
          <ReferenceLine
            x={splitLabel}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            label={{
              value: "Forecast →",
              position: "insideTopRight",
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
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
          dot={{ r: 2.5 }}
          connectNulls={false}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
