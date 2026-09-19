'use client'

import { useState } from 'react'
import { CarFront, Menu, PhoneCall, X } from 'lucide-react'

const links = [
  { label: 'Fleet', href: '#cars' },
  { label: 'Fare', href: '#fare-calculator' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    setIsMobileMenuOpen(false)

    if (href === '#top') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }

    const target = document.querySelector(href)

    if (!target) {
      return
    }

    const navbarOffset = 88
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarOffset

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#191714]/90 text-[#fff8ef] shadow-[0_14px_40px_rgba(25,23,20,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          onClick={(event) => handleNavClick(event, '#top')}
          className="flex min-w-0 items-center gap-2 rounded-2xl border border-[#d6b88c]/25 bg-[#d6b88c]/10 px-2 py-1.5 transition hover:border-[#d6b88c]/50 hover:bg-[#d6b88c]/15 sm:gap-3 sm:rounded-full sm:border-white/10 sm:bg-white/6 sm:px-3 sm:py-2 sm:hover:bg-white/9"
          aria-label="LuxeDrive home"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#d6b88c] text-[#191714] shadow-[0_0_18px_rgba(214,184,140,0.3)] sm:size-9 sm:rounded-full sm:shadow-[0_0_24px_rgba(214,184,140,0.35)]">
            <CarFront aria-hidden="true" className="size-4 sm:size-5" />
          </span>
          <span className="font-serif text-base font-bold leading-none tracking-tight sm:text-xl sm:tracking-normal">
            Luxe<span className="text-[#d6b88c]">Drive</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#d8d0c6] transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="tel:+1555014782"
          className="call-attention group relative inline-flex h-11 w-auto min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-[#f3d29f]/50 bg-[#f3c16f] px-2 text-[10px] font-black text-[#191714] shadow-[0_12px_34px_rgba(243,193,111,0.35)] transition hover:-translate-y-0.5 hover:bg-[#ffd38a] hover:shadow-[0_16px_42px_rgba(243,193,111,0.48)] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
          aria-label="Call LuxeDrive at +1 (555) 014-782"
        >
          <span className="call-ring flex size-7 shrink-0 items-center justify-center rounded-full bg-[#191714] text-[#f8f1e7] sm:size-8">
            <PhoneCall aria-hidden="true" className="size-4" />
          </span>
          <span className="hidden text-xs uppercase tracking-[0.12em] sm:inline">Book by call</span>
          <span className="whitespace-nowrap font-mono text-[10px] tracking-0 sm:text-sm">+1 (555) 014-782</span>
        </a>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[#fff8ef] transition hover:bg-white/10 md:hidden"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav className="border-t border-white/10 bg-[#191714] px-3 py-3 shadow-2xl md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#d8d0c6] transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
