import { cn } from "@/lib/utils"
import type { AvailabilitySlot, Volunteer } from "@/types/volunteer"
import { formatTimeRange, getVolunteerColor } from "@/lib/calendar-helpers"

interface CalendarDayCellProps {
  date: Date
  currentMonth: number
  slots: AvailabilitySlot[]
  volunteers: Volunteer[]
  highlightedIds: string[]
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function isToday(date: Date): boolean {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime() === TODAY.getTime()
}

function slotOpacity(estado: AvailabilitySlot["estado"]): string {
  if (estado === "disponible") return ""
  if (estado === "asignado") return "opacity-50"
  return "opacity-25 saturate-0"
}

export function CalendarDayCell({
  date,
  currentMonth,
  slots,
  volunteers,
  highlightedIds,
}: CalendarDayCellProps) {
  const isCurrentMonth = date.getMonth() === currentMonth
  const today = isToday(date)

  return (
    <div
      className={cn(
        "min-h-24 border border-border/40 p-1.5 flex flex-col gap-0.5",
        !isCurrentMonth && "bg-muted/20",
        today && "ring-2 ring-inset ring-primary/50"
      )}
    >
      <span
        className={cn(
          "text-xs font-medium leading-none mb-1 self-start px-1 py-0.5 rounded",
          !isCurrentMonth && "text-muted-foreground/40",
          today && "bg-primary text-primary-foreground px-1.5"
        )}
      >
        {date.getDate()}
      </span>

      {slots.map((slot) => {
        const volunteer = volunteers.find((v) => String(v.id) === String(slot.voluntarioId))
        if (!volunteer) return null

        const isHighlighted = highlightedIds.length === 0 || highlightedIds.includes(String(slot.voluntarioId))
        const color = getVolunteerColor(slot.voluntarioId)
        const initials = `${volunteer.nombre[0]}${volunteer.apellido[0]}`

        return (
          <div
            key={slot.id}
            title={`${volunteer.nombre} ${volunteer.apellido} · ${formatTimeRange(slot.horaInicio, slot.horaFin)}`}
            className={cn(
              "flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight border truncate cursor-default transition-opacity",
              color.light,
              slotOpacity(slot.estado),
              !isHighlighted && "opacity-10"
            )}
          >
            <span className="font-semibold shrink-0">{initials}</span>
            <span className="truncate">{formatTimeRange(slot.horaInicio, slot.horaFin)}</span>
          </div>
        )
      })}
    </div>
  )
}
