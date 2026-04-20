"use client"

import { useRouter } from "next/navigation"
import { Phone, CalendarClock, PhoneCall, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { useContacts, buildTimeline } from "../_hooks/use-follow-up"
import { usePsicoSessions } from "../_hooks/use-psico-sessions"
import { useHospitalAlerts } from "@/hooks/use-hospitals"
import { TimelineEventCard } from "./timeline-event-card"
import { HospitalAlertsPanel } from "./hospital-alerts-panel"

function formatShortDate(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface SeguimientoTabProps {
  pacienteId: string
  fechaCreacion: string
}

export function SeguimientoTab({ pacienteId, fechaCreacion }: SeguimientoTabProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const canManage = ["callcenter", "admin", "fundacion"].includes(user?.role ?? "")

  const { data: contacts = [], isLoading: loadingContacts } = useContacts(pacienteId)
  const { data: psicoSessions = [], isLoading: loadingPsico } = usePsicoSessions(pacienteId)
  const { data: allAlerts = [] } = useHospitalAlerts()

  const isLoading = loadingContacts || loadingPsico

  const patientAlerts = allAlerts.filter((a) => a.pacienteId === pacienteId)
  const timeline = buildTimeline(contacts, psicoSessions, fechaCreacion, patientAlerts)

  const completedContacts = contacts.filter((c) => c.estado !== "agendado")
  const scheduledContacts = contacts.filter((c) => c.estado === "agendado")

  const lastContact = [...completedContacts].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]

  const nextContact = [...scheduledContacts]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .at(0)?.fecha

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-50">
              <Phone className="size-4 text-blue-600" />
            </div>
              <div>
                <p className="font-medium text-foreground">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">contactos registrados</p>
              </div>
            </div>

          {lastContact && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <PhoneCall className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formatShortDate(lastContact.fecha)}</p>
                <p className="text-xs text-muted-foreground">último contacto</p>
              </div>
            </div>
          )}

          {nextContact ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-amber-50">
                <CalendarClock className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formatShortDate(nextContact)}</p>
                <p className="text-xs text-muted-foreground">próximo contacto</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <CalendarClock className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Sin programar</p>
                <p className="text-xs text-muted-foreground">próximo contacto</p>
              </div>
            </div>
          )}
        </div>

        {canManage && (
          <Button
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => router.push(`/pacientes/${pacienteId}/contacto`)}
          >
            <Plus className="size-4" />
            Registrar contacto
          </Button>
        )}
      </div>

      <HospitalAlertsPanel pacienteId={pacienteId} />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Cargando historial...</p>
        </div>
      ) : (
        <div className="pt-2">
          {timeline.map((event, i) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              isLast={i === timeline.length - 1}
            />
          ))}
        </div>
      )}

    </div>
  )
}
