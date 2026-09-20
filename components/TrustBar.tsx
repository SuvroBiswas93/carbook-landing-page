'use client'

import { BadgeCheck, Banknote, PhoneCall, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const trustItems = [
  { icon: BadgeCheck, text: 'ভেরিফাইড ড্রাইভার' },
  { icon: Banknote, text: 'ফিক্সড প্রাইস, হিডেন চার্জ নেই' },
  { icon: PhoneCall, text: '২৪/৭ সাপোর্ট' },
  { icon: Trophy, text: '৫০০+ সফল ট্রিপ' },
]

export function TrustBar() {
  return (
    <section aria-label="বিশ্বাসের কারণ" className="relative z-10 border-y border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, text }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5 hover:bg-slate-50"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 ring-1 ring-amber-500/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-amber-100/50 sm:size-14">
                <Icon size={24} aria-hidden="true" className="sm:size-7" />
              </span>
              <span className="text-base font-bold text-slate-800 leading-snug tracking-tight sm:text-lg sm:leading-snug">
                {text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}