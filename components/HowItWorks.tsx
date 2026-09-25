'use client'

import { PhoneCall, Send, CarFront } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  { icon: Send, number: '০১', title: 'ফর্ম পূরণ করুন', text: 'আপনার যাত্রার তথ্য ও যোগাযোগের নম্বর দিন।' },
  { icon: PhoneCall, number: '০২', title: 'আমরা ১০ মিনিটে কল করবো', text: 'আমাদের টিম ফোনে সব বিস্তারিত নিশ্চিত করবে।' },
  { icon: CarFront, number: '০৩', title: 'গাড়ি পৌঁছে যাবে', text: 'নির্ধারিত সময়ে ড্রাইভারসহ গাড়ি আপনার কাছে পৌঁছে যাবে।' },
]

export function HowItWorks() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            যেভাবে কাজ করে
          </h2>
          <p className="text-base sm:text-xl text-stone-600">
            সহজ তিন ধাপে আপনার গাড়ি বুক করুন
          </p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, number, title, text }, index) => (
            <motion.div key={number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-brand-navy"><Icon size={28} /></div>
              <span className="mt-4 block text-xs font-bold tracking-[0.16em] text-brand-muted">ধাপ {number}</span>
              <h3 className="mt-2 text-lg font-bold text-brand-navy">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-brand-muted">{text}</p>
              {index < steps.length - 1 && <span className="absolute left-[calc(50%+4rem)] right-[calc(-50%+4rem)] top-8 hidden border-t border-dashed border-slate-300 md:block" aria-hidden="true" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
