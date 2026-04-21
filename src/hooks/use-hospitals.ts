"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Hospital, HospitalAlert } from "@/types/hospital"

interface AlertRow {
  id: string
  legacy_id: string | null
  hospital?: { legacy_id?: string | null } | null
  patient?: { legacy_id?: string | null } | null
  created_by?: { id?: string | null } | null
  detail: string
  alert_date: string
  status: HospitalAlert["estado"]
  resolved_at?: string | null
}

export function useHospitals() {
  return useQuery<Hospital[]>({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fpc_hospitals")
        .select("id, legacy_id, nombre, ciudad")

      if (error) throw new Error("Error al cargar hospitales")

      return (data ?? []).map((row) => ({
        id: String(row.legacy_id ?? row.id),
        nombre: row.nombre,
        ciudad: row.ciudad ?? "",
      }))
    },
  })
}

export function useCreateHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Hospital, "id">) => {
      const legacyId = `h${Date.now()}`
      const { data: created, error } = await supabase
        .from("fpc_hospitals")
        .insert({
          legacy_id: legacyId,
          nombre: data.nombre,
          ciudad: data.ciudad,
        })
        .select("id, legacy_id, nombre, ciudad")
        .single()

      if (error || !created) throw new Error("Error al crear hospital")

      return {
        id: String(created.legacy_id ?? created.id),
        nombre: created.nombre,
        ciudad: created.ciudad ?? "",
      }
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
      let query = supabase
        .from("fpc_hospital_alerts")
        .select(`
          id,
          legacy_id,
          hospital:fpc_hospitals!fpc_hospital_alerts_hospital_id_fkey(legacy_id),
          patient:fpc_patients!fpc_hospital_alerts_patient_id_fkey(legacy_id),
          created_by:fpc_users!fpc_hospital_alerts_created_by_user_id_fkey(id),
          detail,
          alert_date,
          status,
          resolved_at
        `)

      if (hospitalId) {
        query = query.eq("hospital.legacy_id", hospitalId)
      }

      const { data, error } = await query
      if (error) throw new Error("Error al cargar alertas")

      return ((data ?? []) as AlertRow[]).map((row) => ({
        id: String(row.legacy_id ?? row.id),
        hospitalId: String(row.hospital?.legacy_id ?? ""),
        pacienteId: String(row.patient?.legacy_id ?? ""),
        agenteId: row.created_by?.id ? String(row.created_by.id) : "",
        detalle: row.detail,
        fecha: row.alert_date,
        estado: row.status,
        fechaResolucion: row.resolved_at ? String(row.resolved_at).slice(0, 10) : undefined,
      }))
    },
  })
}

export function useCreateHospitalAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<HospitalAlert, "id">) => {
      const { data: hospital, error: hospitalError } = await supabase
        .from("fpc_hospitals")
        .select("id")
        .eq("legacy_id", data.hospitalId)
        .single()
      if (hospitalError || !hospital) throw new Error("Error al crear alerta")

      const { data: patient, error: patientError } = await supabase
        .from("fpc_patients")
        .select("id")
        .eq("legacy_id", data.pacienteId)
        .maybeSingle()
      if (patientError) throw new Error("Error al crear alerta")

      const legacyId = `ha${Date.now()}`
      const { data: created, error } = await supabase
        .from("fpc_hospital_alerts")
        .insert({
          legacy_id: legacyId,
          hospital_id: hospital.id,
          patient_id: patient?.id ?? null,
          created_by_user_id: data.agenteId || null,
          detail: data.detalle,
          alert_date: data.fecha,
          status: data.estado,
          resolved_at: data.fechaResolucion ? `${data.fechaResolucion}T00:00:00Z` : null,
        })
        .select("id, legacy_id")
        .single()

      if (error || !created) throw new Error("Error al crear alerta")

      return {
        ...data,
        id: String(created.legacy_id ?? created.id),
      }
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
      const updates: Record<string, unknown> = {}
      if (data.detalle !== undefined) updates.detail = data.detalle
      if (data.fecha !== undefined) updates.alert_date = data.fecha
      if (data.estado !== undefined) updates.status = data.estado
      if (data.fechaResolucion !== undefined) {
        updates.resolved_at = data.fechaResolucion ? `${data.fechaResolucion}T00:00:00Z` : null
      }

      const { error } = await supabase
        .from("fpc_hospital_alerts")
        .update(updates)
        .eq("legacy_id", id)

      if (error) throw new Error("Error al actualizar alerta")

      return {
        id,
        hospitalId: data.hospitalId ?? "",
        pacienteId: data.pacienteId ?? "",
        agenteId: data.agenteId ?? "",
        detalle: data.detalle ?? "",
        fecha: data.fecha ?? "",
        estado: data.estado ?? "activa",
        fechaResolucion: data.fechaResolucion,
      } as HospitalAlert
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalAlerts"] })
    },
  })
}
