'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LogOut, Menu, RefreshCw, X } from 'lucide-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import type { ReactNode } from 'react'
import { navItems } from './nav-items'
import { useAdminData } from './useAdminData'

function getActiveLabel(pathname: string) {
  return navItems.find((item) => pathname === item.href)?.label ?? 'Overview'
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f4ef] text-[#282622]">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#292724]/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <section className="lg:ml-64">
        <Header onMenuOpen={() => setMobileOpen(true)} />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </section>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </main>
  )
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#e7e0d5] bg-[#fffdf9] transition-transform lg:translate-x-0 ${
        open ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold">
            Traveling <span className="text-[#a8865f]">Bangladesh</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <p className="mt-10 text-[10px] font-bold uppercase tracking-[.22em] text-[#a49b8f]">
          Management
        </p>

        <nav className="mt-4 grid gap-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#292724] text-[#fffdf9]'
                    : 'text-[#766e64] hover:bg-[#f0ebe3]'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <Link
        href="/"
        className="absolute bottom-6 left-6 flex items-center gap-3 text-sm font-semibold text-[#766e64] transition-colors hover:text-[#282622]"
      >
        <LogOut size={18} />
        Back to website
      </Link>
    </aside>
  )
}

function Header({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname()
  const activeLabel = getActiveLabel(pathname)
  const { refresh, loading } = useAdminData()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#e7e0d5] bg-[#fffdf9] px-4 sm:h-20 sm:px-8">
      <button
        className="shrink-0 lg:hidden"
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <Menu />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#a49b8f]">Admin Control Center</p>
        <h1 className="mt-0.5 truncate font-serif text-lg font-bold sm:text-2xl">
          {activeLabel}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh data"
          title="Refresh data"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#766e64] transition-colors hover:bg-[#f0ebe3] hover:text-[#282622] disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-[#292724] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#3a382f] sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Home size={16} />
          <span className="hidden sm:inline">View site</span>
        </Link>
      </div>
    </header>
  )
}