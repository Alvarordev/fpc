import type { Volunteer } from "@/types/volunteer"

export const volunteerStatusLabels: Record<Volunteer["estado"], string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  licencia: "Licencia",
}
