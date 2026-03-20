"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VolunteersToolbar } from "./volunteers-toolbar"
import { AvailabilityCalendar } from "./availability-calendar"
import { CalendarHeader } from "@/components/calendar-header"
import { CalendarLegend } from "./calendar-legend"
import { VolunteersTable } from "./volunteers-table"
import { getVolunteerColumns } from "../_utils/volunteer-columns"
import type { Volunteer, AvailabilitySlot } from "@/types/volunteer"
import { API_URL } from "@/lib/auth"

type VolunteerStatus = Volunteer["estado"]

const NOW = new Date()

async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await fetch(`${API_URL}/volunteers`)
  if (!res.ok) throw new Error("Error al cargar voluntarios")
  return res.json()
}

async function fetchSlots(): Promise<AvailabilitySlot[]> {
  const res = await fetch(`${API_URL}/availabilitySlots`)
  if (!res.ok) throw new Error("Error al cargar disponibilidad")
  return res.json()
}

export function VolunteersContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<VolunteerStatus | null>(null)
  const [year, setYear] = useState(NOW.getFullYear())
  const [month, setMonth] = useState(NOW.getMonth())

  const { data: volunteers = [] } = useQuery({
    queryKey: ["volunteers"],
    queryFn: fetchVolunteers,
  })

  const { data: slots = [] } = useQuery({
    queryKey: ["availabilitySlots"],
    queryFn: fetchSlots,
  })

  const filtered = volunteers.filter((v) => {
    const fullName = `${v.nombre} ${v.apellido}`.toLowerCase()
    const matchesSearch =
      !search ||
      fullName.includes(search.toLowerCase()) ||
      v.especialidad.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || v.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const highlightedIds = search || statusFilter ? filtered.map((v) => String(v.id)) : []

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Voluntarios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {volunteers.length} voluntarios registrados
        </p>
      </div>

      <VolunteersToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <Tabs defaultValue="calendario">
        <TabsList className="mb-4">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="voluntarios">Voluntarios</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-4">
          <div className="flex items-center justify-between">
            <CalendarHeader year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />
            <CalendarLegend volunteers={volunteers} />
          </div>
          <AvailabilityCalendar
            year={year}
            month={month}
            slots={slots}
            volunteers={filtered}
            highlightedIds={highlightedIds}
          />
        </TabsContent>

        <TabsContent value="voluntarios">
          <VolunteersTable data={filtered} columns={getVolunteerColumns(slots)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
