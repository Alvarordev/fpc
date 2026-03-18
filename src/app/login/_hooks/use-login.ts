import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";
import type { LoginCredentials, User } from "@/types/auth";

async function loginRequest(credentials: LoginCredentials): Promise<User> {
  const params = new URLSearchParams({
    email: credentials.email,
    password: credentials.password,
  });
  const res = await fetch(`${API_URL}/users?${params}`);
  if (!res.ok) throw new Error("Credenciales inválidas");

  const users = await res.json();
  if (!users.length) throw new Error("Credenciales inválidas");

  const { password: _, ...user } = users[0];
  return user as User;
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (user) => login(user),
  });
}
