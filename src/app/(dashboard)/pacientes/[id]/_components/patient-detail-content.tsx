"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { usePatient, useUpdatePatient } from "../_hooks/use-patient"
import { PatientProfileTab } from "./patient-profile-tab"
import { PsicoTab } from "./psico-tab"
import { SeguimientoTab } from "./seguimiento-tab"
import { statusLabels } from "@/types/patient"
import type { PatientStatus } from "@/types/patient"

const statusStyles: Record<PatientStatus, string> = {
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactivo: "bg-zinc-100 text-zinc-600 border-zinc-200",
}

interface PatientDetailContentProps {
  id: string
}

export function PatientDetailContent({ id }: PatientDetailContentProps) {
  const router = useRouter()
  const { data: patient, isLoading, isError } = usePatient(id)
  const updatePatient = useUpdatePatient(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => router.push("/pacientes")}>
          <ArrowLeft className="size-3.5" />
          Volver a pacientes
        </Button>
        <p className="text-sm text-muted-foreground">Paciente no encontrado.</p>
      </div>
    )
  }

  const initials = patient.q9_nombrePaciente
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")

  async function handleSave(values: Record<string, string>) {
    await updatePatient.mutateAsync(values)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => router.push("/pacientes")}>
          <ArrowLeft className="size-3.5" />
          Pacientes
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {patient.q9_nombrePaciente}
            </h1>
            <Badge className={cn("border font-medium text-xs", statusStyles[patient.estado])}>
              {statusLabels[patient.estado]}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span>DNI {patient.q10_dni}</span>
            {patient.nroPaciente && <span>{patient.nroPaciente}</span>}
            {patient.q27_categoria && <span>{patient.q27_categoria}</span>}
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(patient.fechaCreacion).toLocaleDateString("es-PE", {
                day: "numeric",
                month: "short",
                year: "numeric",
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
          <PatientProfileTab patient={patient} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="seguimiento">
          <SeguimientoTab pacienteId={id} fechaCreacion={patient.fechaCreacion} />
        </TabsContent>

        <TabsContent value="psicooncologia">
          <PsicoTab pacienteId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
