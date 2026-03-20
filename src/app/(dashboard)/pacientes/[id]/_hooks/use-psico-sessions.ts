"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { PsicoSession } from "@/types/follow-up"
import type { Volunteer, AvailabilitySlot } from "@/types/volunteer"

async function fetchSessions(pacienteId: string): Promise<PsicoSession[]> {
  const res = await fetch(`${API_URL}/psicoSessions?pacienteId=${pacienteId}`)
  if (!res.ok) throw new Error("Error al cargar sesiones")
  return res.json()
}

async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await fetch(`${API_URL}/volunteers`)
  if (!res.ok) throw new Error("Error al cargar voluntarios")
  return res.json()
}

async function fetchAvailableSlots(): Promise<AvailabilitySlot[]> {
  const res = await fetch(
    `${API_URL}/availabilitySlots?estado=disponible`
  )
  if (!res.ok) throw new Error("Error al cargar horarios")
  return res.json()
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
      const [sessionRes] = await Promise.all([
        fetch(`${API_URL}/psicoSessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
        }),
        fetch(`${API_URL}/availabilitySlots/${slotId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "asignado" }),
        }),
      ])
      if (!sessionRes.ok) throw new Error("Error al crear sesión")
      return sessionRes.json() as Promise<PsicoSession>
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
      const res = await fetch(`${API_URL}/psicoSessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Error al actualizar sesión")
      return res.json() as Promise<PsicoSession>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psicoSessions", pacienteId] })
    },
  })
}
