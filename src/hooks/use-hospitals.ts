"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { Hospital, HospitalAlert } from "@/types/hospital"

export function useHospitals() {
  return useQuery<Hospital[]>({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/hospitals`)
      if (!res.ok) throw new Error("Error al cargar hospitales")
      return res.json()
    },
  })
}

export function useCreateHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Hospital, "id">) => {
      const res = await fetch(`${API_URL}/hospitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: `h${Date.now()}` }),
      })
      if (!res.ok) throw new Error("Error al crear hospital")
      return res.json() as Promise<Hospital>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] })
    },
  })
}

export function useHospitalAlerts(hospitalId?: string) {
  return useQuery<HospitalAlert[]>({
    queryKey: ["hospitalAlerts", hospitalId],
    queryFn: async () => {
      const url = hospitalId
        ? `${API_URL}/hospitalAlerts?hospitalId=${hospitalId}`
        : `${API_URL}/hospitalAlerts`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Error al cargar alertas")
      return res.json()
    },
  })
}

export function useCreateHospitalAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<HospitalAlert, "id">) => {
      const res = await fetch(`${API_URL}/hospitalAlerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: `ha${Date.now()}` }),
      })
      if (!res.ok) throw new Error("Error al crear alerta")
      return res.json() as Promise<HospitalAlert>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalAlerts"] })
    },
  })
}

export function useUpdateHospitalAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<HospitalAlert> & { id: string }) => {
      const res = await fetch(`${API_URL}/hospitalAlerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Error al actualizar alerta")
      return res.json() as Promise<HospitalAlert>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalAlerts"] })
    },
  })
}
