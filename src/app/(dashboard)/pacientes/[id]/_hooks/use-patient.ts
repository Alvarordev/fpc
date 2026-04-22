"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Patient, PatientStatus } from "@/types/patient"

async function fetchPatient(id: string): Promise<Patient> {
  const { data, error } = await supabase
    .from("fpc_patients")
    .select("id, legacy_id, enrollment_payload, status")
    .eq("legacy_id", id)
    .maybeSingle()

  if (error || !data) throw new Error("Paciente no encontrado")

  return {
    ...(data.enrollment_payload as Patient),
    id: String(data.legacy_id ?? data.id),
    estado: data.status as Patient['estado'],
  }
}

async function patchPatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const { data: existing, error: existingError } = await supabase
    .from("fpc_patients")
    .select("id, legacy_id, enrollment_payload")
    .eq("legacy_id", id)
    .maybeSingle()

  if (existingError || !existing) throw new Error("Paciente no encontrado")

  const nextPayload = {
    ...(existing.enrollment_payload as Record<string, unknown>),
    ...data,
  }

  const { data: updated, error: updateError } = await supabase
    .from("fpc_patients")
    .update({
      enrollment_payload: nextPayload,
      status: data.estado ?? "activo",
      full_name: typeof data.q9_nombrePaciente === "string" ? data.q9_nombrePaciente : (nextPayload.q9_nombrePaciente as string | undefined),
      dni: typeof data.q10_dni === "string" ? data.q10_dni : (nextPayload.q10_dni as string | undefined),
      patient_number: typeof data.nroPaciente === "string" ? data.nroPaciente : (nextPayload.nroPaciente as string | undefined),
      phone: typeof data.q17_telefono === "string" ? data.q17_telefono : (nextPayload.q17_telefono as string | undefined),
      aux_phone: typeof data.q18_telefonoAuxiliar === "string" ? data.q18_telefonoAuxiliar : (nextPayload.q18_telefonoAuxiliar as string | undefined),
      family_phone: typeof data.q19_telefonoFamiliar === "string" ? data.q19_telefonoFamiliar : (nextPayload.q19_telefonoFamiliar as string | undefined),
      caregiver_name: typeof data.q20_nombreFamiliar === "string" ? data.q20_nombreFamiliar : (nextPayload.q20_nombreFamiliar as string | undefined),
      caregiver_gender: typeof data.generoCuidador === "string" ? data.generoCuidador : (nextPayload.generoCuidador as string | undefined),
      entry_point: typeof data.puntoIngreso === "string" ? data.puntoIngreso : (nextPayload.puntoIngreso as string | undefined),
      health_phase: typeof data.faseSalud === "string" ? data.faseSalud : (nextPayload.faseSalud as string | undefined),
      birth_date: typeof data.q11_fechaNacimiento === "string" ? data.q11_fechaNacimiento : (nextPayload.q11_fechaNacimiento as string | undefined),
    })
    .eq("id", existing.id)
    .select("id, legacy_id, enrollment_payload")
    .single()

  if (updateError || !updated) throw new Error("Error al guardar cambios")

  return {
    ...(updated.enrollment_payload as Patient),
    id: String(updated.legacy_id ?? updated.id),
  }
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => fetchPatient(id),
    enabled: Boolean(id),
  })
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Patient>) => patchPatient(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["patients", id], updated)
    },
  })
}

export interface CreateProspectInput {
  nombre: string
  telefono: string
  dni?: string
  canal: string
  fecha: string
  hora: string
  notas?: string
  agenteId: string
}

export function useCreateProspect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProspectInput) => {
      const legacyId = `p-${Date.now()}`
      const nowIso = new Date().toISOString()

      // 1. Crear paciente prospecto
      const { data: patient, error: patientError } = await supabase
        .from("fpc_patients")
        .insert({
          legacy_id: legacyId,
          status: "prospecto" as PatientStatus,
          full_name: input.nombre,
          phone: input.telefono,
          dni: input.dni || null,
          entry_point: input.canal,
          enrollment_payload: {
            id: legacyId,
            q9_nombrePaciente: input.nombre,
            q17_telefono: input.telefono,
            q10_dni: input.dni || "",
            puntoIngreso: input.canal,
            fechaCreacion: nowIso,
            estado: "prospecto",
          },
          created_by_user_id: input.agenteId || null,
        })
        .select("id, legacy_id")
        .single()

      if (patientError || !patient) throw new Error("Error al crear prospecto")

      // 2. Crear contacto agendado
      const contactLegacyId = `scheduled-${Date.now()}`
      await supabase.from("fpc_contacts").insert({
        legacy_id: contactLegacyId,
        patient_id: patient.id,
        created_by_user_id: input.agenteId || null,
        assigned_user_id: input.agenteId || null,
        origin: "seguimiento",
        direction: "saliente",
        status: "agendado",
        contact_date: input.fecha,
        start_time: input.hora ? `${input.hora}:00` : null,
        notes: input.notas || "Contacto de seguimiento agendado",
      })

      return { patientId: String(patient.legacy_id ?? patient.id), contactId: contactLegacyId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["callcenterContacts"] })
    },
  })
}

export function useDeleteProspect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (legacyId: string) => {
      // 1. Buscar el paciente por legacy_id
      const { data: patient, error: findError } = await supabase
        .from("fpc_patients")
        .select("id")
        .eq("legacy_id", legacyId)
        .single()

      if (findError || !patient) throw new Error("Prospecto no encontrado")

      // 2. Borrar primero los contactos (FK con RESTRICT, no CASCADE)
      const { error: contactsError } = await supabase
        .from("fpc_contacts")
        .delete()
        .eq("patient_id", patient.id)

      if (contactsError) throw new Error("Error al eliminar contactos del prospecto")

      // 3. Borrar el paciente
      const { error: deleteError } = await supabase
        .from("fpc_patients")
        .delete()
        .eq("id", patient.id)

      if (deleteError) throw new Error("Error al eliminar prospecto")

      return legacyId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["callcenterContacts"] })
    },
  })
}
