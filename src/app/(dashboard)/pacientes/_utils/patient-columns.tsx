"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Patient, PatientStatus } from "./patient-data"
import { statusLabels } from "./patient-data"

const statusStyles: Record<PatientStatus, string> = {
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  en_tratamiento: "bg-blue-50 text-blue-700 border-blue-200",
  seguimiento: "bg-amber-50 text-amber-700 border-amber-200",
  alta: "bg-zinc-100 text-zinc-600 border-zinc-200",
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  return new Date(isoDate).toLocaleDateString("es-PE", { day: "numeric", month: "short" })
}

function shortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export const patientColumns: ColumnDef<Patient>[] = [
  {
    accessorKey: "nombre",
    header: "Paciente",
    cell: ({ row }) => {
      const p = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {p.nombre[0]}{p.apellido[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-none">
              {p.nombre} {p.apellido}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{p.dni}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "diagnostico",
    header: "Diagnóstico",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as PatientStatus
      return (
        <Badge className={cn("border font-medium", statusStyles[status])}>
          {statusLabels[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "voluntarioAsignado",
    header: "Voluntario",
    cell: ({ getValue }) => {
      const v = getValue() as string | null
      return v
        ? <span className="text-sm text-foreground">{v}</span>
        : <span className="text-sm text-muted-foreground/60 italic">Sin asignar</span>
    },
  },
  {
    accessorKey: "ultimaVisita",
    header: "Última visita",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{relativeTime(getValue() as string)}</span>
    ),
  },
  {
    accessorKey: "fechaRegistro",
    header: "Registrado",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{shortDate(getValue() as string)}</span>
    ),
  },
]
