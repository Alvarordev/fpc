"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardKpiCards } from "./dashboard-kpi-cards"
import { DashboardCharts } from "./dashboard-charts"
import { DashboardRecentActivity } from "./dashboard-recent-activity"

export function VolunteerDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Panel del Voluntario</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tu agenda clínica, pacientes asignados y actividad reciente.
        </p>
      </div>

      <DashboardKpiCards role="voluntario" />
      <DashboardCharts role="voluntario" />

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Enfoque del día</CardTitle>
          <CardDescription>Priorizá pacientes con estado activo o seguimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Revisá primero tu agenda de hoy y registrá resultados de sesión apenas finalice cada intervención.
          </p>
        </CardContent>
      </Card>

      <DashboardRecentActivity role="voluntario" />
    </div>
  )
}
