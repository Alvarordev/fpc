import { formatTimeRange } from "@/lib/calendar-helpers"

interface SlotPreview {
  fecha: string
  horaInicio: string
  horaFin: string
}

interface SlotPreviewListProps {
  slots: SlotPreview[]
}

export function SlotPreviewList({ slots }: SlotPreviewListProps) {
  if (slots.length === 0) {
    return <p className="text-xs text-muted-foreground">No hay fechas futuras para este rango.</p>
  }

  return (
    <div className="space-y-1.5">
      {slots.map((s) => {
        const fecha = new Date(s.fecha + "T00:00:00").toLocaleDateString("es-PE", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        return (
          <div
            key={s.fecha}
            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-xs"
          >
            <span className="capitalize text-foreground">{fecha}</span>
            <span className="text-muted-foreground">{formatTimeRange(s.horaInicio, s.horaFin)}</span>
          </div>
        )
      })}
    </div>
  )
}
