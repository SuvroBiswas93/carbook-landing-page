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
    <section aria-label="বিশ্বাসের কারণ" className="border-y border-slate-200 bg-white py-5 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4">
        {trustItems.map(({ icon: Icon, text }, index) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className={`group flex min-h-16 items-center gap-2 px-2 py-3 text-sm font-semibold text-brand-navy transition hover:bg-brand-surface sm:min-h-20 sm:justify-center sm:gap-3 sm:px-4 ${index > 0 ? 'border-l border-slate-200' : ''} ${index > 1 ? 'border-t sm:border-t-0' : ''}`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-navy sm:size-9">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="leading-5 sm:text-center">{text}</span>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  )
}
