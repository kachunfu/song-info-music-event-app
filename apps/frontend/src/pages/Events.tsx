import { useState } from 'react'
import { useEvents } from '@/lib/hooks'

export default function EventsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error } = useEvents(page)

  if (isLoading) return <p className="text-muted-foreground">Loading events...</p>
  if (error) return <p className="text-red-500">{error.message}</p>

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Music Events</h1>

      {data && data.items.length === 0 && (
        <p className="text-muted-foreground">No upcoming events found.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {data.total.toLocaleString()} events — Page {data.page} of {totalPages}
            {isFetching && ' (loading...)'}
          </p>

          <div className="space-y-4">
            {data.items.map((event) => (
              <div
                key={event.id}
                className="flex gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="h-24 w-36 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-36 items-center justify-center rounded-md bg-muted text-2xl text-muted-foreground">
                    ♫
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="font-semibold">{event.name}</h2>
                  <p className="text-sm text-muted-foreground">{event.artist}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-HK', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">{event.venue}</p>
                </div>

                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-center rounded-md border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Tickets
                  </a>
                )}
              </div>
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

              <span className="px-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>

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
