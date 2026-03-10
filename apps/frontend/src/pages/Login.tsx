import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useLogin, useRegister } from '@/lib/hooks'
import { useAuthStore } from '@/store/auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const login = useLogin()
  const register = useRegister()

  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isRegister) {
      register.mutate(
        { email, username, password },
        {
          onSuccess: (data) => {
            setAuth(data.token, data.user)
            navigate({ to: '/search' })
          },
          onError: (err) => setError(err.message),
        },
      )
      return
    }

    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setAuth(data.token, data.user)
          navigate({ to: '/search' })
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  const isPending = login.isPending || register.isPending

  return (
    <div className="mx-auto max-w-sm pt-16">
      <h1 className="mb-6 text-2xl font-bold text-center">
        {isRegister ? 'Create Account' : 'Welcome Back'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
        </div>

        {isRegister && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="letters, numbers, underscores"
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Min 8 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Loading...' : isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => { setIsRegister(!isRegister); setError('') }}
          className="text-primary hover:underline"
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  )
}
