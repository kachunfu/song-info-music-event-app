import { eq } from 'drizzle-orm'
import { db, users } from '@app/database'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
const { hash, compare } = bcrypt
import type { RegisterRequest, LoginRequest, LoginResponse } from '@app/shared'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret'

export async function register(input: RegisterRequest): Promise<LoginResponse> {
  const existingEmail = await db.select().from(users).where(eq(users.email, input.email))
  if (existingEmail.length > 0) {
    throw new Error('Email already in use')
  }

  const existingUsername = await db.select().from(users).where(eq(users.username, input.username))
  if (existingUsername.length > 0) {
    throw new Error('Username already taken')
  }

  const hashedPassword = await hash(input.password, 10)
  const [user] = await db.insert(users).values({
    email: input.email,
    username: input.username,
    password: hashedPassword,
  }).returning({ id: users.id, email: users.email, username: users.username })

  const token = await sign({ sub: String(user.id), email: user.email, username: user.username }, JWT_SECRET)
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

  const token = await sign({ sub: String(user.id), email: user.email, username: user.username }, JWT_SECRET)
  return { token, user: { id: user.id, email: user.email, username: user.username } }
}
