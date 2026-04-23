"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export interface CreateProspectoApiInput {
  nombre: string
  dni?: string
  celular: string
  correo?: string
  diagnostico?: string
  esPaciente?: boolean
  fecha: string
  hora: string
  canal?: string
  notas?: string
  agenteId?: string
}

export interface CreateProspectoApiResponse {
  patientId: string
  contactId: string
  nombre: string
  dni?: string
  celular: string
  correo?: string
  diagnostico?: string
  esPaciente?: boolean
  fecha: string
  hora: string
  canal: string
  estado: string
  fechaCreacion: string
}

async function createProspectoApi(input: CreateProspectoApiInput): Promise<CreateProspectoApiResponse> {
  const res = await fetch("/api/prospectos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error desconocido" }))
    throw new Error(err.error || `Error ${res.status}`)
  }

  return res.json()
}

export function useCreateProspectoApi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProspectoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["callcenterContacts"] })
    },
  })
}
