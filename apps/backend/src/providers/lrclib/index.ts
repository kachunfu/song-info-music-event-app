export async function getLyrics(title: string, artist: string): Promise<string | undefined> {
  const url = new URL('https://lrclib.net/api/get')
  url.searchParams.set('track_name', title)
  url.searchParams.set('artist_name', artist)

  const res = await fetch(url.toString())
  if (!res.ok) return undefined

  const data = await res.json() as { plainLyrics?: string; syncedLyrics?: string }
  return data.syncedLyrics ?? data.plainLyrics
}
