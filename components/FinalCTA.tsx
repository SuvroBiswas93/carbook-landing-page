'use client'

import { ArrowUpRight } from 'lucide-react'

export function FinalCTA() {
  const scrollToHero = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-brand-navy px-4 py-14 text-center text-white sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold sm:text-3xl">আজই আপনার গাড়ি বুক করুন</h2>
        <p className="mt-3 text-base leading-7 text-white/75">ফর্ম পূরণ করুন, অগ্রিম পেমেন্ট ছাড়াই ১০ মিনিটে কল ব্যাক পান।</p>
        <a href="#hero" onClick={scrollToHero} className="mt-7 inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-amber px-7 py-3 font-bold text-brand-navy transition hover:bg-brand-amber-hover">
          বুকিং কনফার্ম করুন <ArrowUpRight size={19} />
        </a>
      </div>
    </section>
  )
}
