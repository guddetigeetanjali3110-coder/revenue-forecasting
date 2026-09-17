"use client"

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AXIS, GRID, PALETTE } from "@/lib/chart-theme"
import { formatCompactNumber, formatCurrency } from "@/lib/format"
import { ChartTooltip } from "./chart-tooltip"

type Point = {
  label: string
  actual: number | null
  forecast: number | null
  trend: number
}

export function ForecastChart({
  data,
  splitLabel,
  height = 360,
}: {
  data: Point[]
  splitLabel?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="fcActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.3} />
            <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="plainline" />
        {splitLabel ? (
          <ReferenceLine
            x={splitLabel}
            stroke={AXIS}
            strokeDasharray="4 4"
            label={{
              value: "Forecast start",
              position: "insideTopRight",
              fontSize: 10,
              fill: AXIS,
            }}
          />
        ) : null}
        <Area
          type="monotone"
          dataKey="actual"
          name="Actual Revenue"
          stroke={PALETTE[0]}
          strokeWidth={2.5}
          fill="url(#fcActual)"
          connectNulls
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke={PALETTE[5]}
          strokeWidth={2.5}
          strokeDasharray="6 4"
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="trend"
          name="Trend Line"
          stroke={PALETTE[2]}
          strokeWidth={1.5}
          strokeOpacity={0.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
