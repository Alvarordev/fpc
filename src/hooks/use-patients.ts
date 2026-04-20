"use client"

import { useQuery } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { Patient } from "@/types/patient"

async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_URL}/patients`)
  if (!res.ok) throw new Error("Error al cargar pacientes")
  return res.json()
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
