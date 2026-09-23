'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, PhoneCall } from 'lucide-react'
import config from '@/data/config.json'

export function Footer() {
  const whatsappNumber = config.company.phone.replace(/\D/g, '')
  const facebookLink = config.company.socialLinks.facebook === '#' ? 'https://facebook.com' : config.company.socialLinks.facebook

  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="#hero" className="flex items-center gap-3 text-left">
            <Image
              src="/logo.jpg"
              alt="Traveling Bangladesh logo"
              width={52}
              height={52}
              className="size-12 shrink-0 rounded-xl object-cover "
            />
            <span>
              <span className="block max-w-xs font-serif text-xl font-bold leading-tight sm:text-2xl"><span className="text-[#FFB020]">Traveling</span><span className="text-[#25D366]">Bangladesh</span></span>
              <span className="mt-1 block text-md text-white/65">চালকসহ গাড়ি ভাড়া, ঢাকা ও সারাদেশে</span>
            </span>
          </Link>
          <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-3 sm:gap-6">
            <a href={`tel:${config.company.phone}`} className="inline-flex items-center gap-2 hover:text-white"><PhoneCall size={16} /> {config.company.phone}</a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white" aria-label="WhatsApp us"><svg viewBox="0 0 24 24" className="size-4 fill-current text-brand-whatsapp" aria-hidden="true"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.09 0C5.47 0 .08 5.38.08 12.02c0 2.12.55 4.2 1.6 6.02L0 24l6.18-1.62a12.04 12.04 0 0 0 5.89 1.82h.01c6.62 0 12-5.39 12-12.01 0-3.2-1.24-6.2-3.48-8.51ZM12.09 21.9c-1.9 0-3.76-.5-5.38-1.46l-.39-.23-3.67.96.98-3.57-.25-.38A9.89 9.89 0 0 1 2.12 12c0-5.48 4.48-9.96 9.97-9.96 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.92 7.04c0 5.49-4.48 9.97-9.97 9.97Zm5.46-7.44c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.18.2-.35.22-.65.08-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.52-1.8-1.7-2.1-.18-.3-.02-.47.13-.62.13-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.63-.92-2.24-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.53.08-.8.38-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.2 5.06 4.48.71.3 1.26.48 1.69.62.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35Z" /></svg> WhatsApp</a>
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
