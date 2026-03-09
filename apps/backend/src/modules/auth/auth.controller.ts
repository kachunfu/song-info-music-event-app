import { Hono } from 'hono'
import { z } from 'zod'
import type { LoginRequest, RegisterRequest } from '@app/shared'
import { register, login } from './auth.service.js'

export const authController = new Hono()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
}) satisfies z.ZodType<RegisterRequest>

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}) satisfies z.ZodType<LoginRequest>

authController.post('/register', async (c) => {
  const parsed = registerSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const result = await register(parsed.data)
  return c.json(result, 201)
})

authController.post('/login', async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const result = await login(parsed.data)
  return c.json(result)
})
