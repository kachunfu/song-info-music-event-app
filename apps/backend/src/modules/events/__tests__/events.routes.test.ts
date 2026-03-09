import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('../events.service.js', () => ({
  getEvents: vi.fn(),
}))

import { eventsController } from '../events.controller.js'
import { getEvents } from '../events.service.js'

const app = new Hono()
app.route('/api/events', eventsController)

describe('Events Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/events', () => {
    it('returns paginated events', async () => {
      const mockResult = {
        items: [
          { id: 'e1', name: 'Concert', artist: 'Artist', date: '2026-04-01T20:00:00Z', venue: 'Venue' },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      }
      vi.mocked(getEvents).mockResolvedValue(mockResult)

      const res = await app.request('/api/events')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.items).toHaveLength(1)
      expect(body.total).toBe(1)
      expect(body.page).toBe(1)
      expect(getEvents).toHaveBeenCalledWith(1)
    })

    it('passes page param to service', async () => {
      vi.mocked(getEvents).mockResolvedValue({
        items: [], total: 0, page: 3, pageSize: 10,
      })

      await app.request('/api/events?page=3')

      expect(getEvents).toHaveBeenCalledWith(3)
    })

    it('clamps negative page to 1', async () => {
      vi.mocked(getEvents).mockResolvedValue({
        items: [], total: 0, page: 1, pageSize: 10,
      })

      await app.request('/api/events?page=-2')

      expect(getEvents).toHaveBeenCalledWith(1)
    })

    it('defaults missing page to 1', async () => {
      vi.mocked(getEvents).mockResolvedValue({
        items: [], total: 0, page: 1, pageSize: 10,
      })

      await app.request('/api/events')

      expect(getEvents).toHaveBeenCalledWith(1)
    })

    it('returns 500 when service throws', async () => {
      vi.mocked(getEvents).mockRejectedValue(new Error('API down'))

      const res = await app.request('/api/events')

      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe('API down')
    })
  })
})
