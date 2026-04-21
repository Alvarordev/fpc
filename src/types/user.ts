export interface AppUser {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "callcenter" | "voluntario" | "fundacion"
  is_active: boolean
  created_at: string
  fpc_volunteers?: {
    id: string
    nombre: string
    apellido: string
    estado: string
  } | null
  fpc_callcenter_members?: {
    id: string
    nombre: string
    apellido: string
  } | null
}

export interface CreateUserPayload {
  email: string
  password: string
  role: "callcenter" | "voluntario"
  nombre: string
  apellido: string
  telefono?: string
}
