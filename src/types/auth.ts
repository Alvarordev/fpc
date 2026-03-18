export type UserRole = "admin" | "callcenter" | "voluntario" | "fundacion";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
