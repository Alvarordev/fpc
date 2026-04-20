"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { PsicoSession } from "@/types/follow-up"
import type { HospitalAlert } from "@/types/hospital"
import type { Contact, TimelineEvent } from "@/types/contact"

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
  const contactsRes = await fetch(`${API_URL}/contacts?pacienteId=${pacienteId}`)
  if (contactsRes.ok) {
    const data = (await contactsRes.json()) as Array<
      Partial<Contact> & { proximaLlamada?: string }
    >
    const normalized = data.flatMap((item) => {
      const base = normalizeContact(item)
      const next = item.proximaLlamada
        ? normalizeContact({
            id: `scheduled-${base.id}`,
            pacienteId: base.pacienteId,
            agenteId: base.agenteId,
            origen: "seguimiento",
            tipo: "saliente",
            estado: "agendado",
            fecha: item.proximaLlamada,
            motivos: [],
            notas: "Contacto de seguimiento agendado",
            camposActualizados: [],
          })
        : null
      return next ? [base, next] : [base]
    })

    if (normalized.length > 0) {
      return normalized
    }
  }

  const legacyRes = await fetch(`${API_URL}/followUpCalls?pacienteId=${pacienteId}`)
  if (!legacyRes.ok) throw new Error("Error al cargar contactos")
  const legacy = (await legacyRes.json()) as Array<
    Partial<Contact> & { proximaLlamada?: string }
  >
  const mapped = legacy.flatMap((item) => {
    const base = normalizeContact({
      ...item,
      origen: "seguimiento",
      estado: "completado",
    })
    const next = item.proximaLlamada
      ? normalizeContact({
          id: `scheduled-${base.id}`,
          pacienteId: base.pacienteId,
          agenteId: base.agenteId,
          origen: "seguimiento",
          tipo: "saliente",
          estado: "agendado",
          fecha: item.proximaLlamada,
          motivos: [],
          notas: "Contacto de seguimiento agendado",
          camposActualizados: [],
        })
      : null
    return next ? [base, next] : [base]
  })
  return mapped
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
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      })
      if (!res.ok) throw new Error("Error al registrar contacto")
      return res.json() as Promise<Contact>
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
      const res = await fetch(`${API_URL}/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Error al actualizar contacto")
      return res.json() as Promise<Contact>
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
