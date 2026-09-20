'use client'

import { useEffect, useState } from 'react'
import { CarFront, Menu, PhoneCall, X } from 'lucide-react'

const links = [
  { label: 'গাড়ি', href: '#cars' },
  { label: 'ভাড়া', href: '#fare-calculator' },
  { label: 'মতামত', href: '#reviews' },
  { label: 'সেবা', href: '#services' },
  { label: 'প্রশ্নোত্তর', href: '#faq' },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeHref, setActiveHref] = useState('#cars')

  useEffect(() => {
    const updateActiveLink = () => {
      const viewportCenter = window.innerHeight / 2
      let nextActiveHref = '#cars'
      let closestDistance = Number.POSITIVE_INFINITY

      links.forEach((link) => {
        const section = document.querySelector<HTMLElement>(link.href)

        if (!section) {
          return
        }

        const rect = section.getBoundingClientRect()
        const sectionCenter = rect.top + rect.height / 2
        const distance = Math.abs(sectionCenter - viewportCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          nextActiveHref = link.href
        }
      })

      setActiveHref(nextActiveHref)
    }

    updateActiveLink()
    window.addEventListener('scroll', updateActiveLink, { passive: true })
    window.addEventListener('resize', updateActiveLink)

    return () => {
      window.removeEventListener('scroll', updateActiveLink)
      window.removeEventListener('resize', updateActiveLink)
    }
  }, [])

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    setActiveHref(href)
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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-brand-navy/95 text-white shadow-[0_14px_40px_rgba(11,37,69,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 md:max-lg:gap-2 md:max-lg:px-4 lg:px-8">
        <a
          href="#top"
          onClick={(event) => handleNavClick(event, '#top')}
          className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-2 py-1.5 transition hover:border-white/30 hover:bg-white/15 sm:gap-3 sm:rounded-full sm:px-3 sm:py-2"
          aria-label="LuxeDrive home"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-amber text-brand-navy shadow-[0_0_18px_rgba(255,176,32,0.3)] sm:size-9 sm:rounded-full">
            <CarFront aria-hidden="true" className="size-4 sm:size-5" />
          </span>
          <span className="font-serif text-base font-bold leading-none tracking-tight sm:text-xl sm:tracking-normal md:max-lg:text-lg">
            Luxe<span className="text-brand-amber">Drive</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex md:max-lg:gap-0 md:max-lg:p-0.5">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeHref === link.href ? 'page' : undefined}
              onClick={(event) => handleNavClick(event, link.href)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition md:max-lg:px-2 md:max-lg:py-1.5 md:max-lg:text-xs ${
                activeHref === link.href
                  ? 'bg-[#16365C] text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="tel:+1555014782"
          className="call-attention group relative inline-flex h-11 w-auto min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-white/25 bg-brand-navy-soft px-2 text-[10px] font-black text-white shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-[#214a78] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm md:max-lg:px-2"
          aria-label="Call LuxeDrive at +1 (555) 014-782"
        >
          <span className="call-ring flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white sm:size-8">
            <PhoneCall aria-hidden="true" className="size-4" />
          </span>
          <span className="hidden text-xs uppercase tracking-[0.12em] sm:inline md:max-lg:hidden">Book by call</span>
          <span className="whitespace-nowrap font-mono text-[10px] tracking-0 sm:text-sm md:max-lg:hidden">+1 (555) 014-782</span>
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
        <nav className="border-t border-white/10 bg-brand-navy px-3 py-3 shadow-2xl md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={activeHref === link.href ? 'page' : undefined}
                onClick={(event) => handleNavClick(event, link.href)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeHref === link.href
                    ? 'bg-[#16365C] text-white'
                    : 'text-white/80 hover:text-white'
                }`}
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
