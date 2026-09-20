'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Clock3, MapPin, Phone, PhoneCall } from 'lucide-react'
import config from '@/data/config.json'

export function Contact() {
  const whatsappNumber = config.company.phone.replace(/\D/g, '')

  const scrollToBookingForm = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[#191714] py-16 text-[#fff8ef] sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(214,184,140,0.18),transparent_32%),radial-gradient(circle_at_88%_85%,rgba(243,193,111,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
            LuxeDrive
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            যোগাযোগ করুন
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#d8d0c6] sm:text-xl">
            গাড়ি বুকিং বা যেকোনো তথ্যের জন্য আমাদের সঙ্গে সরাসরি যোগাযোগ করুন।
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <a href={`tel:${config.company.phone}`} className="group rounded-2xl border border-white/10 bg-white/8 p-5 transition hover:-translate-y-1 hover:border-white/35 hover:bg-white/12">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-navy-soft text-white"><Phone size={21} /></span>
            <p className="mt-5 text-sm font-semibold text-[#d8d0c6]">ফোনে কথা বলুন</p>
            <p className="mt-2 break-words font-bold text-white">{config.company.phone}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white/80">ট্যাপ করে কল করুন <ArrowUpRight size={16} /></span>
          </a>

          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-white/8 p-5 transition hover:-translate-y-1 hover:border-[#63d391]/70 hover:bg-white/12">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#63d391] text-[#12301e]"><PhoneCall size={21} /></span>
            <p className="mt-5 text-sm font-semibold text-[#d8d0c6]">WhatsApp</p>
            <p className="mt-2 font-bold text-white">চ্যাট করে বুক করুন</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#7ee7a7]">ট্যাপ করে চ্যাট করুন <ArrowUpRight size={16} /></span>
          </a>

          <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-navy-soft text-white"><MapPin size={21} /></span>
            <p className="mt-5 text-sm font-semibold text-[#d8d0c6]">ঠিকানা</p>
            <p className="mt-2 font-bold leading-relaxed text-white">{config.company.address}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-navy-soft text-white"><Clock3 size={21} /></span>
            <p className="mt-5 text-sm font-semibold text-[#d8d0c6]">সময়</p>
            <p className="mt-2 text-2xl font-bold text-white">২৪/৭</p>
            <p className="mt-1 text-sm text-[#d8d0c6]">সবসময় বুকিং সাপোর্ট</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <a href="#hero" onClick={scrollToBookingForm} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-amber px-6 py-3.5 font-bold text-brand-navy shadow-[0_12px_30px_rgba(255,176,32,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-amber-hover">
            উপরে ফর্ম পূরণ করুন <ArrowUpRight size={19} />
          </a>
          <p className="mt-3 text-sm text-[#aaa098]">ফর্ম পূরণ করলেই হবে, অগ্রিম পেমেন্ট লাগবে না</p>
        </motion.div>
      </div>
    </section>
  )
}
