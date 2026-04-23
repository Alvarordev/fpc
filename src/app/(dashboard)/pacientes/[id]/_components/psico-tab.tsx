"use client"

import { useState } from "react"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { usePsicoSessions, useVolunteers } from "../_hooks/use-psico-sessions"
import { PsicoSessionCard } from "./psico-session-card"
import { PsicoCreateSessionSheet } from "./psico-create-session-sheet"

const TOTAL_DEFAULT_SESSIONS = 4

function sessionLabel(num: number): string {
  if (num <= 4) return `Sesión ${num}`
  return `Extra ${num - 4}`
}

interface PsicoTabProps {
  pacienteId: string
}

export function PsicoTab({ pacienteId }: PsicoTabProps) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? "callcenter"
  const canManage = ["callcenter", "admin", "fundacion"].includes(role)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: sessions = [], isLoading } = usePsicoSessions(pacienteId)
  const { data: volunteers = [] } = useVolunteers()

  const sortedSessions = [...sessions].sort((a, b) => a.sesionNumero - b.sesionNumero)

  const session4 = sortedSessions.find((s) => s.sesionNumero === 4)
  const canCreateMore =
    sortedSessions.length < TOTAL_DEFAULT_SESSIONS ||
    (session4?.extraNeeded === true && sortedSessions.length < 6)

  const showCreateButton = canManage && canCreateMore

  function getVolunteerName(voluntarioId: string): string {
    const v = volunteers.find((vol) => vol.id === voluntarioId)
    return v ? `${v.nombre} ${v.apellido}` : "Voluntario"
  }

  const totalSlots = session4?.extraNeeded
    ? 6
    : Math.max(TOTAL_DEFAULT_SESSIONS, sortedSessions.length)

  const placeholderSlots = Array.from(
    { length: Math.max(0, totalSlots - sortedSessions.length) },
    (_, i) => sortedSessions.length + 1 + i
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sesiones de psicooncología</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sortedSessions.length} de {totalSlots} sesiones agendadas
          </p>
        </div>
        {showCreateButton && (
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setSheetOpen(true)}>
            <CalendarPlus className="size-4" />
            Agendar sesión
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Cargando sesiones...</p>
        </div>
      ) : sortedSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-sm font-medium text-foreground">Sin sesiones agendadas</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            {canManage
              ? "Agenda la primera sesión de psicooncología para este paciente."
              : "No hay sesiones registradas aún."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-4 min-w-max">
            {sortedSessions.map((session) => (
              <PsicoSessionCard
                key={session.id}
                session={session}
                volunteerName={getVolunteerName(session.voluntarioId)}
                pacienteId={pacienteId}
                isExpanded={expandedId === session.id}
                onToggle={() =>
                  setExpandedId(expandedId === session.id ? null : session.id)
                }
                role={role}
              />
            ))}

            {placeholderSlots.map((num) => (
              <div
                key={`placeholder-${num}`}
                className={cn(
                  "min-w-60 max-w-70 shrink-0 rounded-xl border-2 border-dashed border-border/50",
                  "flex flex-col items-center justify-center gap-1.5 py-8 px-4 text-center"
                )}
              >
                <p className="text-xs font-semibold text-muted-foreground/70">
                  {sessionLabel(num)}
                </p>
                <p className="text-xs text-muted-foreground/50">Pendiente</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <PsicoCreateSessionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        pacienteId={pacienteId}
        existingSessions={sortedSessions}
      />
    </div>
  )
}
