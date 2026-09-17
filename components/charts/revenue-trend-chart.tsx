"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AXIS, GRID, PALETTE } from "@/lib/chart-theme"
import { formatCompactNumber, formatCurrency } from "@/lib/format"
import { ChartTooltip } from "./chart-tooltip"

type Point = { label: string; revenue: number; profit?: number }

export function RevenueTrendChart({
  data,
  showProfit = false,
  height = 300,
}: {
  data: Point[]
  showProfit?: boolean
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE[3]} stopOpacity={0.3} />
            <stop offset="100%" stopColor={PALETTE[3]} stopOpacity={0.02} />
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
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={PALETTE[0]}
          strokeWidth={2.5}
          fill="url(#revFill)"
        />
        {showProfit ? (
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke={PALETTE[3]}
            strokeWidth={2}
            fill="url(#profitFill)"
          />
        ) : null}
      </AreaChart>
    </ResponsiveContainer>
  )
}
