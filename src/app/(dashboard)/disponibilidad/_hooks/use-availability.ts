"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { AvailabilitySlot } from "@/types/volunteer"

interface SlotRow {
  id: string
  legacy_id: string | null
  volunteer?: { legacy_id?: number | string | null } | null
  slot_date: string
  start_time: string
  end_time: string
  status: AvailabilitySlot["estado"]
}

async function fetchMySlots(voluntarioId: string): Promise<AvailabilitySlot[]> {
  const { data: volunteer, error: volunteerError } = await supabase
    .from("fpc_volunteers")
    .select("id")
    .eq("id", voluntarioId)
    .maybeSingle()

  if (volunteerError || !volunteer) throw new Error("Error al cargar disponibilidad")

  const { data, error } = await supabase
    .from("fpc_availability_slots")
    .select("id, legacy_id, volunteer:fpc_volunteers!fpc_availability_slots_volunteer_id_fkey(legacy_id), slot_date, start_time, end_time, status")
    .eq("volunteer_id", volunteer.id)

  if (error) throw new Error("Error al cargar disponibilidad")

  return ((data ?? []) as SlotRow[]).map((row) => ({
    id: String(row.legacy_id ?? row.id),
    voluntarioId: Number(row.volunteer?.legacy_id ?? 0),
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

async function postSlot(
  volunteerId: string,
  payload: CreateSlotPayload
): Promise<AvailabilitySlot> {

  const legacyId = `slot-${Date.now()}`

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
    voluntarioId: 0,
    ...payload,
    id: String(data.legacy_id ?? data.id),
  }
}

async function deleteSlot(id: string): Promise<void> {
  const { error } = await supabase
    .from("fpc_availability_slots")
    .delete()
    .eq("legacy_id", id)
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
          postSlot(voluntarioId, {
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
