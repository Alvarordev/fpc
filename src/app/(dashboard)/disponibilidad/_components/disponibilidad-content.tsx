"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarHeader } from "@/components/calendar-header"
import { useVolunteerProfileId } from "@/hooks/use-volunteer-profile-id"
import { useMySlots, useDeleteSlot } from "../_hooks/use-availability"
import { DisponibilidadCalendar } from "./disponibilidad-calendar"
import { AddAvailabilitySheet } from "./add-availability-sheet"
import type { AvailabilitySlot } from "@/types/volunteer"

const NOW = new Date()
const CURRENT_YEAR = NOW.getFullYear()
const CURRENT_MONTH = NOW.getMonth()

export function DisponibilidadContent() {
  const voluntarioId = useVolunteerProfileId() ?? ""

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  const { data: slots = [] } = useMySlots(voluntarioId || undefined)
  const deleteSlot = useDeleteSlot(voluntarioId)

  const isCurrentMonth = year === CURRENT_YEAR && month === CURRENT_MONTH

  function prevMonth() {
    if (isCurrentMonth) return
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function handleDayClick(date: Date) {
    setSelectedDate(date.toISOString().slice(0, 10))
    setSheetOpen(true)
  }

  function handleAddClick() {
    setSelectedDate(undefined)
    setSheetOpen(true)
  }

  function handleSlotDelete(slot: AvailabilitySlot) {
    deleteSlot.mutate(slot)
  }

  const disponiblesCount = slots.filter((s) => s.estado === "disponible").length
  const asignadosCount = slots.filter((s) => s.estado === "asignado").length

  if (!voluntarioId) {
    return (
      <p className="text-sm text-muted-foreground">
        Tu cuenta no está vinculada a un perfil de voluntario.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Disponibilidad</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {disponiblesCount} disponible{disponiblesCount !== 1 ? "s" : ""}
            {asignadosCount > 0 && ` · ${asignadosCount} asignado${asignadosCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleAddClick}>
          <Plus className="size-4" />
          Agregar disponibilidad
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <CalendarHeader
          year={year}
          month={month}
          onPrev={prevMonth}
          onNext={nextMonth}
          disablePrev={isCurrentMonth}
        />
      </div>

      <DisponibilidadCalendar
        year={year}
        month={month}
        slots={slots}
        onDayClick={handleDayClick}
        onSlotDelete={handleSlotDelete}
      />

      <AddAvailabilitySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        voluntarioId={voluntarioId}
        defaultDate={selectedDate}
      />
    </div>
  )
}
