"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Phone, Video, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useVolunteerProfileId } from "@/hooks/use-volunteer-profile-id"
import type { PsicoSession } from "@/types/follow-up"
import type { Patient } from "@/types/patient"

interface SessionRow {
  id: string
  legacy_id: string | null
  patient?: { legacy_id?: string | null } | null
  volunteer?: { legacy_id?: number | string | null } | null
  availability_slot?: { legacy_id?: string | null } | null
  session_number: number
  session_date: string
  start_time: string
  end_time: string
  mode: PsicoSession["modalidad"]
  status: PsicoSession["estado"]
  notes?: string | null
  satisfaction?: number | null
  extra_needed?: boolean | null
}

const TODAY = new Date().toISOString().slice(0, 10)

const estadoStyles: Record<PsicoSession["estado"], string> = {
  programada: "bg-blue-50 text-blue-700 border-blue-200",
  completada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelada: "bg-zinc-100 text-zinc-600 border-zinc-200",
  no_contesto: "bg-amber-50 text-amber-700 border-amber-200",
}

const estadoLabels: Record<PsicoSession["estado"], string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_contesto: "No contestó",
}

async function fetchVolunteerSessions(voluntarioId: string): Promise<PsicoSession[]> {
  const { data: volunteer, error: volunteerError } = await supabase
    .from("fpc_volunteers")
    .select("id")
    .eq("id", voluntarioId)
    .maybeSingle()
  if (volunteerError || !volunteer) throw new Error("Error al cargar sesiones")

  const { data, error } = await supabase
    .from("fpc_psico_sessions")
    .select("id, legacy_id, patient:fpc_patients!fpc_psico_sessions_patient_id_fkey(legacy_id), volunteer:fpc_volunteers!fpc_psico_sessions_volunteer_id_fkey(legacy_id), availability_slot:fpc_availability_slots!fpc_psico_sessions_availability_slot_id_fkey(legacy_id), session_number, session_date, start_time, end_time, mode, status, notes, satisfaction, extra_needed")
    .eq("volunteer_id", volunteer.id)

  if (error) throw new Error("Error al cargar sesiones")

  return ((data ?? []) as SessionRow[]).map((row) => ({
    id: String(row.legacy_id ?? row.id),
    pacienteId: String(row.patient?.legacy_id ?? ""),
    voluntarioId: Number(row.volunteer?.legacy_id ?? 0),
    availabilitySlotId: row.availability_slot?.legacy_id ? String(row.availability_slot.legacy_id) : undefined,
    sesionNumero: Number(row.session_number ?? 1),
    fecha: row.session_date,
    horaInicio: row.start_time?.slice(0, 5) ?? "",
    horaFin: row.end_time?.slice(0, 5) ?? "",
    modalidad: row.mode,
    estado: row.status,
    notas: row.notes ?? "",
    satisfaccion: row.satisfaction ?? undefined,
    extraNeeded: row.extra_needed ?? undefined,
  }))
}

async function fetchAllPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("fpc_patients")
    .select("id, legacy_id, enrollment_payload")

  if (error) throw new Error("Error al cargar pacientes")

  return (data ?? []).map((row) => ({
    ...(row.enrollment_payload as Patient),
    id: String(row.legacy_id ?? row.id),
  }))
}

export function VolunteerPatientsContent() {
  const router = useRouter()
  const voluntarioId = useVolunteerProfileId() ?? ""

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["volunteerSessions", voluntarioId],
    queryFn: () => fetchVolunteerSessions(voluntarioId),
    enabled: Boolean(voluntarioId),
  })

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchAllPatients,
  })

  const upcomingSessions = sessions
    .filter((s) => s.fecha >= TODAY && s.estado === "programada")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const patientIds = [...new Set(sessions.map((s) => s.pacienteId))]
  const myPatients = patients.filter((p) => patientIds.includes(p.id))

  if (loadingSessions || loadingPatients) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Mis Pacientes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {myPatients.length} paciente{myPatients.length !== 1 ? "s" : ""} asignado{myPatients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {upcomingSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Próximas sesiones</h2>
          <div className="space-y-2">
            {upcomingSessions.map((session) => {
              const patient = patients.find((p) => p.id === session.pacienteId)
              const patientName = patient?.q9_nombrePaciente ?? "Paciente desconocido"
              const initials = patientName
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
              const fecha = new Date(session.fecha + "T00:00:00").toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
              const sessionLabel =
                session.sesionNumero === 0
                  ? "Sesión extra"
                  : `Sesión ${session.sesionNumero}`

              return (
                <Card key={session.id} className="border-border/60">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{patientName}</p>
                        <Badge className={cn("border text-xs font-medium", estadoStyles[session.estado])}>
                          {estadoLabels[session.estado]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{sessionLabel}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {session.modalidad === "llamada" ? (
                          <Phone className="size-3 shrink-0" />
                        ) : (
                          <Video className="size-3 shrink-0" />
                        )}
                        <CalendarDays className="size-3 shrink-0 ml-1" />
                        <span className="capitalize">{fecha}</span>
                        <span>·</span>
                        <span>{session.horaInicio}–{session.horaFin}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5 text-xs h-8"
                      onClick={() => router.push(`/pacientes/${session.pacienteId}`)}
                    >
                      Ver perfil
                      <ArrowRight className="size-3" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {myPatients.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Todos mis pacientes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myPatients.map((patient) => {
              const patientSessions = sessions.filter((s) => s.pacienteId === patient.id)
              const completadas = patientSessions.filter((s) => s.estado === "completada").length
              const proxima = patientSessions
                .filter((s) => s.fecha >= TODAY && s.estado === "programada")
                .sort((a, b) => a.fecha.localeCompare(b.fecha))[0]

              const initials = patient.q9_nombrePaciente
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")

              return (
                <Card
                  key={patient.id}
                  className="border-border/60 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => router.push(`/pacientes/${patient.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {patient.q9_nombrePaciente}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {completadas} sesión{completadas !== 1 ? "es" : ""} completada{completadas !== 1 ? "s" : ""}
                        {proxima && (
                          <> · Próxima: {new Date(proxima.fecha + "T00:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</>
                        )}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {myPatients.length === 0 && upcomingSessions.length === 0 && (
        <p className="text-sm text-muted-foreground">No tienes pacientes asignados aún.</p>
      )}
    </div>
  )
}
