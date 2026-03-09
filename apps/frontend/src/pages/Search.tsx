import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useSearchSongs } from '@/lib/hooks'
import type { SearchFilter } from '@/lib/hooks'
import { SongCard } from '@/components/SongCard'

const FILTERS: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'title', label: 'Song Title' },
  { value: 'artist', label: 'Artist' },
  { value: 'album', label: 'Album' },
]

export default function SearchPage() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<SearchFilter>('all')
  const { data, isLoading, isFetching, error } = useSearchSongs(query, page, filter)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed) {
      setPage(1)
      setQuery(trimmed)
    }
  }

  const handleFilterChange = (f: SearchFilter) => {
    setFilter(f)
    if (query) setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Search Songs</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        {FILTERS.map((f) => (
          <label key={f.value} className="flex cursor-pointer items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="filter"
              value={f.value}
              checked={filter === f.value}
              onChange={() => handleFilterChange(f.value)}
              className="accent-primary"
            />
            {f.label}
          </label>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            filter === 'title' ? 'Enter song title...'
            : filter === 'artist' ? 'Enter artist name...'
            : filter === 'album' ? 'Enter album name...'
            : 'Search by song title, artist, or album...'
          }
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {isLoading && <p className="text-muted-foreground">Searching...</p>}

      {error && <p className="text-red-500">{error.message}</p>}

      {data && data.items.length === 0 && query && (
        <p className="text-muted-foreground">No results found for "{query}"</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            About {data.total.toLocaleString()} results — Page {data.page} of {totalPages}
            {isFetching && ' (loading...)'}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((song) => (
              <Link
                key={song.spotifyId}
                to="/songs/$id"
                params={{ id: song.spotifyId! }}
                className="block"
              >
                <SongCard song={song} />
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      p === page
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}
