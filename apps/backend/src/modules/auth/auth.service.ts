import { eq } from 'drizzle-orm'
import { db, users } from '@app/database'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
const { hash, compare } = bcrypt
import type { RegisterRequest, LoginRequest, LoginResponse } from '@app/shared'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret'

export async function register(input: RegisterRequest): Promise<LoginResponse> {
  const existing = await db.select().from(users).where(eq(users.email, input.email))
  if (existing.length > 0) {
    throw new Error('Email already in use')
  }

  const hashedPassword = await hash(input.password, 10)
  const [user] = await db.insert(users).values({
    email: input.email,
    password: hashedPassword,
  }).returning({ id: users.id, email: users.email })

  const token = await sign({ sub: String(user.id), email: user.email }, JWT_SECRET)
  return { token, user }
}

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const [user] = await db.select().from(users).where(eq(users.email, input.email))
  if (!user) {
    throw new Error('Invalid credentials')
  }

  const valid = await compare(input.password, user.password)
  if (!valid) {
    throw new Error('Invalid credentials')
  }

  const token = await sign({ sub: String(user.id), email: user.email }, JWT_SECRET)
  return { token, user: { id: user.id, email: user.email } }
}
