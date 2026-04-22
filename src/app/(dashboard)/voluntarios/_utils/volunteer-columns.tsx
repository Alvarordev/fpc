"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Volunteer, AvailabilitySlot } from "@/types/volunteer"
import { getVolunteerColor } from "@/lib/calendar-helpers"
import { volunteerStatusLabels } from "./volunteer-data"

const statusStyles: Record<Volunteer["estado"], string> = {
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactivo: "bg-zinc-100 text-zinc-600 border-zinc-200",
  licencia: "bg-amber-50 text-amber-700 border-amber-200",
}

export function getVolunteerColumns(slots: AvailabilitySlot[]): ColumnDef<Volunteer>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Voluntario",
      cell: ({ row }) => {
        const v = row.original
        const color = getVolunteerColor(v.id)
        return (
          <div className="flex items-center gap-3">
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold", color.bg)}>
              {v.nombre[0]}{v.apellido[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground leading-none">
                {v.nombre} {v.apellido}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{v.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "especialidad",
      header: "Especialidad",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const estado = getValue() as Volunteer["estado"]
        return (
          <Badge className={cn("border font-medium", statusStyles[estado])}>
            {volunteerStatusLabels[estado]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      id: "slotsDisponibles",
      header: "Slots disponibles",
      cell: ({ row }) => {
        const count = slots.filter(
          (s) => String(s.voluntarioId) === String(row.original.id) && s.estado === "disponible"
        ).length
        return <span className="text-sm font-medium text-foreground">{count}</span>
      },
    },
  ]
}
