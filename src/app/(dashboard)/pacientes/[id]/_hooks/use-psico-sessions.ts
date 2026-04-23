"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { PsicoSession } from "@/types/follow-up"
import type { Volunteer, AvailabilitySlot } from "@/types/volunteer"

interface SessionRow {
  id: string
  legacy_id: string | null
  patient_id: string
  volunteer_id: string
  availability_slot_id: string
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

interface SlotRow {
  id: string
  legacy_id: string | null
  volunteer_id: string
  slot_date: string
  start_time: string
  end_time: string
  status: AvailabilitySlot["estado"]
}

async function fetchSessions(pacienteId: string): Promise<PsicoSession[]> {
  // 1. Resolvemos el UUID interno del paciente por su legacy_id
  const { data: patientRow, error: patientError } = await supabase
    .from("fpc_patients")
    .select("id")
    .eq("legacy_id", pacienteId)
    .maybeSingle()

  if (patientError) throw new Error("Error al cargar sesiones")
  if (!patientRow) return []

  // 2. Filtramos sesiones por patient_id (FK directa, evita dot-notation bug en Supabase)
  const { data, error } = await supabase
    .from("fpc_psico_sessions")
    .select("id, legacy_id, patient_id, volunteer_id, availability_slot_id, session_number, session_date, start_time, end_time, mode, status, notes, satisfaction, extra_needed")
    .eq("patient_id", patientRow.id)

  if (error) throw new Error("Error al cargar sesiones")

  return ((data ?? []) as SessionRow[]).map((row) => ({
    id: String(row.legacy_id ?? row.id),
    pacienteId,
    voluntarioId: row.volunteer_id,
    availabilitySlotId: row.availability_slot_id,
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

async function fetchVolunteers(): Promise<Volunteer[]> {
  const { data, error } = await supabase
    .from("fpc_volunteers")
    .select("id, nombre, apellido, email, telefono, estado, especialidad")

  if (error) throw new Error("Error al cargar voluntarios")

  return (data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    telefono: row.telefono ?? "",
    estado: row.estado,
    especialidad: row.especialidad ?? "",
  }))
}

async function fetchAvailableSlots(): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase
    .from("fpc_availability_slots")
    .select("id, legacy_id, volunteer_id, slot_date, start_time, end_time, status")
    .eq("status", "disponible")

  if (error) throw new Error("Error al cargar horarios")

  return ((data ?? []) as SlotRow[]).map((row) => ({
    id: String(row.legacy_id ?? row.id),
    voluntarioId: row.volunteer_id,
    fecha: row.slot_date,
    horaInicio: row.start_time?.slice(0, 5) ?? "",
    horaFin: row.end_time?.slice(0, 5) ?? "",
    estado: row.status,
  }))
}

export function usePsicoSessions(pacienteId: string) {
  return useQuery({
    queryKey: ["psicoSessions", pacienteId],
    queryFn: () => fetchSessions(pacienteId),
  })
}

export function useVolunteers() {
  return useQuery({
    queryKey: ["volunteers"],
    queryFn: fetchVolunteers,
  })
}

export function useAvailableSlots(voluntarioId: string) {
  return useQuery({
    queryKey: ["availabilitySlots"],
    queryFn: fetchAvailableSlots,
    enabled: Boolean(voluntarioId),
  })
}

interface CreateSessionPayload {
  session: Omit<PsicoSession, "id"> & { id: string }
  slotId: string
}

export function useCreatePsicoSession(pacienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ session, slotId }: CreateSessionPayload) => {
      const { data: patient, error: patientError } = await supabase
        .from("fpc_patients")
        .select("id")
        .eq("legacy_id", session.pacienteId)
        .single()
      if (patientError || !patient) throw new Error("Paciente no encontrado")

      const { data: slot, error: slotError } = await supabase
        .from("fpc_availability_slots")
        .select("id, legacy_id")
        .eq("legacy_id", slotId)
        .single()
      if (slotError || !slot) throw new Error("Horario no encontrado")

      const { error: insertError } = await supabase
        .from("fpc_psico_sessions")
        .insert({
          legacy_id: session.id,
          patient_id: patient.id,
          volunteer_id: session.voluntarioId,
          availability_slot_id: slot.id,
          session_number: session.sesionNumero,
          session_date: session.fecha,
          start_time: `${session.horaInicio}:00`,
          end_time: `${session.horaFin}:00`,
          mode: session.modalidad,
          status: session.estado,
          notes: session.notas,
          satisfaction: session.satisfaccion ?? null,
          extra_needed: session.extraNeeded ?? null,
        })
      if (insertError) throw new Error("Error al crear sesión")

      const { error: slotUpdateError } = await supabase
        .from("fpc_availability_slots")
        .update({ status: "asignado" })
        .eq("id", slot.id)
      if (slotUpdateError) throw new Error("Error al actualizar horario")

      return session
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psicoSessions", pacienteId] })
      queryClient.invalidateQueries({ queryKey: ["availabilitySlots"] })
    },
  })
}

export function useUpdatePsicoSession(pacienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PsicoSession> }) => {
      const updates: Record<string, unknown> = {}
      if (data.fecha !== undefined) updates.session_date = data.fecha
      if (data.horaInicio !== undefined) updates.start_time = `${data.horaInicio}:00`
      if (data.horaFin !== undefined) updates.end_time = `${data.horaFin}:00`
      if (data.modalidad !== undefined) updates.mode = data.modalidad
      if (data.estado !== undefined) updates.status = data.estado
      if (data.notas !== undefined) updates.notes = data.notas
      if (data.satisfaccion !== undefined) updates.satisfaction = data.satisfaccion
      if (data.extraNeeded !== undefined) updates.extra_needed = data.extraNeeded

      const { error } = await supabase
        .from("fpc_psico_sessions")
        .update(updates)
        .eq("legacy_id", id)
      if (error) throw new Error("Error al actualizar sesión")

      return {
        id,
        pacienteId,
        voluntarioId: data.voluntarioId ?? '',
        availabilitySlotId: data.availabilitySlotId,
        sesionNumero: data.sesionNumero ?? 1,
        fecha: data.fecha ?? "",
        horaInicio: data.horaInicio ?? "",
        horaFin: data.horaFin ?? "",
        modalidad: data.modalidad ?? "llamada",
        estado: data.estado ?? "programada",
        notas: data.notas ?? "",
        satisfaccion: data.satisfaccion,
        extraNeeded: data.extraNeeded,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psicoSessions", pacienteId] })
    },
  })
}
