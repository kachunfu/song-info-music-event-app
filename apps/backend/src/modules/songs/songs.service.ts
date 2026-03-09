import { searchSpotify, getSpotifyTrackById, getAudioFeatures } from '../../providers/spotify/index.js'
import type { SearchFilter } from '../../providers/spotify/index.js'
import { getLyrics } from '../../providers/lrclib/index.js'
import { getArtistInfo } from '../../providers/lastfm/index.js'
import { translateText } from '../../providers/translation/index.js'
import type { SongSearchResponseItem, SongDetailResponse, PaginatedResponse } from '@app/shared'

const PAGE_SIZE = 10

export async function searchSongs(
  query: string,
  page = 1,
  filter: SearchFilter = 'all',
): Promise<PaginatedResponse<SongSearchResponseItem>> {
  const offset = (page - 1) * PAGE_SIZE

  const result = await searchSpotify(query, filter, offset, PAGE_SIZE)

  return { items: result.items, total: result.total, page, pageSize: PAGE_SIZE }
}

export async function getSongDetail(spotifyId: string): Promise<SongDetailResponse> {
  const base = await getSpotifyTrackById(spotifyId)

  const [lyricsResult, artistResult, audioResult] = await Promise.allSettled([
    getLyrics(base.title, base.artistName),
    getArtistInfo(base.artistName),
    getAudioFeatures(spotifyId),
  ])

  const audio = audioResult.status === 'fulfilled' ? audioResult.value : undefined

  return {
    song: base,
    lyrics: lyricsResult.status === 'fulfilled' ? lyricsResult.value : undefined,
    artistBio: artistResult.status === 'fulfilled' ? artistResult.value.bio : undefined,
    genres: artistResult.status === 'fulfilled' ? artistResult.value.genres : undefined,
    similarArtists: artistResult.status === 'fulfilled' ? artistResult.value.similarArtists : undefined,
    musicalKey: audio?.key,
    tempo: audio?.tempo,
    energy: audio?.energy,
    danceability: audio?.danceability,
    valence: audio?.valence,
    acousticness: audio?.acousticness,
  }
}

export async function translateLyrics(
  lyrics: string,
  targetLang: string,
): Promise<{ translatedText: string }> {
  const result = await translateText(lyrics, targetLang)
  return { translatedText: result.translatedText }
}
