import type { Metadata } from "next"
import {
  byCategory,
  byChannel,
  byProduct,
  byRegion,
  filterRecords,
  meta,
} from "@/lib/analytics"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { FilterBar } from "@/components/filter-bar"

export const metadata: Metadata = {
  title: "Data Explorer",
  description:
    "Inspect the aggregated sales dataset broken down by region, category, product, and channel.",
}

type Row = { name: string; revenue: number; profit: number; units: number }

function Table({ rows, label }: { rows: Row[]; label: string }) {
  const total = rows.reduce((s, r) => s + r.revenue, 0)
  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">{label}</th>
            <th className="px-5 py-3 text-right font-medium">Revenue</th>
            <th className="px-5 py-3 text-right font-medium">Profit</th>
            <th className="px-5 py-3 text-right font-medium">Margin</th>
            <th className="px-5 py-3 text-right font-medium">Units</th>
            <th className="px-5 py-3 text-right font-medium">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-border hover:bg-muted/50">
              <td className="px-5 py-2.5 font-medium">{r.name}</td>
              <td className="px-5 py-2.5 text-right tabular-nums">
                {formatCurrency(r.revenue)}
              </td>
              <td className="px-5 py-2.5 text-right tabular-nums">
                {formatCurrency(r.profit)}
              </td>
              <td className="px-5 py-2.5 text-right tabular-nums">
                {formatPercent(r.revenue ? (r.profit / r.revenue) * 100 : 0)}
              </td>
              <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">
                {formatNumber(r.units)}
              </td>
              <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">
                {formatPercent(total ? (r.revenue / total) * 100 : 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; region?: string }>
}) {
  const sp = await searchParams
  const year = sp.year && sp.year !== "all" ? Number(sp.year) : "all"
  const region = sp.region ?? "all"

  const rows = filterRecords({ year, region })
  const regions = byRegion(rows)
  const categories = byCategory(rows)
  const products = byProduct(rows)
  const channels = byChannel(rows)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Data Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatNumber(rows.length)} records aggregated across the selected
          filters. Source dataset spans {meta.years[0]}–
          {meta.years[meta.years.length - 1]}.
        </p>
      </header>

      <div className="mb-6">
        <FilterBar years={meta.years} regions={meta.regions} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="By region" description={`${regions.length} regions`} />
          <CardBody className="p-0">
            <Table rows={regions} label="Region" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="By category" description={`${categories.length} categories`} />
          <CardBody className="p-0">
            <Table rows={categories} label="Category" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="By channel" description={`${channels.length} channels`} />
          <CardBody className="p-0">
            <Table rows={channels} label="Channel" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="By product" description={`${products.length} products`} />
          <CardBody className="p-0">
            <Table rows={products} label="Product" />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
