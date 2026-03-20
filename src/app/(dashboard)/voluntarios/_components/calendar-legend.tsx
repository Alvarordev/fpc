import { cn } from "@/lib/utils"
import type { Volunteer } from "@/types/volunteer"
import { getVolunteerColor } from "@/lib/calendar-helpers"

interface CalendarLegendProps {
  volunteers: Volunteer[]
}

export function CalendarLegend({ volunteers }: CalendarLegendProps) {
  const active = volunteers.filter((v) => v.estado !== "inactivo")

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {active.map((v) => {
        const color = getVolunteerColor(v.id)
        return (
          <div key={v.id} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-full shrink-0", color.bg)} />
            <span className="text-xs text-muted-foreground">
              {v.nombre} {v.apellido[0]}.
            </span>
          </div>
        )
      })}

      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary/80 shrink-0" />
          <span className="text-xs text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary/40 shrink-0" />
          <span className="text-xs text-muted-foreground">Asignado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-muted-foreground/30 shrink-0" />
          <span className="text-xs text-muted-foreground">Completado</span>
        </div>
      </div>
    </div>
  )
}
