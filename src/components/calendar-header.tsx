import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMonthYear } from "@/lib/calendar-helpers"

interface CalendarHeaderProps {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  disablePrev?: boolean
}

export function CalendarHeader({ year, month, onPrev, onNext, disablePrev }: CalendarHeaderProps) {
  const label = formatMonthYear(year, month)

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onPrev} disabled={disablePrev}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-sm font-semibold text-foreground capitalize min-w-36 text-center">
        {label}
      </span>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onNext}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
