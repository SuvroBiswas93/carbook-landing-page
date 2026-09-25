'use client'

export const BOOKING_FORM_IDS = ['booking', 'booking-form', 'hero'] as const

function getBookingElement(): HTMLElement | null {
  for (const id of BOOKING_FORM_IDS) {
    const el = document.getElementById(id)
    if (el) return el
  }
  return null
}

function getNavbarOffset(): number {
  const header = document.querySelector('header')
  if (header) {
    // header is fixed, use its height + small gap
    return header.getBoundingClientRect().height + 12
  }
  return 88
}

export function scrollToBookingForm(event?: React.MouseEvent | MouseEvent | Event) {
  if (event) event.preventDefault()
  const el = getBookingElement()
  if (!el) return
  const offset = getNavbarOffset()
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
  // Keep URL in sync without triggering native jump
  if (typeof history !== 'undefined' && history.pushState) {
    const url = new URL(window.location.href)
    if (url.hash !== '#booking' && url.hash !== '#hero') {
      history.pushState(null, '', '#booking')
    }
  }
}

// Convenience handler for <a href="#booking"> or #hero links
export function handleBookingLinkClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  beforeScroll?: () => void,
) {
  event.preventDefault()
  beforeScroll?.()
  scrollToBookingForm()
}
