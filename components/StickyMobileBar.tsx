'use client'

import { MessageCircle, PhoneCall } from 'lucide-react'
import config from '@/data/config.json'

export function StickyMobileBar() {
  const whatsappNumber = config.company.phone.replace(/\D/g, '')
  const whatsappMessage = encodeURIComponent(
    'Assalamu alaikum, I want to rent a car. Please share the available options and pricing.'
  )

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t border-white/20 shadow-[0_-8px_24px_rgba(11,37,69,.18)] sm:hidden">
      <a href={`tel:${config.company.phone}`} className="flex min-h-13 items-center justify-center gap-2 bg-brand-navy px-3 text-sm font-bold text-white">
        <PhoneCall size={18} /> কল করুন
      </a>
      <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="flex min-h-13 items-center justify-center gap-2 bg-brand-whatsapp px-3 text-sm font-bold text-white">
        <MessageCircle size={18} /> WhatsApp
      </a>
    </div>
  )
}
