import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { data } from "@/lib/data"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Interactive revenue analytics dashboard with KPIs, monthly trend, actual vs forecast, and breakdowns by region, category, and channel.",
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Business Analytics"
        title="Revenue Dashboard"
        description="Track revenue, cost, profit, and units with breakdowns by region, product category, and sales channel. Filter by year and region to drill into performance."
      />
      <DashboardView meta={data.meta} scopes={data.scopes} />
    </>
  )
}
