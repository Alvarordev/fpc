"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHospitalAlerts } from "@/hooks/use-hospitals"
import { DashboardKpiCards } from "./dashboard-kpi-cards"
import { DashboardCharts } from "./dashboard-charts"
import { DashboardRecentActivity } from "./dashboard-recent-activity"

export function AdminDashboard() {
  const { data: alerts = [] } = useHospitalAlerts()
  const activeAlerts = alerts.filter((a) => a.estado === "activa").length

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vista ejecutiva de operación, cobertura y riesgos activos.
        </p>
      </div>

      <DashboardKpiCards role="admin" />
      <DashboardCharts role="admin" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Estado de riesgo</CardTitle>
            <CardDescription>Alertas hospitalarias actualmente activas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{activeAlerts}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Gobernanza de datos</CardTitle>
            <CardDescription>Control operativo y consistencia de registro</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitoreá consistencia de agenda/contactos y actualizaciones de perfil para reducir deuda operativa.
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardRecentActivity role="admin" />
    </div>
  )
}
