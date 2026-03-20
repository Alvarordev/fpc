export interface FollowUpCall {
  id: string
  pacienteId: string
  agenteId: string
  fecha: string
  horaInicio: string
  horaFin: string
  tipo: "saliente" | "entrante"
  motivos: string[]
  notas: string
  camposActualizados: string[]
  proximaLlamada?: string
}

export interface PsicoSession {
  id: string
  pacienteId: string
  voluntarioId: string
  availabilitySlotId?: string
  sesionNumero: number
  fecha: string
  horaInicio: string
  horaFin: string
  modalidad: "llamada" | "videollamada"
  estado: "programada" | "completada" | "cancelada" | "no_contesto"
  notas: string
  satisfaccion?: number
  extraNeeded?: boolean
}

export type TimelineEventType = "inscripcion" | "llamada" | "psico" | "alerta"

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  fecha: string
  title: string
  description: string
  meta?: Record<string, unknown>
}

export const MOTIVOS_CONFIG: Record<string, { label: string; sectionTitle: string }> = {
  afiliacion_sis: { label: "Afiliación SIS", sectionTitle: "Seguro y Afiliación" },
  consulta_medica: { label: "Consulta médica", sectionTitle: "Diagnóstico" },
  tratamiento: { label: "Tratamiento", sectionTitle: "Tratamiento" },
  diagnostico: { label: "Diagnóstico", sectionTitle: "Diagnóstico" },
  evolucion: { label: "Evolución", sectionTitle: "Evolución" },
  situacion_social: { label: "Situación social", sectionTitle: "Situación Social" },
  servicios: { label: "Servicios y derivaciones", sectionTitle: "Servicios y Derivaciones" },
  otro: { label: "Otro", sectionTitle: "" },
}
