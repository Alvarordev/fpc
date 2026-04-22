"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Patient, PatientStatus } from "./patient-data"
import { statusLabels } from "./patient-data"

const statusStyles: Record<PatientStatus, string> = {
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactivo: "bg-zinc-100 text-zinc-600 border-zinc-200",
  prospecto: "bg-violet-50 text-violet-700 border-violet-200",
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
    accessorKey: "q9_nombrePaciente",
    header: "Paciente",
    cell: ({ row }) => {
      const p = row.original
      const initials = p.q9_nombrePaciente
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-none">
              {p.q9_nombrePaciente}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">DNI {p.q10_dni}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "q27_categoria",
    header: "Categoría",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "q17_telefono",
    header: "Teléfono",
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
    accessorKey: "fechaCreacion",
    header: "Registrado",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{shortDate(getValue() as string)}</span>
    ),
  },
]
