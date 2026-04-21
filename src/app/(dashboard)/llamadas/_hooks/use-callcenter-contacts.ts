"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Contact } from "@/types/contact"
import type { Patient } from "@/types/patient"

interface ContactWithPatient extends Contact {
  patientName: string
  patientDni: string
}

interface ContactRow {
  id: string
  legacy_id: string | null
  patient?: { legacy_id?: string | null; enrollment_payload?: Patient | null } | null
  created_by?: { id?: string | null } | null
  origin: Contact["origen"]
  direction: Contact["tipo"]
  status: Contact["estado"]
  contact_date: string
  start_time?: string | null
  end_time?: string | null
  notes?: string | null
  updated_fields?: string[] | null
  inconclusive_reason?: string | null
  fpc_contact_motives?: Array<{ motive_code: string }> | null
}

function normalizeContact(raw: Partial<Contact>): Contact {
  return {
    id: String(raw.id ?? `ct-${Date.now()}`),
    pacienteId: String(raw.pacienteId ?? ""),
    agenteId: String(raw.agenteId ?? ""),
    origen: raw.origen ?? "seguimiento",
    tipo: raw.tipo ?? "saliente",
    estado: raw.estado ?? "completado",
    fecha: String(raw.fecha ?? ""),
    horaInicio: raw.horaInicio,
    horaFin: raw.horaFin,
    motivos: Array.isArray(raw.motivos) ? raw.motivos : [],
    notas: raw.notas ?? "",
    camposActualizados: Array.isArray(raw.camposActualizados)
      ? raw.camposActualizados
      : [],
    motivoInconcluso: raw.motivoInconcluso,
  }
}

async function fetchCallcenterContacts(): Promise<ContactWithPatient[]> {
  const { data: rows, error } = await supabase
    .from("fpc_contacts")
    .select(`
      id,
      legacy_id,
      patient:fpc_patients!fpc_contacts_patient_id_fkey(legacy_id, enrollment_payload),
      created_by:fpc_users!fpc_contacts_created_by_user_id_fkey(id),
      origin,
      direction,
      status,
      contact_date,
      start_time,
      end_time,
      notes,
      updated_fields,
      inconclusive_reason,
      fpc_contact_motives(motive_code)
    `)

  if (error) throw new Error("Error al cargar contactos")

  return ((rows ?? []) as ContactRow[]).map((row) => {
    const payload = (row.patient?.enrollment_payload ?? {}) as Patient
    const contact = normalizeContact({
      id: String(row.legacy_id ?? row.id),
      pacienteId: String(row.patient?.legacy_id ?? ""),
      agenteId: row.created_by?.id ? String(row.created_by.id) : "",
      origen: row.origin,
      tipo: row.direction,
      estado: row.status,
      fecha: row.contact_date,
      horaInicio: row.start_time?.slice(0, 5),
      horaFin: row.end_time?.slice(0, 5),
      motivos: Array.isArray(row.fpc_contact_motives)
        ? row.fpc_contact_motives.map((m) => String(m.motive_code))
        : [],
      notas: row.notes ?? "",
      camposActualizados: Array.isArray(row.updated_fields) ? row.updated_fields : [],
      motivoInconcluso: row.inconclusive_reason ?? undefined,
    })

    return {
      ...contact,
      patientName: payload?.q9_nombrePaciente ?? "Paciente desconocido",
      patientDni: payload?.q10_dni ?? "—",
    }
  })
}

export function useCallcenterContacts() {
  return useQuery({
    queryKey: ["callcenterContacts"],
    queryFn: fetchCallcenterContacts,
  })
}

export function useUpdateCallcenterContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      const updates: Record<string, unknown> = {}
      if (data.estado) updates.status = data.estado
      if (data.notas !== undefined) updates.notes = data.notas
      if (data.horaInicio !== undefined) updates.start_time = data.horaInicio ? `${data.horaInicio}:00` : null
      if (data.horaFin !== undefined) updates.end_time = data.horaFin ? `${data.horaFin}:00` : null
      if (data.motivoInconcluso !== undefined) updates.inconclusive_reason = data.motivoInconcluso
      if (data.camposActualizados !== undefined) updates.updated_fields = data.camposActualizados

      const { error: updateError } = await supabase
        .from("fpc_contacts")
        .update(updates)
        .eq("legacy_id", id)

      if (updateError) throw new Error("Error al actualizar contacto")

      if (data.motivos) {
        const { data: contactRow, error: findError } = await supabase
          .from("fpc_contacts")
          .select("id")
          .eq("legacy_id", id)
          .single()
        if (findError || !contactRow) throw new Error("Error al actualizar contacto")

        const { error: deleteError } = await supabase
          .from("fpc_contact_motives")
          .delete()
          .eq("contact_id", contactRow.id)
        if (deleteError) throw new Error("Error al actualizar contacto")

        if (data.motivos.length > 0) {
          const { error: motivesError } = await supabase
            .from("fpc_contact_motives")
            .insert(
              data.motivos.map((m) => ({
                contact_id: contactRow.id,
                motive_code: m,
              }))
            )
          if (motivesError) throw new Error("Error al actualizar contacto")
        }
      }

      return {
        id,
        pacienteId: data.pacienteId ?? "",
        agenteId: data.agenteId ?? "",
        origen: data.origen ?? "seguimiento",
        tipo: data.tipo ?? "saliente",
        estado: data.estado ?? "completado",
        fecha: data.fecha ?? "",
        motivos: data.motivos ?? [],
        notas: data.notas ?? "",
        camposActualizados: data.camposActualizados ?? [],
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        motivoInconcluso: data.motivoInconcluso,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callcenterContacts"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}

export type { ContactWithPatient }
