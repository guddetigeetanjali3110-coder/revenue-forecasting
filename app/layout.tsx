import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Revenue Forecasting — Trend-Fitted Projection",
    template: "%s | Revenue Forecasting",
  },
  description:
    "Interactive business analytics dashboard and linear-trend revenue forecasting built on a real industrial sales dataset (2021–2023).",
  keywords: [
    "revenue forecasting",
    "linear regression",
    "trend analysis",
    "business analytics",
    "sales dashboard",
  ],
  authors: [{ name: "Revenue Forecasting Project" }],
  openGraph: {
    title: "Revenue Forecasting — Trend-Fitted Projection",
    description:
      "Interactive analytics dashboard with linear-trend revenue forecasting.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
