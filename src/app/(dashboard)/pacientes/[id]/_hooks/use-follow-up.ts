"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import type { FollowUpCall, PsicoSession, TimelineEvent } from "@/types/follow-up"
import type { HospitalAlert } from "@/types/hospital"

async function fetchFollowUpCalls(pacienteId: string): Promise<FollowUpCall[]> {
  const res = await fetch(`${API_URL}/followUpCalls?pacienteId=${pacienteId}`)
  if (!res.ok) throw new Error("Error al cargar llamadas")
  return res.json()
}

export function useFollowUpCalls(pacienteId: string) {
  return useQuery({
    queryKey: ["followUpCalls", pacienteId],
    queryFn: () => fetchFollowUpCalls(pacienteId),
  })
}

export function useCreateFollowUpCall(pacienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (call: FollowUpCall) => {
      const res = await fetch(`${API_URL}/followUpCalls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(call),
      })
      if (!res.ok) throw new Error("Error al registrar llamada")
      return res.json() as Promise<FollowUpCall>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followUpCalls", pacienteId] })
    },
  })
}

export function buildTimeline(
  calls: FollowUpCall[],
  psicoSessions: PsicoSession[],
  fechaCreacion: string,
  hospitalAlerts: HospitalAlert[] = []
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  events.push({
    id: "enrollment",
    type: "inscripcion",
    fecha: fechaCreacion,
    title: "Inscripción en el programa",
    description: "Paciente registrado en SEPA",
  })

  for (const call of calls) {
    events.push({
      id: call.id,
      type: "llamada",
      fecha: call.fecha,
      title: call.tipo === "entrante" ? "Llamada entrante del paciente" : "Llamada de seguimiento",
      description: call.notas,
      meta: {
        tipo: call.tipo,
        horaInicio: call.horaInicio,
        horaFin: call.horaFin,
        motivos: call.motivos,
        camposActualizados: call.camposActualizados,
        proximaLlamada: call.proximaLlamada,
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
