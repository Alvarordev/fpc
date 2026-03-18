import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Phone,
  Calendar,
  BarChart3,
  CalendarDays,
  Clock,
  UserCheck,
  FileText,
  Settings2,
} from "lucide-react"
import type { NavItem } from "@/types/navigation"
import type { UserRole } from "@/types/auth"

export const navConfig: Record<UserRole, NavItem[]> = {
  callcenter: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Pacientes", url: "/pacientes", icon: Users },
    { title: "Inscripción", url: "/inscripcion", icon: ClipboardList, highlight: true },
    { title: "Llamadas", url: "/llamadas", icon: Phone },
    { title: "Citas", url: "/citas", icon: Calendar },
    { title: "Mis Métricas", url: "/metricas", icon: BarChart3 },
  ],
  voluntario: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Mi Agenda", url: "/agenda", icon: CalendarDays },
    { title: "Mis Pacientes", url: "/pacientes", icon: Users },
    { title: "Disponibilidad", url: "/disponibilidad", icon: Clock },
    { title: "Reportes", url: "/reportes", icon: FileText },
  ],
  fundacion: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Pacientes", url: "/pacientes", icon: Users },
    { title: "Voluntarios", url: "/voluntarios", icon: UserCheck },
    { title: "Citas", url: "/citas", icon: Calendar },
    { title: "Reportes", url: "/reportes", icon: FileText },
    { title: "Configuración", url: "/configuracion", icon: Settings2 },
  ],
  admin: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Pacientes", url: "/pacientes", icon: Users },
    { title: "Voluntarios", url: "/voluntarios", icon: UserCheck },
    { title: "Citas", url: "/citas", icon: Calendar },
    { title: "Reportes", url: "/reportes", icon: FileText },
    { title: "Configuración", url: "/configuracion", icon: Settings2 },
  ],
}

export const pathTitles: Record<string, string> = {
  "/": "Dashboard",
  "/pacientes": "Pacientes",
  "/inscripcion": "Inscripción",
  "/llamadas": "Llamadas y Seguimiento",
  "/citas": "Citas",
  "/metricas": "Mis Métricas",
  "/agenda": "Mi Agenda",
  "/disponibilidad": "Disponibilidad",
  "/voluntarios": "Voluntarios",
  "/reportes": "Reportes y Análisis",
  "/configuracion": "Configuración",
}
