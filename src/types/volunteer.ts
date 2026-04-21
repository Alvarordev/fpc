export interface Volunteer {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  estado: "activo" | "inactivo" | "licencia"
  especialidad: string
}

export interface AvailabilitySlot {
  id: string
  voluntarioId: number
  fecha: string
  horaInicio: string
  horaFin: string
  estado: "disponible" | "asignado" | "completado"
}
