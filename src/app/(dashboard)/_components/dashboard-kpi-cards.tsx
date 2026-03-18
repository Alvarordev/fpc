import { Phone, UserPlus, Users, TrendingUp, Heart, Clock, Calendar, CheckCircle2, Activity, HeartPulse, CalendarCheck } from "lucide-react"
import { KpiCard } from "@/components/kpi-card"
import type { UserRole } from "@/types/auth"

const kpiData = {
  callcenter: [
    { title: "Llamadas hoy", value: "24", description: "+4 vs. ayer", icon: Phone, trend: "up" as const },
    { title: "Inscripciones semana", value: "8", description: "+2 vs. semana anterior", icon: UserPlus, trend: "up" as const },
    { title: "Pacientes pendientes", value: "12", description: "3 de alta prioridad", icon: Users, trend: "neutral" as const },
    { title: "Tasa de contacto", value: "87%", description: "-2% vs. ayer", icon: TrendingUp, trend: "down" as const },
  ],
  voluntario: [
    { title: "Pacientes asignados", value: "6", description: "Sin cambios esta semana", icon: Heart, trend: "neutral" as const },
    { title: "Horas esta semana", value: "18", description: "+3 vs. semana anterior", icon: Clock, trend: "up" as const },
    { title: "Próximas citas", value: "3", description: "Próximas 48 horas", icon: Calendar, trend: "neutral" as const },
    { title: "Visitas completadas", value: "42", description: "+8 este mes", icon: CheckCircle2, trend: "up" as const },
  ],
  fundacion: [
    { title: "Total pacientes", value: "284", description: "+12 este mes", icon: Activity, trend: "up" as const },
    { title: "Voluntarios activos", value: "23", description: "+2 este mes", icon: HeartPulse, trend: "up" as const },
    { title: "Citas hoy", value: "12", description: "3 pendientes de confirmar", icon: CalendarCheck, trend: "neutral" as const },
    { title: "Inscripciones mes", value: "34", description: "+18% vs. mes anterior", icon: UserPlus, trend: "up" as const },
  ],
  admin: [
    { title: "Total pacientes", value: "284", description: "+12 este mes", icon: Activity, trend: "up" as const },
    { title: "Voluntarios activos", value: "23", description: "+2 este mes", icon: HeartPulse, trend: "up" as const },
    { title: "Citas hoy", value: "12", description: "3 pendientes de confirmar", icon: CalendarCheck, trend: "neutral" as const },
    { title: "Inscripciones mes", value: "34", description: "+18% vs. mes anterior", icon: UserPlus, trend: "up" as const },
  ],
}

interface DashboardKpiCardsProps {
  role: UserRole
}

export function DashboardKpiCards({ role }: DashboardKpiCardsProps) {
  const cards = kpiData[role]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  )
}
