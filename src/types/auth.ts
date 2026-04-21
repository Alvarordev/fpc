export type UserRole = "admin" | "callcenter" | "voluntario" | "fundacion";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  volunteerProfileId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
