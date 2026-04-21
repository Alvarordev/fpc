"use client"

import { useRouter } from "next/navigation"
import { Phone, CalendarClock, PhoneCall, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { useContacts, buildTimeline } from "../_hooks/use-follow-up"
import { usePsicoSessions } from "../_hooks/use-psico-sessions"
import { useHospitalAlerts } from "@/hooks/use-hospitals"
import { TimelineEventCard } from "./timeline-event-card"
import { HospitalAlertsPanel } from "./hospital-alerts-panel"
import { toast } from "sonner"

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

  const completedContacts = contacts.filter((c) => c.estado !== "agendado")
  const scheduledContacts = contacts.filter((c) => c.estado === "agendado")

  const timeline = buildTimeline(completedContacts, psicoSessions, fechaCreacion, patientAlerts)

  const lastContact = [...completedContacts].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]

  const nextScheduled = [...scheduledContacts].sort((a, b) => a.fecha.localeCompare(b.fecha))[0]

  function handleAgendar() {
    if (scheduledContacts.length > 0) {
      toast.error("Ya existe un contacto agendado", {
        description: "Completá o marcá como inconcluso el contacto actual antes de agendar otro.",
      })
      return
    }
    router.push(`/pacientes/${pacienteId}/contacto`)
  }

  function goToContact(contactId: string) {
    router.push(`/pacientes/${pacienteId}/contacto?contactId=${contactId}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-50">
              <Phone className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">{completedContacts.length}</p>
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

          {nextScheduled ? (
            <button
              onClick={() => goToContact(nextScheduled.id)}
              className="flex items-center gap-2 text-sm group cursor-pointer"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <CalendarClock className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground group-hover:text-amber-700 transition-colors">
                  {formatShortDate(nextScheduled.fecha)}
                  {nextScheduled.horaInicio ? ` · ${nextScheduled.horaInicio}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">próximo contacto — clic para completar</p>
              </div>
            </button>
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
            onClick={handleAgendar}
            disabled={isLoading}
          >
            <CalendarPlus className="size-4" />
            Agendar contacto
          </Button>
        )}
      </div>

      <HospitalAlertsPanel pacienteId={pacienteId} />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Cargando historial...</p>
        </div>
      ) : (
        <div className="pt-2 space-y-4">
          {nextScheduled && (
            <button
              onClick={() => goToContact(nextScheduled.id)}
              className="w-full flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 shrink-0">
                <CalendarClock className="size-4 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">
                  Contacto agendado para {formatShortDate(nextScheduled.fecha)}
                  {nextScheduled.horaInicio ? ` a las ${nextScheduled.horaInicio}` : ""}
                </p>
                <p className="text-xs text-amber-700/80">
                  Clic acá para registrar el contacto cuando se concrete
                </p>
              </div>
              <CalendarPlus className="size-4 text-amber-600 shrink-0" />
            </button>
          )}

          <div>
            {timeline.map((event, i) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                isLast={i === timeline.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
