import type { AvailabilitySlot } from "@/types/volunteer"

const VOLUNTEER_COLORS = [
  { bg: "bg-violet-500", light: "bg-violet-100 text-violet-700 border-violet-200" },
  { bg: "bg-sky-500",    light: "bg-sky-100 text-sky-700 border-sky-200" },
  { bg: "bg-emerald-500", light: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { bg: "bg-amber-500",  light: "bg-amber-100 text-amber-700 border-amber-200" },
  { bg: "bg-rose-500",   light: "bg-rose-100 text-rose-700 border-rose-200" },
  { bg: "bg-indigo-500", light: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { bg: "bg-teal-500",   light: "bg-teal-100 text-teal-700 border-teal-200" },
  { bg: "bg-orange-500", light: "bg-orange-100 text-orange-700 border-orange-200" },
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getVolunteerColor(voluntarioId: string) {
  if (!voluntarioId) return VOLUNTEER_COLORS[0]
  return VOLUNTEER_COLORS[hashString(voluntarioId) % VOLUNTEER_COLORS.length]
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startPad = (firstDay.getDay() + 6) % 7
  const endPad = (7 - ((lastDay.getDay() + 1) % 7)) % 7

  const days: Date[] = []

  for (let i = startPad; i > 0; i--) {
    days.push(new Date(year, month, 1 - i))
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  for (let i = 1; i <= endPad; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

export function groupSlotsByDay(
  slots: AvailabilitySlot[],
  year: number,
  month: number
): Map<string, AvailabilitySlot[]> {
  const map = new Map<string, AvailabilitySlot[]>()
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`

  for (const slot of slots) {
    if (!slot.fecha.startsWith(prefix)) continue
    const existing = map.get(slot.fecha) ?? []
    existing.push(slot)
    map.set(slot.fecha, existing)
  }

  for (const [key, arr] of map) {
    map.set(key, arr.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)))
  }

  return map
}

export function formatTimeRange(inicio: string, fin: string): string {
  return `${inicio}–${fin}`
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  })
}

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
