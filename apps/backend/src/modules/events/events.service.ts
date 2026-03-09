import type { MusicEvent, PaginatedResponse } from '@app/shared'

const PAGE_SIZE = 10

export async function getEvents(page = 1): Promise<PaginatedResponse<MusicEvent>> {
  return fetchTicketmasterEvents(page)
}

async function fetchTicketmasterEvents(page: number): Promise<PaginatedResponse<MusicEvent>> {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) return { items: [], total: 0, page, pageSize: PAGE_SIZE }

  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('classificationName', 'music')
  url.searchParams.set('size', String(PAGE_SIZE))
  url.searchParams.set('page', String(page - 1))
  url.searchParams.set('sort', 'date,asc')

  const res = await fetch(url.toString())
  if (!res.ok) return { items: [], total: 0, page, pageSize: PAGE_SIZE }

  const data = await res.json() as {
    _embedded?: {
      events: Array<{
        id: string
        name: string
        dates: { start: { dateTime: string } }
        _embedded?: {
          venues?: Array<{ name: string }>
          attractions?: Array<{ name: string }>
        }
        url: string
        images?: Array<{ url: string; ratio: string }>
      }>
    }
    page: { totalElements: number }
  }

  const items: MusicEvent[] = (data._embedded?.events ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    artist: e._embedded?.attractions?.[0]?.name ?? 'Unknown',
    date: e.dates.start.dateTime,
    venue: e._embedded?.venues?.[0]?.name ?? 'Unknown',
    ticketUrl: e.url,
    imageUrl: e.images?.find((i) => i.ratio === '16_9')?.url,
  }))

  return { items, total: data.page.totalElements, page, pageSize: PAGE_SIZE }
}
