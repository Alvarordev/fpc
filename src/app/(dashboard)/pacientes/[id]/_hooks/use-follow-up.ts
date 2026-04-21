"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { PsicoSession } from "@/types/follow-up"
import type { HospitalAlert } from "@/types/hospital"
import type { Contact, TimelineEvent } from "@/types/contact"

interface ContactRow {
  id: string
  legacy_id: string | null
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

async function fetchContacts(pacienteId: string): Promise<Contact[]> {
  const { data: rows, error } = await supabase
    .from("fpc_contacts")
    .select(`
      id,
      legacy_id,
      patient:fpc_patients!fpc_contacts_patient_id_fkey(legacy_id),
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
    .eq("patient.legacy_id", pacienteId)

  if (error) throw new Error("Error al cargar contactos")

  return ((rows ?? []) as ContactRow[]).map((row) =>
    normalizeContact({
      id: String(row.legacy_id ?? row.id),
      pacienteId,
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
      notas: row.notes,
      camposActualizados: Array.isArray(row.updated_fields) ? row.updated_fields : [],
      motivoInconcluso: row.inconclusive_reason ?? undefined,
    })
  )
}

export function useContacts(pacienteId: string) {
  return useQuery({
    queryKey: ["contacts", pacienteId],
    queryFn: () => fetchContacts(pacienteId),
  })
}

export function useCreateContact(pacienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (contact: Contact) => {
      const { data: patient, error: patientError } = await supabase
        .from("fpc_patients")
        .select("id")
        .eq("legacy_id", contact.pacienteId)
        .maybeSingle()

      if (patientError || !patient) throw new Error("Paciente no encontrado")

      const { data: inserted, error: insertError } = await supabase
        .from("fpc_contacts")
        .insert({
          legacy_id: contact.id,
          patient_id: patient.id,
          created_by_user_id: contact.agenteId || null,
          assigned_user_id: contact.agenteId || null,
          origin: contact.origen,
          direction: contact.tipo,
          status: contact.estado,
          contact_date: contact.fecha,
          start_time: contact.horaInicio ? `${contact.horaInicio}:00` : null,
          end_time: contact.horaFin ? `${contact.horaFin}:00` : null,
          notes: contact.notas,
          updated_fields: contact.camposActualizados,
          inconclusive_reason: contact.motivoInconcluso ?? null,
        })
        .select("id")
        .single()

      if (insertError || !inserted) throw new Error("Error al registrar contacto")

      if (contact.motivos.length > 0) {
        const motivesPayload = contact.motivos.map((m) => ({
          contact_id: inserted.id,
          motive_code: m,
        }))
        const { error: motivesError } = await supabase
          .from("fpc_contact_motives")
          .upsert(motivesPayload, { onConflict: "contact_id,motive_code" })
        if (motivesError) throw new Error("Error al registrar motivos")
      }

      return contact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", pacienteId] })
    },
  })
}

export function useUpdateContact(pacienteId: string) {
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

        if (findError || !contactRow) throw new Error("Contacto no encontrado")

        const { error: deleteError } = await supabase
          .from("fpc_contact_motives")
          .delete()
          .eq("contact_id", contactRow.id)
        if (deleteError) throw new Error("Error al actualizar motivos")

        if (data.motivos.length > 0) {
          const { error: insertError } = await supabase
            .from("fpc_contact_motives")
            .insert(
              data.motivos.map((m) => ({
                contact_id: contactRow.id,
                motive_code: m,
              }))
            )
          if (insertError) throw new Error("Error al actualizar motivos")
        }
      }

      return {
        id,
        pacienteId,
        agenteId: "",
        origen: "seguimiento",
        tipo: "saliente",
        estado: data.estado ?? "completado",
        fecha: data.fecha ?? "",
        motivos: data.motivos ?? [],
        notas: data.notas ?? "",
        camposActualizados: data.camposActualizados ?? [],
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        motivoInconcluso: data.motivoInconcluso,
      } as Contact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", pacienteId] })
      queryClient.invalidateQueries({ queryKey: ["callcenterContacts"] })
    },
  })
}

export function buildTimeline(
  contacts: Contact[],
  psicoSessions: PsicoSession[],
  fechaCreacion?: string,
  hospitalAlerts: HospitalAlert[] = []
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  const hasEnrollmentContact = contacts.some((c) => c.origen === "enrolamiento")
  if (!hasEnrollmentContact && fechaCreacion) {
    events.push({
      id: `enroll-${fechaCreacion}`,
      type: "contacto",
      fecha: fechaCreacion.slice(0, 10),
      title: "Inscripción en el programa",
      description: "Contacto inicial de enrolamiento",
      meta: {
        origen: "enrolamiento",
        tipo: "entrante",
        estado: "completado",
      },
    })
  }

  for (const contact of contacts) {
    const isEnrollment = contact.origen === "enrolamiento"
    const title = isEnrollment
      ? "Inscripción en el programa"
      : contact.estado === "agendado"
        ? "Contacto de seguimiento agendado"
        : contact.tipo === "entrante"
          ? "Llamada entrante del paciente"
          : "Llamada de seguimiento"

    events.push({
      id: contact.id,
      type: "contacto",
      fecha: contact.fecha,
      title,
      description: contact.notas,
      meta: {
        origen: contact.origen,
        tipo: contact.tipo,
        estado: contact.estado,
        horaInicio: contact.horaInicio,
        horaFin: contact.horaFin,
        motivos: contact.motivos,
        camposActualizados: contact.camposActualizados,
        motivoInconcluso: contact.motivoInconcluso,
      },
    })
  }

  for (const session of psicoSessions) {
    events.push({
      id: session.id,
      type: "psico",
      fecha: session.fecha,
      title: `Sesión de psicooncología #${session.sesionNumero}`,
      description: session.notas || `${session.modalidad} — ${session.estado}`,
      meta: {
        estado: session.estado,
        modalidad: session.modalidad,
        sesionNumero: session.sesionNumero,
        voluntarioId: session.voluntarioId,
      },
    })
  }

  for (const alert of hospitalAlerts) {
    events.push({
      id: alert.id,
      type: "alerta",
      fecha: alert.fecha,
      title: "Alerta de hospital reportada",
      description: alert.detalle,
      meta: {
        hospitalId: alert.hospitalId,
        estado: alert.estado,
        fechaResolucion: alert.fechaResolucion,
      },
    })
  }

  return events.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export const useFollowUpCalls = useContacts
export const useCreateFollowUpCall = useCreateContact
