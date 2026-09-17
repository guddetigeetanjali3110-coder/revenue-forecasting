import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "primary",
}: {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  accent?: "primary" | "accent" | "positive" | "indigo"
}) {
  const accents: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    positive: "bg-positive/10 text-positive",
    indigo: "bg-chart-3/10 text-chart-3",
  }
  return (
    <div className="animate-fade-up rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className={cn("grid h-9 w-9 place-items-center rounded-lg", accents[accent])}>
          <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  )
}
