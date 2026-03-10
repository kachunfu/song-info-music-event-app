import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret'

export type AuthVariables = {
  userId: number
  email: string
  username: string
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verify(token, JWT_SECRET, 'HS256').catch(() => null)

  if (!payload || typeof payload.sub !== 'string') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('userId', Number(payload.sub))
  c.set('email', payload.email as string)
  c.set('username', payload.username as string)
  await next()
})
