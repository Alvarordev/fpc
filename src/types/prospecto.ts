export type ProspectoStatus = "nuevo" | "contactado" | "calificado" | "descartado"

export interface Prospecto {
  id: string
  nombre: string
  dni: string
  celular: string
  correo: string
  diagnostico: string
  esPaciente: boolean
  fecha: string
  hora: string
  estado: ProspectoStatus
  fechaCreacion: string
}

export interface CreateProspectoInput {
  nombre: string
  dni: string
  celular: string
  correo: string
  diagnostico: string
  esPaciente: boolean
  fecha: string
  hora: string
}

export const prospectoStatusLabels: Record<ProspectoStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  descartado: "Descartado",
}
