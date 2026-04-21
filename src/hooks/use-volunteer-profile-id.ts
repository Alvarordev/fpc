"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/auth-store"
import type { User } from "@/types/auth"

/**
 * Returns the volunteer's profile ID.
 * If the stored user is missing `volunteerProfileId` (stale auth cookie),
 * silently re-fetches the user record and updates the auth store.
 */
export function useVolunteerProfileId(): string | undefined {
  const user = useAuthStore((s) => s.user)

  const needsRefresh = user?.role === "voluntario" && !user.volunteerProfileId && Boolean(user?.id)

  const { data: freshUser } = useQuery({
    queryKey: ["currentUser", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fpc_volunteers")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle()

      if (error) throw new Error("Error al refrescar perfil de voluntario")

      return {
        ...user,
        volunteerProfileId: data?.id,
      } as User
    },
    enabled: needsRefresh,
    staleTime: Infinity,
  })

  return user?.volunteerProfileId ?? freshUser?.volunteerProfileId
}
