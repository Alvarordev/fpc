'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { usePatient, useUpdatePatient } from '../_hooks/use-patient'
import { PatientProfileTab } from './patient-profile-tab'
import { PsicoTab } from './psico-tab'
import { SeguimientoTab } from './seguimiento-tab'
import { normalizeProfileValues, statusLabels } from '@/types/patient'
import type { PatientStatus } from '@/types/patient'
import { useAuthStore } from '@/store/auth-store'

const statusStyles: Record<PatientStatus, string> = {
  activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactivo: 'bg-zinc-100 text-zinc-600 border-zinc-200',
}

interface PatientDetailContentProps {
  id: string
}

export function PatientDetailContent({ id }: PatientDetailContentProps) {
  const router = useRouter()
  const { data: patient, isLoading, isError } = usePatient(id)
  const updatePatient = useUpdatePatient(id)
  const user = useAuthStore((s) => s.user)
  const readOnly = user?.role === 'voluntario'

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => router.push('/pacientes')}
        >
          <ArrowLeft className="size-3.5" />
          Volver a pacientes
        </Button>
        <p className="text-muted-foreground text-sm">Paciente no encontrado.</p>
      </div>
    )
  }

  const initials = patient.q9_nombrePaciente
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')

  async function handleSave(values: Record<string, string>) {
    await updatePatient.mutateAsync(normalizeProfileValues(values))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => router.push('/pacientes')}
        >
          <ArrowLeft className="size-3.5" />
          Pacientes
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-foreground text-xl font-semibold tracking-tight">
              {patient.q9_nombrePaciente}
            </h1>
            <Badge
              className={cn(
                'border text-xs font-medium',
                statusStyles[patient.estado],
              )}
            >
              {statusLabels[patient.estado]}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-4 text-sm">
            <span>DNI {patient.q10_dni}</span>
            {patient.nroPaciente && <span>{patient.nroPaciente}</span>}
            {patient.q27_categoria && <span>{patient.q27_categoria}</span>}
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(patient.fechaCreacion).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList className="mb-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
          <TabsTrigger value="psicooncologia">Psicooncología</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <PatientProfileTab
            patient={patient}
            onSave={handleSave}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="seguimiento">
          <SeguimientoTab
            pacienteId={id}
            fechaCreacion={patient.fechaCreacion}
          />
        </TabsContent>

        <TabsContent value="psicooncologia">
          <PsicoTab pacienteId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
