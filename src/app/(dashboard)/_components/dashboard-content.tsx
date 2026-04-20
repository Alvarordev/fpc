"use client"

import type { UserRole } from "@/types/auth"
import { CallcenterDashboard } from "./callcenter-dashboard"
import { VolunteerDashboard } from "./volunteer-dashboard"
import { AdminDashboard } from "./admin-dashboard"

interface DashboardContentProps {
  role: UserRole
}

export function DashboardContent({ role }: DashboardContentProps) {
  if (role === "callcenter") return <CallcenterDashboard />
  if (role === "voluntario") return <VolunteerDashboard />
  return <AdminDashboard />
}
