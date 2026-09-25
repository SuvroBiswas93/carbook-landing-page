'use client'

import { ArrowUpRight } from 'lucide-react'
import { handleBookingLinkClick } from '@/lib/scroll'

export function FinalCTA() {
  const scrollToHero = (event: React.MouseEvent<HTMLAnchorElement>) => {
    handleBookingLinkClick(event)
  }

  return (
    <section className="bg-brand-navy px-4 py-14 text-center text-white sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            যেভাবে কাজ করে
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-300 sm:text-xl">
            ফর্ম পূরণ করুন, অগ্রিম পেমেন্ট ছাড়াই ১০ মিনিটে কল ব্যাক পান।
          </p>
        <a href="#booking" onClick={scrollToHero} className="mt-7 inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-amber px-7 py-3 font-bold text-brand-navy transition hover:bg-brand-amber-hover">
          বুকিং কনফার্ম করুন <ArrowUpRight size={19} />
        </a>
      </div>
    </section>
  )
}
