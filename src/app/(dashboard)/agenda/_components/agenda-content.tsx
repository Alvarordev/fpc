"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useVolunteerSessions, useAllPatients } from "../_hooks/use-volunteer-agenda"
import { AgendaSessionCard } from "./agenda-session-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PsicoSession } from "@/types/follow-up"
import type { Patient } from "@/types/patient"

type Filter = "proximas" | "pasadas" | "todas"

const TODAY = new Date().toISOString().slice(0, 10)

function getPatientName(patients: Patient[], pacienteId: string): string {
  const p = patients.find((p) => p.id === pacienteId)
  return p ? p.q9_nombrePaciente : "Paciente desconocido"
}

function isToday(fecha: string): boolean {
  return fecha === TODAY
}

function filterSessions(sessions: PsicoSession[], filter: Filter): PsicoSession[] {
  return sessions
    .filter((s) => {
      if (filter === "proximas") return s.fecha >= TODAY
      if (filter === "pasadas") return s.fecha < TODAY
      return true
    })
    .sort((a, b) => {
      if (filter === "pasadas") return b.fecha.localeCompare(a.fecha)
      return a.fecha.localeCompare(b.fecha)
    })
}

export function AgendaContent() {
  const user = useAuthStore((s) => s.user)
  const voluntarioId = user?.volunteerProfileId
  const [filter, setFilter] = useState<Filter>("proximas")

  const { data: sessions = [], isLoading: loadingSessions } = useVolunteerSessions(voluntarioId)
  const { data: patients = [], isLoading: loadingPatients } = useAllPatients()

  const todaySessions = sessions.filter((s) => isToday(s.fecha))
  const filtered = filterSessions(sessions, filter)

  if (loadingSessions || loadingPatients) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">Cargando agenda...</p>
      </div>
    )
  }

  if (!voluntarioId) {
    return (
      <p className="text-sm text-muted-foreground">
        Tu cuenta no está vinculada a un perfil de voluntario.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Mi Agenda</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {sessions.length} sesiones en total
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Hoy</h2>
        {todaySessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin sesiones hoy.</p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((s) => (
              <AgendaSessionCard
                key={s.id}
                session={s}
                patientName={getPatientName(patients, s.pacienteId)}
                isToday
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Sesiones</h2>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="proximas" className="text-xs px-3 h-6">Próximas</TabsTrigger>
              <TabsTrigger value="pasadas" className="text-xs px-3 h-6">Pasadas</TabsTrigger>
              <TabsTrigger value="todas" className="text-xs px-3 h-6">Todas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay sesiones para mostrar.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => (
              <AgendaSessionCard
                key={s.id}
                session={s}
                patientName={getPatientName(patients, s.pacienteId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
