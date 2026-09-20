'use client'

import { MapPin, PhoneCall } from 'lucide-react'
import config from '@/data/config.json'

interface FooterProps {
  onNavigate: (section: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const whatsappNumber = config.company.phone.replace(/\D/g, '')
  const facebookLink = config.company.socialLinks.facebook === '#' ? 'https://facebook.com' : config.company.socialLinks.facebook

  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <button type="button" onClick={() => onNavigate('hero')} className="cursor-pointer text-left">
            <span className="font-serif text-2xl font-bold">Luxe<span className="text-brand-amber">Drive</span></span>
            <span className="mt-1 block text-sm text-white/65">চালকসহ গাড়ি ভাড়া, ঢাকা ও সারাদেশে</span>
          </button>
          <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-3 sm:gap-6">
            <a href={`tel:${config.company.phone}`} className="inline-flex items-center gap-2 hover:text-white"><PhoneCall size={16} /> {config.company.phone}</a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><span className="text-brand-whatsapp">●</span> WhatsApp</a>
            <span className="inline-flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> {config.company.address}</span>
          </div>
          <a href={facebookLink} target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white transition hover:bg-white/20">f</a>
        </div>
        <div className="border-t border-white/15 pt-5 text-sm text-white/60">
          © {new Date().getFullYear()} {config.company.name}. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  )
}
