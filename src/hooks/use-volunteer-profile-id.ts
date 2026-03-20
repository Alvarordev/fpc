"use client"

import { useQuery } from "@tanstack/react-query"
import { API_URL } from "@/lib/auth"
import { useAuthStore } from "@/store/auth-store"
import type { User } from "@/types/auth"

/**
 * Returns the volunteer's profile ID.
 * If the stored user is missing `volunteerProfileId` (stale auth cookie),
 * silently re-fetches the user record and updates the auth store.
 */
export function useVolunteerProfileId(): string | undefined {
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)

  const needsRefresh = user?.role === "voluntario" && !user.volunteerProfileId

  const { data: freshUser } = useQuery({
    queryKey: ["currentUser", user?.id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users/${user!.id}`)
      if (!res.ok) throw new Error("Error al refrescar usuario")
      const data = await res.json()
      const { password: _, ...u } = data
      login(u as User)
      return u as User
    },
    enabled: needsRefresh,
    staleTime: Infinity,
  })

  return user?.volunteerProfileId ?? freshUser?.volunteerProfileId
}
