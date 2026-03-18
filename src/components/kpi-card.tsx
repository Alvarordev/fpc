import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
}

const TrendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

export function KpiCard({ title, value, description, icon: Icon, trend = "neutral" }: KpiCardProps) {
  const Trend = TrendIcon[trend]

  return (
    <Card className="relative overflow-hidden border-border/60 shadow-none bg-card">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/60 rounded-full" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === "up" && "text-emerald-600",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground",
            )}>
              <Trend className="size-3" />
              <span>{description}</span>
            </div>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 border border-primary/12">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
