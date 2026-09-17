import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { ForecastView } from "@/components/forecast/forecast-view"
import { data } from "@/lib/data"

export const metadata: Metadata = {
  title: "Forecast",
  description:
    "Trend-fitted revenue forecast: historical revenue, the fitted linear trend line, and projected future monthly revenue with adjustable horizon.",
}

export default function ForecastPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trend-Fitted Projection"
        title="Revenue Forecast"
        description="Historical monthly revenue is fit with a least-squares linear trend, then extended forward to project future revenue. Adjust the horizon to see 6 to 24 months ahead."
      />
      <ForecastView data={data} />
    </>
  )
}
