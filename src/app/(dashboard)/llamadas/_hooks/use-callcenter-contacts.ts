"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { Contact } from "@/types/contact"
import type { Patient } from "@/types/patient"

interface ContactWithPatient extends Contact {
  patientName: string
  patientDni: string
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
  const [patientsRes, contactsRes] = await Promise.all([
    fetch(`${API_URL}/patients`),
    fetch(`${API_URL}/contacts`),
  ])

  if (!patientsRes.ok) throw new Error("Error al cargar pacientes")

  const patients = (await patientsRes.json()) as Patient[]
  let contactsRaw: Array<Partial<Contact> & { proximaLlamada?: string }> = []

  if (contactsRes.ok) {
    contactsRaw = (await contactsRes.json()) as Array<
      Partial<Contact> & { proximaLlamada?: string }
    >
    if (contactsRaw.length === 0) {
      const legacyRes = await fetch(`${API_URL}/followUpCalls`)
      if (!legacyRes.ok) throw new Error("Error al cargar contactos")
      contactsRaw = (await legacyRes.json()) as Array<
        Partial<Contact> & { proximaLlamada?: string }
      >
    }
  } else {
    const legacyRes = await fetch(`${API_URL}/followUpCalls`)
    if (!legacyRes.ok) throw new Error("Error al cargar contactos")
    contactsRaw = (await legacyRes.json()) as Array<
      Partial<Contact> & { proximaLlamada?: string }
    >
  }

  const byId = new Map(patients.map((p) => [p.id, p]))

  return contactsRaw
    .flatMap((item) => {
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
    .map((contact) => {
      const patient = byId.get(contact.pacienteId)
      return {
        ...contact,
        patientName: patient?.q9_nombrePaciente ?? "Paciente desconocido",
        patientDni: patient?.q10_dni ?? "—",
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
      const res = await fetch(`${API_URL}/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) return res.json() as Promise<Contact>

      const isSyntheticScheduled = id.startsWith("scheduled-")
      const legacyId = isSyntheticScheduled ? id.replace(/^scheduled-/, "") : id
      if (isSyntheticScheduled) {
        const legacyPatchRes = await fetch(`${API_URL}/followUpCalls/${legacyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proximaLlamada: "",
            notas: "Contacto agendado marcado como inconcluso desde agenda.",
          }),
        })
        if (!legacyPatchRes.ok) throw new Error("Error al actualizar contacto")
        return {
          id,
          pacienteId: "",
          agenteId: "",
          origen: "seguimiento",
          tipo: "saliente",
          estado: "inconcluso",
          fecha: "",
          motivos: [],
          notas: "",
          camposActualizados: [],
          ...data,
        } as Contact
      }

      const legacyRes = await fetch(`${API_URL}/followUpCalls/${legacyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!legacyRes.ok) throw new Error("Error al actualizar contacto")
      return legacyRes.json() as Promise<Contact>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callcenterContacts"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}

export type { ContactWithPatient }
