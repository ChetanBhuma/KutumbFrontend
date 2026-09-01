import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("glass-card hover-lift border-l-4 border-l-primary/50 py-3.5 px-0 gap-1.5 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-0 pb-0.5">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-600 truncate mr-2">{title}</CardTitle>
        <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="px-4 py-0">
        <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
        {trend && (
          <div className="flex items-center mt-1">
            <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-[11px] text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
