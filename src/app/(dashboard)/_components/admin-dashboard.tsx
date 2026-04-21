"use client"

import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { DashboardKpiCards } from "./dashboard-kpi-cards"
import { DashboardCharts } from "./dashboard-charts"
import { DashboardRecentActivity } from "./dashboard-recent-activity"

export function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  const kpiStats = stats
    ? {
        totalPatients: stats.totalPatients,
        activeVolunteers: stats.activeVolunteers,
        totalCallcenter: stats.totalCallcenter,
        activeAlerts: stats.activeAlerts,
      }
    : undefined

  const chartStats = stats
    ? {
        patientsByPhase: stats.patientsByPhase,
        volunteersByStatus: stats.volunteersByStatus,
        contactsByOrigin: stats.contactsByOrigin,
      }
    : undefined

  const allActivity = stats
    ? [
        ...stats.recentPatients.map((a) => ({ ...a, sortDate: a.fecha })),
        ...stats.recentContacts.map((a) => ({ ...a, sortDate: a.fecha })),
        ...stats.recentAlerts.map((a) => ({ ...a, sortDate: a.fecha, accent: false })),
      ]
        .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
        .slice(0, 8)
    : undefined

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vista ejecutiva de operación, cobertura y riesgos activos.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border/60 bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <DashboardKpiCards role="admin" stats={kpiStats} />
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[260px] rounded-xl border border-border/60 bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <DashboardCharts role="admin" stats={chartStats} />
      )}

      {isLoading ? (
        <div className="h-[360px] rounded-xl border border-border/60 bg-card animate-pulse" />
      ) : (
        <DashboardRecentActivity role="admin" activity={allActivity} />
      )}
    </div>
  )
}
