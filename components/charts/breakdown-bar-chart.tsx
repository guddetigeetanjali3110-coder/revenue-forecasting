"use client"

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AXIS, GRID, PALETTE } from "@/lib/chart-theme"
import { formatCompactNumber, formatCurrency } from "@/lib/format"
import { ChartTooltip } from "./chart-tooltip"

type Point = { name: string; revenue: number }

export function BreakdownBarChart({
  data,
  layout = "vertical",
  height = 300,
  colorOffset = 0,
}: {
  data: Point[]
  layout?: "vertical" | "horizontal"
  height?: number
  colorOffset?: number
}) {
  const isVertical = layout === "vertical" // horizontal bars

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 6, right: 16, left: 4, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={!isVertical} vertical={isVertical} />
        {isVertical ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactNumber(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              width={92}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              width={54}
              tickFormatter={(v) => formatCompactNumber(v)}
            />
          </>
        )}
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
          cursor={{ fill: PALETTE[0], fillOpacity: 0.06 }}
        />
        <Bar dataKey="revenue" name="Revenue" radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[(i + colorOffset) % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
