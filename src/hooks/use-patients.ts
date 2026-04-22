"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Patient, PatientStatus } from "@/types/patient"

async function fetchPatients(includeProspects = false): Promise<Patient[]> {
  let query = supabase
    .from("fpc_patients")
    .select("id, legacy_id, enrollment_payload, status")

  if (!includeProspects) {
    query = query.neq("status", "prospecto")
  }

  const { data, error } = await query

  if (error) throw new Error("Error al cargar pacientes")

  return (data ?? []).map((row) => ({
    ...(row.enrollment_payload as Patient),
    id: String(row.legacy_id ?? row.id),
    estado: row.status as PatientStatus,
  }))
}

interface UsePatientsOptions {
  enabled?: boolean
  includeProspects?: boolean
}

export function usePatients(options?: UsePatientsOptions) {
  return useQuery({
    queryKey: ["patients", { includeProspects: options?.includeProspects }],
    queryFn: () => fetchPatients(options?.includeProspects),
    enabled: options?.enabled,
  })
}
