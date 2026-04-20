import {
  LayoutDashboard,
  Users,
  Phone,
  BarChart3,
  CalendarDays,
  Clock,
  UserCheck,
  TriangleAlert,
  Building2,
} from "lucide-react"
import type { NavGroup } from "@/types/navigation"
import type { UserRole } from "@/types/auth"

export const navConfig: Record<UserRole, NavGroup[]> = {
  callcenter: [
    {
      label: "Gestión",
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        { title: "Pacientes", url: "/pacientes", icon: Users },
      ],
    },
    {
      label: "Seguimiento",
      items: [
        { title: "Llamadas", url: "/llamadas", icon: Phone },
        { title: "Alertas", url: "/alertas", icon: TriangleAlert },
        { title: "Hospitales", url: "/hospitales", icon: Building2 },
      ],
    },
    {
      label: "Análisis",
      items: [
        { title: "Mis Métricas", url: "/metricas", icon: BarChart3 },
      ],
    },
  ],
  voluntario: [
    {
      label: "Gestión",
      items: [
        { title: "Mi Agenda", url: "/agenda", icon: CalendarDays },
        { title: "Mis Pacientes", url: "/pacientes", icon: Users },
        { title: "Disponibilidad", url: "/disponibilidad", icon: Clock },
      ],
    },
  ],
  fundacion: [
    {
      label: "Gestión",
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        { title: "Pacientes", url: "/pacientes", icon: Users },
        { title: "Voluntarios", url: "/voluntarios", icon: UserCheck },
      ],
    },
    {
      label: "Operaciones",
      items: [
        { title: "Alertas", url: "/alertas", icon: TriangleAlert },
        { title: "Hospitales", url: "/hospitales", icon: Building2 },
      ],
    },
  ],
  admin: [
    {
      label: "Gestión",
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        { title: "Pacientes", url: "/pacientes", icon: Users },
        { title: "Voluntarios", url: "/voluntarios", icon: UserCheck },
      ],
    },
    {
      label: "Operaciones",
      items: [
        { title: "Alertas", url: "/alertas", icon: TriangleAlert },
        { title: "Hospitales", url: "/hospitales", icon: Building2 },
      ],
    },
  ],
}

export const pathTitles: Record<string, string> = {
  "/": "Dashboard",
  "/pacientes": "Pacientes",
  "/inscripcion": "Inscripción",
  "/llamadas": "Llamadas y Seguimiento",
  "/metricas": "Mis Métricas",
  "/agenda": "Mi Agenda",
  "/disponibilidad": "Disponibilidad",
  "/voluntarios": "Voluntarios",
  "/alertas": "Alertas",
  "/hospitales": "Hospitales",
}
