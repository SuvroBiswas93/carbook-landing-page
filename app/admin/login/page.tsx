'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { setAccessToken } from '@/lib/apiClient'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Email and password are required.')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'same-origin',
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
        accessToken?: string
      } | null
      if (!response.ok) {
        toast.error(data?.error ?? 'Login failed.')
        return
      }
      if (!data?.accessToken) {
        toast.error('Server response was incomplete.')
        return
      }
      setAccessToken(data.accessToken)
      toast.success('Signed in.')
      router.replace('/admin')
    } catch {
      toast.error('Network error. Could not reach the server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-6 shadow-sm sm:p-8"
      >
        <Link
          href="/"
          className="font-serif text-xl font-bold text-[#282622]"
        >
          Traveling <span className="text-[#a8865f]">Bangladesh</span>
        </Link>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.22em] text-[#a49b8f]">
          Admin Control Center
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-[#8c8378]">
          Enter your administrator credentials to manage the fleet.
        </p>

        <label className="mt-6 flex flex-col gap-1.5">
          <span className="text-sm font-bold text-[#292724]">Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="rounded-xl border border-[#e7e0d5] px-4 py-3"
          />
        </label>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-sm font-bold text-[#292724]">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-xl border border-[#e7e0d5] px-4 py-3"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-[#292724] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3a382f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}