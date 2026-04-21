"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  // Counts
  totalPatients: number
  activeVolunteers: number
  totalCallcenter: number
  activeAlerts: number
  totalContacts: number
  contactsThisMonth: number

  // Breakdowns
  patientsByPhase: Record<string, number>
  volunteersByStatus: Record<string, number>
  contactsByOrigin: Record<string, number>

  // Recent activity
  recentContacts: Array<{
    id: string
    type: 'contact'
    title: string
    description: string
    fecha: string
    accent?: boolean
  }>
  recentPatients: Array<{
    id: string
    type: 'patient'
    title: string
    description: string
    fecha: string
    accent?: boolean
  }>
  recentAlerts: Array<{
    id: string
    type: 'alert'
    title: string
    description: string
    fecha: string
  }>
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const firstDayOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Fetch all data in parallel
  const [
    { data: patients, error: patientsError },
    { data: volunteers, error: volunteersError },
    { data: callcenter, error: callcenterError },
    { data: alerts, error: alertsError },
    { data: contacts, error: contactsError },
  ] = await Promise.all([
    supabase.from("fpc_patients").select("id, status, health_phase, full_name, created_at").order("created_at", { ascending: false }),
    supabase.from("fpc_volunteers").select("id, estado, nombre, apellido"),
    supabase.from("fpc_callcenter_members").select("id, nombre, apellido"),
    supabase.from("fpc_hospital_alerts").select("id, status, detail, alert_date, created_at").order("created_at", { ascending: false }),
    supabase.from("fpc_contacts").select("id, origin, direction, status, contact_date, notes, created_at").order("created_at", { ascending: false }).limit(10),
  ])

  if (patientsError) throw new Error("Error al cargar pacientes")
  if (volunteersError) throw new Error("Error al cargar voluntarios")
  if (callcenterError) throw new Error("Error al cargar callcenter")
  if (alertsError) throw new Error("Error al cargar alertas")
  if (contactsError) throw new Error("Error al cargar contactos")

  const patientList = patients ?? []
  const volunteerList = volunteers ?? []
  const callcenterList = callcenter ?? []
  const alertList = alerts ?? []
  const contactList = contacts ?? []

  // Patients by phase
  const patientsByPhase: Record<string, number> = {}
  for (const p of patientList) {
    const phase = p.health_phase || 'Sin fase'
    patientsByPhase[phase] = (patientsByPhase[phase] ?? 0) + 1
  }

  // Volunteers by status
  const volunteersByStatus: Record<string, number> = {}
  for (const v of volunteerList) {
    const status = v.estado || 'desconocido'
    volunteersByStatus[status] = (volunteersByStatus[status] ?? 0) + 1
  }

  // Contacts by origin
  const contactsByOrigin: Record<string, number> = {}
  for (const c of contactList) {
    const origin = c.origin === 'enrolamiento' ? 'Enrolamiento' : 'Seguimiento'
    contactsByOrigin[origin] = (contactsByOrigin[origin] ?? 0) + 1
  }

  // Contacts this month
  const contactsThisMonth = contactList.filter((c) => {
    const date = c.contact_date ?? String(c.created_at).slice(0, 10)
    return date >= firstDayOfMonth
  }).length

  // Recent contacts for activity feed
  const recentContacts = contactList.slice(0, 6).map((c) => {
    const isEnrollment = c.origin === 'enrolamiento'
    return {
      id: String(c.id),
      type: 'contact' as const,
      title: isEnrollment ? 'Contacto de enrolamiento' : 'Llamada de seguimiento',
      description: c.notes || (c.direction === 'entrante' ? 'Llamada entrante' : 'Llamada saliente'),
      fecha: c.contact_date ?? String(c.created_at).slice(0, 10),
      accent: isEnrollment,
    }
  })

  // Recent patients for activity feed
  const recentPatients = patientList.slice(0, 5).map((p) => ({
    id: String(p.id),
    type: 'patient' as const,
    title: `Paciente registrado: ${p.full_name || 'Sin nombre'}`,
    description: `Fase: ${p.health_phase || 'Sin fase'}`,
    fecha: String(p.created_at).slice(0, 10),
    accent: true,
  }))

  // Recent alerts for activity feed
  const recentAlerts = alertList.slice(0, 5).map((a) => ({
    id: String(a.id),
    type: 'alert' as const,
    title: 'Alerta hospitalaria',
    description: a.detail || 'Sin detalle',
    fecha: a.alert_date ?? String(a.created_at).slice(0, 10),
  }))

  return {
    totalPatients: patientList.length,
    activeVolunteers: volunteerList.filter((v) => v.estado === 'activo').length,
    totalCallcenter: callcenterList.length,
    activeAlerts: alertList.filter((a) => a.status === 'activa').length,
    totalContacts: contactList.length,
    contactsThisMonth,
    patientsByPhase,
    volunteersByStatus,
    contactsByOrigin,
    recentContacts,
    recentPatients,
    recentAlerts,
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  })
}
