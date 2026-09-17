import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "Revenue Forecasting — Trend-Fitted Projection",
    template: "%s | Revenue Forecasting",
  },
  description:
    "A business analytics platform that turns historical monthly revenue into a linear-regression trend model and projects future revenue across regions, categories, and sales channels.",
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
      "Historical monthly revenue → time index → trend analysis → linear regression → future revenue forecast.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#131a26" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
