"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AXIS, GRID, PALETTE } from "@/lib/chart-theme"
import { formatCompactNumber, formatCurrency } from "@/lib/format"
import { ChartTooltip } from "./chart-tooltip"

type Point = { label: string; actual: number | null; trend: number }

export function ActualVsForecastChart({
  data,
  height = 300,
}: {
  data: Point[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: AXIS }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis
          tick={{ fontSize: 11, fill: AXIS }}
          tickLine={false}
          axisLine={false}
          width={54}
          tickFormatter={(v) => formatCompactNumber(v)}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
          cursor={{ stroke: PALETTE[0], strokeOpacity: 0.2 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="plainline"
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Revenue"
          stroke={PALETTE[0]}
          strokeWidth={2.5}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="trend"
          name="Forecast (Trend)"
          stroke={PALETTE[5]}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
