export type UserRole = "admin" | "callcenter" | "voluntario" | "fundacion";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  volunteerProfileId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
