import { Hono } from 'hono'
import { getEvents } from './events.service.js'

export const eventsController = new Hono()

eventsController.get('/', async (c) => {
  try {
    const page = Math.max(1, Number(c.req.query('page')) || 1)
    const events = await getEvents(page)
    return c.json(events)
  } catch (err) {
    console.error('Events error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to fetch events' }, 500)
  }
})
