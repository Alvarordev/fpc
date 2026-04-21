import { Activity, HeartPulse, Phone, TriangleAlert, Users } from "lucide-react"
import { KpiCard } from "@/components/kpi-card"
import type { UserRole } from "@/types/auth"

interface KpiStats {
  totalPatients: number
  activeVolunteers: number
  totalCallcenter: number
  activeAlerts: number
}

const fallbackData: Record<UserRole, KpiStats> = {
  callcenter: {
    totalPatients: 0,
    activeVolunteers: 0,
    totalCallcenter: 0,
    activeAlerts: 0,
  },
  voluntario: {
    totalPatients: 0,
    activeVolunteers: 0,
    totalCallcenter: 0,
    activeAlerts: 0,
  },
  fundacion: {
    totalPatients: 0,
    activeVolunteers: 0,
    totalCallcenter: 0,
    activeAlerts: 0,
  },
  admin: {
    totalPatients: 0,
    activeVolunteers: 0,
    totalCallcenter: 0,
    activeAlerts: 0,
  },
}

interface DashboardKpiCardsProps {
  role: UserRole
  stats?: KpiStats
}

export function DashboardKpiCards({ role, stats }: DashboardKpiCardsProps) {
  const data = stats ?? fallbackData[role]

  const cards = [
    {
      title: "Total pacientes",
      value: String(data.totalPatients),
      description: "Pacientes registrados en el sistema",
      icon: Activity,
      trend: "neutral" as const,
    },
    {
      title: "Voluntarios activos",
      value: String(data.activeVolunteers),
      description: "Voluntarios con estado activo",
      icon: HeartPulse,
      trend: "neutral" as const,
    },
    {
      title: "Miembros callcenter",
      value: String(data.totalCallcenter),
      description: "Operadores de callcenter registrados",
      icon: Users,
      trend: "neutral" as const,
    },
    {
      title: "Alertas activas",
      value: String(data.activeAlerts),
      description: "Alertas hospitalarias sin resolver",
      icon: TriangleAlert,
      trend: data.activeAlerts > 0 ? ("up" as const) : ("neutral" as const),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  )
}
