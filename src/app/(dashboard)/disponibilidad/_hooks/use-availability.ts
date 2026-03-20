"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { AvailabilitySlot } from "@/types/volunteer"

async function fetchMySlots(voluntarioId: string): Promise<AvailabilitySlot[]> {
  const res = await fetch(`${API_URL}/availabilitySlots?voluntarioId=${voluntarioId}`)
  if (!res.ok) throw new Error("Error al cargar disponibilidad")
  return res.json()
}

async function postSlot(
  payload: Omit<AvailabilitySlot, "id">
): Promise<AvailabilitySlot> {
  const res = await fetch(`${API_URL}/availabilitySlots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Error al crear disponibilidad")
  return res.json()
}

async function deleteSlot(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/availabilitySlots/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Error al eliminar disponibilidad")
}

export function useMySlots(voluntarioId: string | undefined) {
  return useQuery({
    queryKey: ["myAvailabilitySlots", voluntarioId],
    queryFn: () => fetchMySlots(voluntarioId!),
    enabled: Boolean(voluntarioId),
  })
}

export function useCreateSlot(voluntarioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<AvailabilitySlot, "id">) => postSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAvailabilitySlots", voluntarioId] })
      queryClient.invalidateQueries({ queryKey: ["availabilitySlots"] })
    },
  })
}

export function useDeleteSlot(voluntarioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slot: AvailabilitySlot) => {
      if (slot.estado !== "disponible") throw new Error("Solo se pueden eliminar slots disponibles")
      return deleteSlot(slot.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAvailabilitySlots", voluntarioId] })
      queryClient.invalidateQueries({ queryKey: ["availabilitySlots"] })
    },
  })
}

export interface BulkSlotPayload {
  fecha: string
  horaInicio: string
  horaFin: string
}

export function useCreateBulkSlots(voluntarioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slots: BulkSlotPayload[]) =>
      Promise.all(
        slots.map((s) =>
          postSlot({
            voluntarioId: Number(voluntarioId),
            fecha: s.fecha,
            horaInicio: s.horaInicio,
            horaFin: s.horaFin,
            estado: "disponible",
          })
        )
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAvailabilitySlots", voluntarioId] })
      queryClient.invalidateQueries({ queryKey: ["availabilitySlots"] })
    },
  })
}
