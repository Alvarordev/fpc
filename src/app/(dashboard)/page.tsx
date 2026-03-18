"use client"

import { useAuthStore } from "@/store/auth-store"
import { DashboardContent } from "./_components/dashboard-content"

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? "callcenter"

  return <DashboardContent role={role} />
}
