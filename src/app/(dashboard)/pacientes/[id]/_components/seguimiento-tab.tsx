"use client"

import { useState } from "react"
import { Phone, CalendarClock, PhoneCall, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { useFollowUpCalls, buildTimeline } from "../_hooks/use-follow-up"
import { usePsicoSessions } from "../_hooks/use-psico-sessions"
import { useHospitalAlerts } from "@/hooks/use-hospitals"
import { TimelineEventCard } from "./timeline-event-card"
import { FollowUpCallSheet } from "./follow-up-call-sheet"
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
  const user = useAuthStore((s) => s.user)
  const canManage = ["callcenter", "admin", "fundacion"].includes(user?.role ?? "")

  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: calls = [], isLoading: loadingCalls } = useFollowUpCalls(pacienteId)
  const { data: psicoSessions = [], isLoading: loadingPsico } = usePsicoSessions(pacienteId)
  const { data: allAlerts = [] } = useHospitalAlerts()

  const isLoading = loadingCalls || loadingPsico

  const patientAlerts = allAlerts.filter((a) => a.pacienteId === pacienteId)
  const timeline = buildTimeline(calls, psicoSessions, fechaCreacion, patientAlerts)

  const lastCall = [...calls].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]

  const nextCall = calls
    .filter((c) => c.proximaLlamada)
    .sort((a, b) => (a.proximaLlamada ?? "").localeCompare(b.proximaLlamada ?? ""))
    .at(-1)?.proximaLlamada

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-50">
              <Phone className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">{calls.length}</p>
              <p className="text-xs text-muted-foreground">llamadas registradas</p>
            </div>
          </div>

          {lastCall && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <PhoneCall className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formatShortDate(lastCall.fecha)}</p>
                <p className="text-xs text-muted-foreground">último contacto</p>
              </div>
            </div>
          )}

          {nextCall ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-amber-50">
                <CalendarClock className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formatShortDate(nextCall)}</p>
                <p className="text-xs text-muted-foreground">próxima llamada</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <CalendarClock className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Sin programar</p>
                <p className="text-xs text-muted-foreground">próxima llamada</p>
              </div>
            </div>
          )}
        </div>

        {canManage && (
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setSheetOpen(true)}>
            <Plus className="size-4" />
            Registrar llamada
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

      <FollowUpCallSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        pacienteId={pacienteId}
      />
    </div>
  )
}
