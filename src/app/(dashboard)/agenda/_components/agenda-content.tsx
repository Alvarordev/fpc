'use client'

import { useState } from 'react'
import { useVolunteerProfileId } from '@/hooks/use-volunteer-profile-id'
import {
  useVolunteerSessions,
  useAllPatients,
} from '../_hooks/use-volunteer-agenda'
import { AgendaSessionCard } from './agenda-session-card'
import { AgendaSessionResultSheet } from './agenda-session-result-sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PsicoSession } from '@/types/follow-up'
import type { Patient } from '@/types/patient'

type Filter = 'proximas' | 'pasadas' | 'todas'

const TODAY = new Date().toISOString().slice(0, 10)

function getPatientName(patients: Patient[], pacienteId: string): string {
  const p = patients.find((p) => p.id === pacienteId)
  return p ? p.q9_nombrePaciente : 'Paciente desconocido'
}

function isToday(fecha: string): boolean {
  return fecha === TODAY
}

function filterSessions(
  sessions: PsicoSession[],
  filter: Filter,
): PsicoSession[] {
  return sessions
    .filter((s) => {
      if (filter === 'proximas') return s.fecha >= TODAY
      if (filter === 'pasadas') return s.fecha < TODAY
      return true
    })
    .sort((a, b) => {
      if (filter === 'pasadas') return b.fecha.localeCompare(a.fecha)
      return a.fecha.localeCompare(b.fecha)
    })
}

export function AgendaContent() {
  const voluntarioId = useVolunteerProfileId()
  const [filter, setFilter] = useState<Filter>('proximas')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeSession, setActiveSession] = useState<PsicoSession | null>(null)

  const { data: sessions = [], isLoading: loadingSessions } =
    useVolunteerSessions(voluntarioId)
  const { data: patients = [], isLoading: loadingPatients } = useAllPatients()

  const todaySessions = sessions.filter((s) => isToday(s.fecha))
  const filtered = filterSessions(sessions, filter)

  function openSessionSheet(session: PsicoSession) {
    setActiveSession(session)
    setSheetOpen(true)
  }

  const activePatientName = activeSession
    ? getPatientName(patients, activeSession.pacienteId)
    : ''

  if (loadingSessions || loadingPatients) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando agenda...</p>
      </div>
    )
  }

  if (!voluntarioId) {
    return (
      <p className="text-muted-foreground text-sm">
        Tu cuenta no está vinculada a un perfil de voluntario.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Mi Agenda
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {sessions.length} sesiones en total
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-foreground text-sm font-semibold">Hoy</h2>
        {todaySessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin sesiones hoy.</p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((s) => (
              <AgendaSessionCard
                key={s.id}
                session={s}
                patientName={getPatientName(patients, s.pacienteId)}
                isToday
                onStartSession={openSessionSheet}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-sm font-semibold">Sesiones</h2>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="proximas" className="h-6 px-3 text-xs">
                Próximas
              </TabsTrigger>
              <TabsTrigger value="pasadas" className="h-6 px-3 text-xs">
                Pasadas
              </TabsTrigger>
              <TabsTrigger value="todas" className="h-6 px-3 text-xs">
                Todas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay sesiones para mostrar.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => (
              <AgendaSessionCard
                key={s.id}
                session={s}
                patientName={getPatientName(patients, s.pacienteId)}
                onStartSession={openSessionSheet}
              />
            ))}
          </div>
        )}
      </div>

      <AgendaSessionResultSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setActiveSession(null)
        }}
        session={activeSession}
        patientName={activePatientName}
        voluntarioId={voluntarioId}
      />
    </div>
  )
}
