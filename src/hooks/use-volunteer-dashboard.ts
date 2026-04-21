"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useVolunteerProfileId } from "./use-volunteer-profile-id"

interface VolunteerDashboardData {
  // KPIs
  totalPatients: number
  pendingSessions: number
  availableHoursThisMonth: number
  completedSessions: number

  // Agenda (hoy en adelante)
  upcomingAgenda: Array<{
    id: string
    pacienteId: string
    pacienteNombre: string
    fecha: string
    horaInicio: string
    horaFin: string
    estado: string
    sesionNumero: number
    modalidad: string
  }>

  // Recent activity
  recentSessions: Array<{
    id: string
    type: 'session'
    title: string
    description: string
    fecha: string
    accent?: boolean
  }>
}

async function fetchVolunteerDashboardData(volunteerId: string): Promise<VolunteerDashboardData> {
  const { data: volunteer, error: volunteerError } = await supabase
    .from("fpc_volunteers")
    .select("id")
    .eq("id", volunteerId)
    .maybeSingle()

  if (volunteerError || !volunteer) throw new Error("Error al cargar perfil de voluntario")

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const firstDayOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

  const [
    { data: sessions, error: sessionsError },
    { data: slots, error: slotsError },
  ] = await Promise.all([
    supabase
      .from("fpc_psico_sessions")
      .select(`
        id,
        legacy_id,
        patient:fpc_patients!fpc_psico_sessions_patient_id_fkey(legacy_id, full_name),
        session_number,
        session_date,
        start_time,
        end_time,
        mode,
        status
      `)
      .eq("volunteer_id", volunteer.id)
      .order("session_date", { ascending: false })
      .order("start_time", { ascending: false }),
    supabase
      .from("fpc_availability_slots")
      .select("id, slot_date, start_time, end_time, status")
      .eq("volunteer_id", volunteer.id)
      .eq("status", "disponible")
      .gte("slot_date", firstDayOfMonth),
  ])

  if (sessionsError) throw new Error("Error al cargar sesiones")
  if (slotsError) throw new Error("Error al cargar disponibilidad")

  const sessionList = (sessions ?? []) as Array<{
    id: string
    legacy_id: string | null
    patient: { legacy_id?: string | null; full_name?: string | null } | null
    session_number: number
    session_date: string
    start_time: string | null
    end_time: string | null
    mode: string
    status: string
  }>
  const slotList = slots ?? []

  // KPIs
  const uniquePatientIds = new Set<string>()
  let pendingSessions = 0
  let completedSessions = 0
  const upcomingAgenda: VolunteerDashboardData["upcomingAgenda"] = []
  const recentSessions: VolunteerDashboardData["recentSessions"] = []

  for (const s of sessionList) {
    const patientId = String(s.patient?.legacy_id ?? '')
    const patientName = s.patient?.full_name ?? 'Paciente sin nombre'

    if (patientId) {
      uniquePatientIds.add(patientId)
    }

    if (s.status === 'programada') {
      pendingSessions++
    }
    if (s.status === 'completada') {
      completedSessions++
    }

    // Upcoming agenda (hoy en adelante)
    if (s.status === 'programada' && s.session_date >= todayStr) {
      upcomingAgenda.push({
        id: String(s.legacy_id ?? s.id),
        pacienteId: patientId,
        pacienteNombre: patientName,
        fecha: s.session_date,
        horaInicio: s.start_time?.slice(0, 5) ?? '',
        horaFin: s.end_time?.slice(0, 5) ?? '',
        estado: s.status,
        sesionNumero: Number(s.session_number ?? 1),
        modalidad: s.mode === 'videollamada' ? 'Videollamada' : 'Llamada',
      })
    }
  }

  // Sort upcoming agenda by fecha + hora
  upcomingAgenda.sort((a, b) => {
    const aDate = `${a.fecha}T${a.horaInicio || '00:00'}`
    const bDate = `${b.fecha}T${b.horaInicio || '00:00'}`
    return aDate.localeCompare(bDate)
  })

  // Recent activity (last 6 sessions)
  for (const s of sessionList.slice(0, 6)) {
    const patientName = s.patient?.full_name ?? 'Paciente sin nombre'
    recentSessions.push({
      id: String(s.legacy_id ?? s.id),
      type: 'session',
      title: s.status === 'completada'
        ? `Sesión completada: ${patientName}`
        : `Sesión programada: ${patientName}`,
      description: `Sesión #${s.session_number} — ${s.mode === 'videollamada' ? 'Videollamada' : 'Llamada'}`,
      fecha: s.session_date,
      accent: s.status === 'completada',
    })
  }

  // Calculate available hours this month from slots
  let availableHoursThisMonth = 0
  for (const slot of slotList) {
    const start = slot.start_time
    const end = slot.end_time
    if (start && end) {
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const startMin = sh * 60 + sm
      const endMin = eh * 60 + em
      availableHoursThisMonth += Math.max(0, (endMin - startMin) / 60)
    }
  }

  return {
    totalPatients: uniquePatientIds.size,
    pendingSessions,
    availableHoursThisMonth: Math.round(availableHoursThisMonth * 10) / 10,
    completedSessions,
    upcomingAgenda,
    recentSessions,
  }
}

export function useVolunteerDashboard() {
  const voluntarioId = useVolunteerProfileId()
  return useQuery({
    queryKey: ["volunteerDashboard", voluntarioId],
    queryFn: () => fetchVolunteerDashboardData(voluntarioId!),
    enabled: Boolean(voluntarioId),
  })
}
