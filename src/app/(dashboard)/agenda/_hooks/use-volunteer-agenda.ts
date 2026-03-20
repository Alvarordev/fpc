'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/lib/auth'
import type { PsicoSession } from '@/types/follow-up'
import type { Patient } from '@/types/patient'

async function fetchVolunteerSessions(
  voluntarioId: string,
): Promise<PsicoSession[]> {
  const res = await fetch(
    `${API_URL}/psicoSessions?voluntarioId=${voluntarioId}`,
  )
  if (!res.ok) throw new Error('Error al cargar sesiones')
  return res.json()
}

async function fetchAllPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_URL}/patients`)
  if (!res.ok) throw new Error('Error al cargar pacientes')
  return res.json()
}

export function useVolunteerSessions(voluntarioId: string | undefined) {
  return useQuery({
    queryKey: ['volunteerSessions', voluntarioId],
    queryFn: () => fetchVolunteerSessions(voluntarioId!),
    enabled: Boolean(voluntarioId),
  })
}

export function useAllPatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchAllPatients,
  })
}

export function useUpdateAgendaSession(voluntarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      pacienteId: string
      data: Partial<PsicoSession>
    }) => {
      const res = await fetch(`${API_URL}/psicoSessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al actualizar sesión')
      return res.json() as Promise<PsicoSession>
    },
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['volunteerSessions', voluntarioId],
      })
      queryClient.invalidateQueries({
        queryKey: ['psicoSessions', variables.pacienteId],
      })
    },
  })
}
