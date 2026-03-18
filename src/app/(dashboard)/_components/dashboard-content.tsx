"use client"

import type { UserRole } from "@/types/auth"
import { DashboardKpiCards } from "./dashboard-kpi-cards"
import { DashboardCharts } from "./dashboard-charts"
import { DashboardRecentActivity } from "./dashboard-recent-activity"

const roleGreetings: Record<UserRole, string> = {
  callcenter: "Panel de Call Center",
  voluntario: "Panel del Voluntario",
  fundacion: "Panel de la Fundación",
  admin: "Panel de Administración",
}

interface DashboardContentProps {
  role: UserRole
}

export function DashboardContent({ role }: DashboardContentProps) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {roleGreetings[role]}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Aquí tienes un resumen de la actividad de hoy.
        </p>
      </div>

      <DashboardKpiCards role={role} />
      <DashboardCharts role={role} />
      <DashboardRecentActivity role={role} />
    </div>
  )
}
