import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Phone,
  BarChart3,
  CalendarDays,
  Clock,
  UserCheck,
  TriangleAlert,
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
        { title: "Inscripción", url: "/inscripcion", icon: ClipboardList, highlight: true },
      ],
    },
    {
      label: "Seguimiento",
      items: [
        { title: "Llamadas", url: "/llamadas", icon: Phone },
        { title: "Alertas", url: "/alertas", icon: TriangleAlert },
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
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        { title: "Mi Agenda", url: "/agenda", icon: CalendarDays },
      ],
    },
    {
      label: "Pacientes",
      items: [
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
  "/alertas": "Alertas y Hospitales",
}
