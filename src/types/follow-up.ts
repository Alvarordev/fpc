export interface FollowUpCall {
  id: string
  pacienteId: string
  agenteId: string
  fecha: string
  horaInicio: string
  horaFin: string
  motivos: string[]
  notas: string
  camposActualizados: string[]
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
