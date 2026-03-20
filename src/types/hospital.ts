export interface Hospital {
  id: string
  nombre: string
  ciudad: string
}

export interface HospitalAlert {
  id: string
  hospitalId: string
  pacienteId: string
  agenteId: string
  detalle: string
  fecha: string
  estado: "activa" | "resuelta"
  fechaResolucion?: string
}
