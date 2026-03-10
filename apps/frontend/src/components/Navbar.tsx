import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'

export function Navbar() {
  const { user, clearAuth, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/search" className="text-lg font-semibold text-primary">
          MusicApp
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/search"
            className="text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: 'text-foreground font-medium' }}
          >
            Search
          </Link>
          <Link
            to="/events"
            className="text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: 'text-foreground font-medium' }}
          >
            Events
          </Link>

          {isAuthenticated() ? (
            <>
              <Link
                to="/favorites"
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: 'text-foreground font-medium' }}
              >
                Favorites
              </Link>
              <Link
                to="/shared-songs"
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: 'text-foreground font-medium' }}
              >
                Shared
              </Link>
              <Link
                to="/friends"
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: 'text-foreground font-medium' }}
              >
                Friends
              </Link>
              <span className="text-muted-foreground text-xs">@{user?.username}</span>
              <button
                onClick={() => { clearAuth(); queryClient.clear(); navigate({ to: '/search' }) }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
