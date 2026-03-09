import { Outlet } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
