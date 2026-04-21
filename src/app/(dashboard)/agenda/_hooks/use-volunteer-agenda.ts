'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { PsicoSession } from '@/types/follow-up'
import type { Patient } from '@/types/patient'

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
  mode: PsicoSession['modalidad']
  status: PsicoSession['estado']
  notes?: string | null
  satisfaction?: number | null
  extra_needed?: boolean | null
}

async function fetchVolunteerSessions(
  voluntarioId: string,
): Promise<PsicoSession[]> {
  const { data: volunteer, error: volunteerError } = await supabase
    .from('fpc_volunteers')
    .select('id')
    .eq('id', voluntarioId)
    .maybeSingle()

  if (volunteerError || !volunteer) throw new Error('Error al cargar sesiones')

  const { data, error } = await supabase
    .from('fpc_psico_sessions')
    .select('id, legacy_id, patient:fpc_patients!fpc_psico_sessions_patient_id_fkey(legacy_id), volunteer:fpc_volunteers!fpc_psico_sessions_volunteer_id_fkey(legacy_id), availability_slot:fpc_availability_slots!fpc_psico_sessions_availability_slot_id_fkey(legacy_id), session_number, session_date, start_time, end_time, mode, status, notes, satisfaction, extra_needed')
    .eq('volunteer_id', volunteer.id)

  if (error) throw new Error('Error al cargar sesiones')

  return ((data ?? []) as SessionRow[]).map((row) => ({
    id: String(row.legacy_id ?? row.id),
    pacienteId: String(row.patient?.legacy_id ?? ''),
    voluntarioId: Number(row.volunteer?.legacy_id ?? 0),
    availabilitySlotId: row.availability_slot?.legacy_id ? String(row.availability_slot.legacy_id) : undefined,
    sesionNumero: Number(row.session_number ?? 1),
    fecha: row.session_date,
    horaInicio: row.start_time?.slice(0, 5) ?? '',
    horaFin: row.end_time?.slice(0, 5) ?? '',
    modalidad: row.mode,
    estado: row.status,
    notas: row.notes ?? '',
    satisfaccion: row.satisfaction ?? undefined,
    extraNeeded: row.extra_needed ?? undefined,
  }))
}

async function fetchAllPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('fpc_patients')
    .select('id, legacy_id, enrollment_payload')

  if (error) throw new Error('Error al cargar pacientes')

  return (data ?? []).map((row) => ({
    ...(row.enrollment_payload as Patient),
    id: String(row.legacy_id ?? row.id),
  }))
}

export function useVolunteerSessions(voluntarioId: string | undefined) {
  return useQuery({
    queryKey: ['volunteerSessions', voluntarioId],
    queryFn: () => fetchVolunteerSessions(voluntarioId!),
    enabled: Boolean(voluntarioId),
  })
}

export function useAllPatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchAllPatients,
  })
}

export function useUpdateAgendaSession(voluntarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      pacienteId: string
      data: Partial<PsicoSession>
    }) => {
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
        .from('fpc_psico_sessions')
        .update(updates)
        .eq('legacy_id', id)

      if (error) throw new Error('Error al actualizar sesión')

      return {
        id,
        pacienteId: data.pacienteId ?? '',
        voluntarioId: data.voluntarioId ?? 0,
        availabilitySlotId: data.availabilitySlotId,
        sesionNumero: data.sesionNumero ?? 1,
        fecha: data.fecha ?? '',
        horaInicio: data.horaInicio ?? '',
        horaFin: data.horaFin ?? '',
        modalidad: data.modalidad ?? 'llamada',
        estado: data.estado ?? 'programada',
        notas: data.notas ?? '',
        satisfaccion: data.satisfaccion,
        extraNeeded: data.extraNeeded,
      } as PsicoSession
    },
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['volunteerSessions', voluntarioId],
      })
      queryClient.invalidateQueries({
        queryKey: ['psicoSessions', variables.pacienteId],
      })
    },
  })
}
