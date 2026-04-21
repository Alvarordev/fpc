import { Phone, UserPlus, Calendar, CheckCircle2, AlertCircle, HeartPulse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

interface ActivityItem {
  icon: React.ElementType
  text: string
  time: string
  accent?: boolean
}

const mockActivityData: Record<UserRole, ActivityItem[]> = {
  callcenter: [
    { icon: Phone, text: "Llamada completada con María Torres", time: "Hace 12 min" },
    { icon: UserPlus, text: "Nueva inscripción: Luis Quispe Mamani", time: "Hace 38 min", accent: true },
    { icon: AlertCircle, text: "No se pudo contactar a Rosa Díaz (3er intento)", time: "Hace 1 h" },
    { icon: Calendar, text: "Cita agendada para Jorge Salinas — 21 mar, 10:00", time: "Hace 2 h" },
    { icon: Phone, text: "Seguimiento completado: Ana Castillo", time: "Hace 3 h" },
    { icon: UserPlus, text: "Nueva inscripción: Carmen Flores García", time: "Ayer", accent: true },
  ],
  voluntario: [
    { icon: CheckCircle2, text: "Visita completada: Pedro Vargas", time: "Hace 1 h" },
    { icon: Calendar, text: "Cita mañana a las 09:00 con Isabel Soto", time: "Hace 2 h" },
    { icon: Phone, text: "Reporte semanal enviado al equipo", time: "Hace 4 h" },
    { icon: UserPlus, text: "Nuevo paciente asignado: Roberto Lima", time: "Hace 5 h" },
    { icon: Calendar, text: "Disponibilidad actualizada para próxima semana", time: "Ayer" },
    { icon: CheckCircle2, text: "Visita completada: Elena Mendoza", time: "Ayer" },
  ],
  fundacion: [
    { icon: UserPlus, text: "34 inscripciones completadas este mes", time: "Hace 30 min", accent: true },
    { icon: HeartPulse, text: "2 nuevos voluntarios incorporados", time: "Hace 2 h" },
    { icon: Calendar, text: "12 citas programadas para hoy", time: "Hace 3 h" },
    { icon: Phone, text: "Reporte mensual de actividades generado", time: "Hace 4 h" },
    { icon: CheckCircle2, text: "Auditoría de datos completada", time: "Ayer" },
    { icon: AlertCircle, text: "3 pacientes requieren seguimiento urgente", time: "Ayer" },
  ],
  admin: [
    { icon: UserPlus, text: "34 inscripciones completadas este mes", time: "Hace 30 min", accent: true },
    { icon: HeartPulse, text: "2 nuevos voluntarios incorporados", time: "Hace 2 h" },
    { icon: Calendar, text: "12 citas programadas para hoy", time: "Hace 3 h" },
    { icon: Phone, text: "Reporte mensual de actividades generado", time: "Hace 4 h" },
    { icon: CheckCircle2, text: "Auditoría de datos completada", time: "Ayer" },
    { icon: AlertCircle, text: "3 pacientes requieren seguimiento urgente", time: "Ayer" },
  ],
}

interface RecentActivityItem {
  id: string
  type: 'contact' | 'patient' | 'alert'
  title: string
  description: string
  fecha: string
  accent?: boolean
}

interface DashboardRecentActivityProps {
  role: UserRole
  activity?: RecentActivityItem[]
}

export function DashboardRecentActivity({ role, activity }: DashboardRecentActivityProps) {
  let items: ActivityItem[]

  if (activity && activity.length > 0) {
    items = activity.map((a) => {
      const iconMap: Record<string, React.ElementType> = {
        contact: Phone,
        patient: UserPlus,
        alert: AlertCircle,
      }
      return {
        icon: iconMap[a.type] ?? CheckCircle2,
        text: `${a.title}${a.description ? ` — ${a.description}` : ''}`,
        time: a.fecha,
        accent: a.accent,
      }
    })
  } else {
    items = mockActivityData[role]
  }

  return (
    <Card className="border-border/60 shadow-none bg-card">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-sm font-semibold text-foreground">
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="space-y-0">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 py-3",
                  i < items.length - 1 && "border-b border-border/50"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                  item.accent
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{item.text}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
