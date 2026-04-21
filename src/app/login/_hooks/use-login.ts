import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import type { LoginCredentials, User } from "@/types/auth";

async function loginRequest(credentials: LoginCredentials): Promise<User> {
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (signInError || !authData.user) {
    throw new Error("Credenciales inválidas")
  }

  const { data: profile, error: profileError } = await supabase
    .from("fpc_users")
    .select("id, email, full_name, role")
    .eq("id", authData.user.id)
    .single()

  if (profileError || !profile) {
    throw new Error("No se encontró perfil de usuario")
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name ?? authData.user.email ?? "Usuario",
    role: profile.role,
  } as User
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (user) => login(user),
  });
}
