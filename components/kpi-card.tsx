import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  badge,
  badgeTone = "neutral",
}: {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  badge?: string
  badgeTone?: "positive" | "negative" | "neutral"
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          {badge && (
            <Badge
              variant="secondary"
              className={cn(
                badgeTone === "positive" && "bg-chart-4/15 text-chart-4",
                badgeTone === "negative" && "bg-destructive/15 text-destructive",
              )}
            >
              {badge}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight text-foreground">{value}</span>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
