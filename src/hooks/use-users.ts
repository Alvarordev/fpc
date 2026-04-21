"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AppUser, CreateUserPayload } from "@/types/user"

async function fetchUsers(): Promise<AppUser[]> {
  const res = await fetch("/api/users")
  if (!res.ok) throw new Error("Error al cargar usuarios")
  const json = await res.json()
  return (json.users ?? []) as AppUser[]
}

async function createUser(payload: CreateUserPayload): Promise<AppUser> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? "Error al crear usuario")
  }
  return res.json()
}

export function useUsers() {
  return useQuery({
    queryKey: ["appUsers"],
    queryFn: fetchUsers,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appUsers"] })
    },
  })
}
