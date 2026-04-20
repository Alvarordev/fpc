export type ContactOrigin = "enrolamiento" | "seguimiento"
export type ContactDirection = "saliente" | "entrante"
export type ContactStatus = "agendado" | "completado" | "inconcluso"

export interface Contact {
  id: string
  pacienteId: string
  agenteId: string
  origen: ContactOrigin
  tipo: ContactDirection
  estado: ContactStatus
  fecha: string
  horaInicio?: string
  horaFin?: string
  motivos: string[]
  notas: string
  camposActualizados: string[]
  motivoInconcluso?: string
}

export type TimelineEventType = "contacto" | "psico" | "alerta"

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
