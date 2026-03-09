import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// Mock the auth service before importing the controller
vi.mock('../auth.service.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
}))

import { authController } from '../auth.controller.js'
import { register, login } from '../auth.service.js'

const app = new Hono()
app.route('/api/auth', authController)

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Registration ---

  describe('POST /api/auth/register', () => {
    it('returns 201 on successful registration', async () => {
      const mockResponse = { token: 'jwt-token', user: { id: 1, email: 'test@example.com' } }
      vi.mocked(register).mockResolvedValue(mockResponse)

      const res = await app.request(jsonRequest('/api/auth/register', {
        email: 'test@example.com',
        password: 'password123',
      }))

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.token).toBe('jwt-token')
      expect(body.user.email).toBe('test@example.com')
      expect(register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns 400 for invalid email', async () => {
      const res = await app.request(jsonRequest('/api/auth/register', {
        email: 'not-an-email',
        password: 'password123',
      }))

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
      expect(register).not.toHaveBeenCalled()
    })

    it('returns 400 for short password', async () => {
      const res = await app.request(jsonRequest('/api/auth/register', {
        email: 'test@example.com',
        password: '123',
      }))

      expect(res.status).toBe(400)
      expect(register).not.toHaveBeenCalled()
    })

    it('returns 400 for missing fields', async () => {
      const res = await app.request(jsonRequest('/api/auth/register', {}))

      expect(res.status).toBe(400)
      expect(register).not.toHaveBeenCalled()
    })
  })

  // --- Login ---

  describe('POST /api/auth/login', () => {
    it('returns 200 with token on successful login', async () => {
      const mockResponse = { token: 'jwt-token', user: { id: 1, email: 'test@example.com' } }
      vi.mocked(login).mockResolvedValue(mockResponse)

      const res = await app.request(jsonRequest('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      }))

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.token).toBe('jwt-token')
      expect(body.user.email).toBe('test@example.com')
    })

    it('returns 400 for invalid email format', async () => {
      const res = await app.request(jsonRequest('/api/auth/login', {
        email: 'bad-email',
        password: 'password123',
      }))

      expect(res.status).toBe(400)
      expect(login).not.toHaveBeenCalled()
    })

    it('returns 400 for empty password', async () => {
      const res = await app.request(jsonRequest('/api/auth/login', {
        email: 'test@example.com',
        password: '',
      }))

      expect(res.status).toBe(400)
      expect(login).not.toHaveBeenCalled()
    })
  })
})
