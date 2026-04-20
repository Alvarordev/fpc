export interface PsicoSession {
  id: string
  pacienteId: string
  voluntarioId: number
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
