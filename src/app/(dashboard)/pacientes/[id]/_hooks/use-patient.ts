"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { Patient } from "@/types/patient"

async function fetchPatient(id: string): Promise<Patient> {
  const res = await fetch(`${API_URL}/patients/${id}`)
  if (!res.ok) throw new Error("Paciente no encontrado")
  return res.json()
}

async function patchPatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al guardar cambios")
  return res.json()
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => fetchPatient(id),
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
