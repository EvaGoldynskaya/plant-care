export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name?: string;
  confirmPassword?: string;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthApiResponse {
  message: string;
  user: User & {
    token: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}
