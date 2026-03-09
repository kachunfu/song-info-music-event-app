import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useSongDetail, useAddFavorite, useTranslateLyrics } from '@/lib/hooks'
import { useAuthStore } from '@/store/auth.store'

const LANGUAGES = [
  { code: 'zh-TW', label: 'Traditional Chinese' },
  { code: 'zh-CN', label: 'Simplified Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
] as const

export default function SongDetailPage() {
  const { id } = useParams({ from: '/songs/$id' })
  const { data, isLoading, error } = useSongDetail(id)
  const addFavorite = useAddFavorite()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [targetLang, setTargetLang] = useState('zh-TW')
  const [translatedLyrics, setTranslatedLyrics] = useState<string | null>(null)
  const translate = useTranslateLyrics()

  if (isLoading) return <p className="text-muted-foreground">Loading song details...</p>
  if (error) return <p className="text-red-500">{error.message}</p>
  if (!data) return null

  const { song, lyrics, artistBio, genres, similarArtists, musicalKey, tempo, energy, danceability, valence, acousticness } = data

  const handleTranslate = () => {
    if (!lyrics) return
    setTranslatedLyrics(null)
    translate.mutate(
      { lyrics, targetLang },
      { onSuccess: (result) => setTranslatedLyrics(result.translatedText) },
    )
  }

  const selectedLangLabel = LANGUAGES.find((l) => l.code === targetLang)?.label ?? targetLang

  return (
    <div className="max-w-3xl">
      <div className="flex gap-6 mb-8">
        {song.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt={song.title}
            className="h-48 w-48 rounded-lg object-cover shadow-md"
          />
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted text-4xl text-muted-foreground">
            ♪
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{song.title}</h1>
          <p className="text-lg text-muted-foreground">{song.artistName}</p>

          {song.albumName && (
            <p className="mt-1 text-sm text-muted-foreground">Album: {song.albumName}</p>
          )}
          {song.releaseYear && (
            <p className="text-sm text-muted-foreground">Year: {song.releaseYear}</p>
          )}
          {(musicalKey || tempo) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {musicalKey && (
                <p className="text-sm text-muted-foreground">Key: {musicalKey}</p>
              )}
              {tempo && (
                <p className="text-sm text-muted-foreground">BPM: {tempo}</p>
              )}
            </div>
          )}

          {(energy != null || danceability != null || valence != null || acousticness != null) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {energy != null && (
                <p className="text-sm text-muted-foreground">Energy: {Math.round(energy * 100)}%</p>
              )}
              {danceability != null && (
                <p className="text-sm text-muted-foreground">Danceability: {Math.round(danceability * 100)}%</p>
              )}
              {valence != null && (
                <p className="text-sm text-muted-foreground">Mood: {Math.round(valence * 100)}%</p>
              )}
              {acousticness != null && (
                <p className="text-sm text-muted-foreground">Acoustic: {Math.round(acousticness * 100)}%</p>
              )}
            </div>
          )}

          {genres && genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span key={g} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                  {g}
                </span>
              ))}
            </div>
          )}

          {isAuthenticated() && (
            <button
              onClick={() => addFavorite.mutate(song)}
              disabled={addFavorite.isPending}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {addFavorite.isPending ? 'Saving...' : addFavorite.isSuccess ? 'Saved!' : 'Add to Favorites'}
            </button>
          )}
        </div>
      </div>

      {artistBio && (
        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">About the Artist</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{artistBio}</p>
        </section>
      )}

      {similarArtists && similarArtists.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Similar Artists</h2>
          <div className="flex flex-wrap gap-2">
            {similarArtists.map((a) => (
              <span key={a} className="rounded-full border border-border px-3 py-1 text-sm">
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      {lyrics && (
        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Lyrics</h2>
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed">
            {lyrics}
          </pre>

          <div className="mt-4 flex items-center gap-2">
            <select
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value)
                setTranslatedLyrics(null)
              }}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={translate.isPending}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {translate.isPending ? 'Translating...' : 'Translate Lyrics'}
            </button>
          </div>

          {translate.isError && (
            <p className="mt-2 text-sm text-red-500">Translation failed. Please try again.</p>
          )}

          {translatedLyrics && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                Translation ({selectedLangLabel})
              </h3>
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed">
                {translatedLyrics}
              </pre>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
