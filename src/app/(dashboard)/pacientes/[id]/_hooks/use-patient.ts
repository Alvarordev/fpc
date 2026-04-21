"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Patient } from "@/types/patient"

async function fetchPatient(id: string): Promise<Patient> {
  const { data, error } = await supabase
    .from("fpc_patients")
    .select("id, legacy_id, enrollment_payload")
    .eq("legacy_id", id)
    .maybeSingle()

  if (error || !data) throw new Error("Paciente no encontrado")

  return {
    ...(data.enrollment_payload as Patient),
    id: String(data.legacy_id ?? data.id),
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
      status: data.estado === "inactivo" ? "inactivo" : "activo",
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
