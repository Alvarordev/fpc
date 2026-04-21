"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Patient } from "@/types/patient"

async function fetchPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("fpc_patients")
    .select("id, legacy_id, enrollment_payload")

  if (error) throw new Error("Error al cargar pacientes")

  return (data ?? []).map((row) => ({
    ...(row.enrollment_payload as Patient),
    id: String(row.legacy_id ?? row.id),
  }))
}

interface UsePatientsOptions {
  enabled?: boolean
}

export function usePatients(options?: UsePatientsOptions) {
  return useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
    enabled: options?.enabled,
  })
}
