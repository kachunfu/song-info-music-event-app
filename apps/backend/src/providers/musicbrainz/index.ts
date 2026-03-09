import type { SongSearchResponseItem } from '@app/shared'

const MB_BASE = 'https://musicbrainz.org/ws/2'
const HEADERS = { 'User-Agent': 'MusicApp/1.0 (contact@musicapp.com)', Accept: 'application/json' }

const LATIN_RE = /^[\u0000-\u024F\u1E00-\u1EFF\u2000-\u206F\u2100-\u214F\s]+$/

function isLatinScript(text: string): boolean {
  return LATIN_RE.test(text)
}

export interface MBSearchResult {
  items: SongSearchResponseItem[]
  total: number
}

export async function searchMusicBrainz(
  query: string,
  offset = 0,
  limit = 25,
): Promise<MBSearchResult> {
  const url = new URL(`${MB_BASE}/recording`)
  url.searchParams.set('query', query)
  // Over-fetch to compensate for non-Latin filtering
  url.searchParams.set('limit', String(limit * 3))
  url.searchParams.set('offset', String(offset * 3))
  url.searchParams.set('fmt', 'json')

  const res = await fetch(url.toString(), { headers: HEADERS })
  if (!res.ok) return { items: [], total: 0 }

  const data = await res.json() as {
    count: number
    recordings: Array<{
      id: string
      title: string
      'artist-credit': Array<{ name: string }>
      releases?: Array<{ title: string; date?: string }>
    }>
  }

  const items = (data.recordings ?? [])
    .filter((r) => isLatinScript(r.title) && isLatinScript(r['artist-credit']?.[0]?.name ?? ''))
    .slice(0, limit)
    .map((r) => ({
      musicbrainzId: r.id,
      title: r.title,
      artistName: r['artist-credit']?.[0]?.name ?? 'Unknown',
      albumName: r.releases?.[0]?.title,
      releaseYear: r.releases?.[0]?.date ? Number(r.releases[0].date.slice(0, 4)) : undefined,
    }))

  // Approximate total (Latin results are ~1/3 of all results)
  const total = Math.floor(data.count / 3)

  return { items, total }
}

export async function getMusicBrainzRecording(id: string): Promise<SongSearchResponseItem> {
  const url = `${MB_BASE}/recording/${id}?inc=artist-credits+releases&fmt=json`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`MusicBrainz error: ${res.status}`)

  const r = await res.json() as {
    id: string
    title: string
    'artist-credit': Array<{ name: string }>
    releases?: Array<{ title: string; date?: string }>
  }

  return {
    musicbrainzId: r.id,
    title: r.title,
    artistName: r['artist-credit']?.[0]?.name ?? 'Unknown',
    albumName: r.releases?.[0]?.title,
    releaseYear: r.releases?.[0]?.date ? Number(r.releases[0].date.slice(0, 4)) : undefined,
  }
}
