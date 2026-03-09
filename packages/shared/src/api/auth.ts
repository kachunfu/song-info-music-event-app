import type { User } from '../domain/user.js'

/** POST /api/auth/login request body */
export interface LoginRequest {
  email: string
  password: string
}

/** POST /api/auth/register request body */
export interface RegisterRequest {
  email: string
  password: string
}

/** POST /api/auth/login and /api/auth/register response */
export interface LoginResponse {
  token: string
  user: User
}

/** POST /api/auth/register response */
export type RegisterResponse = LoginResponse
