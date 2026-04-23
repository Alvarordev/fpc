"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { AvailabilitySlot } from "@/types/volunteer"

interface SlotRow {
  id: string
  legacy_id: string | null
  volunteer_id: string
  slot_date: string
  start_time: string
  end_time: string
  status: AvailabilitySlot["estado"]
}

async function fetchMySlots(voluntarioId: string): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase
    .from("fpc_availability_slots")
    .select("id, legacy_id, volunteer_id, slot_date, start_time, end_time, status")
    .eq("volunteer_id", voluntarioId)

  if (error) throw new Error("Error al cargar disponibilidad")

  return ((data ?? []) as SlotRow[]).map((row) => ({
    id: String(row.legacy_id ?? row.id),
    voluntarioId: row.volunteer_id,
    fecha: row.slot_date,
    horaInicio: row.start_time?.slice(0, 5) ?? "",
    horaFin: row.end_time?.slice(0, 5) ?? "",
    estado: row.status,
  }))
}

interface CreateSlotPayload {
  fecha: string
  horaInicio: string
  horaFin: string
  estado: AvailabilitySlot["estado"]
}

export interface BulkSlotPayload {
  fecha: string
  horaInicio: string
  horaFin: string
}

async function postSlot(
  volunteerId: string,
  payload: CreateSlotPayload
): Promise<AvailabilitySlot> {
  const legacyId = `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  const { data, error } = await supabase
    .from("fpc_availability_slots")
    .insert({
      legacy_id: legacyId,
      volunteer_id: volunteerId,
      slot_date: payload.fecha,
      start_time: `${payload.horaInicio}:00`,
      end_time: `${payload.horaFin}:00`,
      status: payload.estado,
    })
    .select("id, legacy_id")
    .single()

  if (error || !data) throw new Error("Error al crear disponibilidad")

  return {
    voluntarioId: volunteerId,
    ...payload,
    id: String(data.legacy_id ?? data.id),
  }
}

async function postBulkSlots(
  volunteerId: string,
  slots: BulkSlotPayload[]
): Promise<AvailabilitySlot[]> {
  if (slots.length === 0) return []

  const rows = slots.map((s) => ({
    legacy_id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    volunteer_id: volunteerId,
    slot_date: s.fecha,
    start_time: `${s.horaInicio}:00`,
    end_time: `${s.horaFin}:00`,
    status: "disponible" as const,
  }))

  const { data, error } = await supabase
    .from("fpc_availability_slots")
    .insert(rows)
    .select("id, legacy_id")

  if (error || !data) throw new Error("Error al crear disponibilidades")

  return slots.map((s, i) => ({
    voluntarioId: volunteerId,
    ...s,
    estado: "disponible" as const,
    id: String(data[i]?.legacy_id ?? data[i]?.id ?? `${Date.now()}-${i}`),
  }))
}

async function deleteSlot(id: string): Promise<void> {
  const { error } = await supabase
    .from("fpc_availability_slots")
    .delete()
    .or(`legacy_id.eq.${id},id.eq.${id}`)
  if (error) throw new Error("Error al eliminar disponibilidad")
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
    mutationFn: (payload: CreateSlotPayload) => postSlot(voluntarioId, payload),
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

export function useCreateBulkSlots(voluntarioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slots: BulkSlotPayload[]) => postBulkSlots(voluntarioId, slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAvailabilitySlots", voluntarioId] })
      queryClient.invalidateQueries({ queryKey: ["availabilitySlots"] })
    },
  })
}
