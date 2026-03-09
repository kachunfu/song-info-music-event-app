import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router'
import { Layout } from '@/components/Layout'
import LoginPage from '@/pages/Login'
import SearchPage from '@/pages/Search'
import SongDetailPage from '@/pages/SongDetail'
import FavoritesPage from '@/pages/Favorites'
import EventsPage from '@/pages/Events'
import { useAuthStore } from '@/store/auth.store'

const rootRoute = createRootRoute({
  component: Layout,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
})

const songDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/songs/$id',
  component: SongDetailPage,
})

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated()
    if (!isAuthenticated) throw redirect({ to: '/login' })
  },
  component: FavoritesPage,
})

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/search' }) },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  searchRoute,
  songDetailRoute,
  favoritesRoute,
  eventsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
