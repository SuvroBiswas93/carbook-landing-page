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
    <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#090d16] py-20 text-[#fff8ef] sm:py-28">
      {/* Background Radial Ambient Lights */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-[400px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-[450px] rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-amber-400 backdrop-blur-md">
            LuxeDrive
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            যোগাযোগ করুন
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-300 sm:text-xl">
            গাড়ি বুকিং বা যেকোনো তথ্যের জন্য আমাদের সঙ্গে সরাসরি যোগাযোগ করুন।
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Phone Card */}
          <a
            href={`tel:${config.company.phone}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/40 hover:bg-white/[0.08] hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)]"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-transform duration-300 group-hover:scale-110">
              <Phone size={22} />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">ফোনে কথা বলুন</p>
            <p className="mt-1 break-words text-lg font-bold text-white">{config.company.phone}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300">
              ট্যাপ করে কল করুন <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>

          {/* WhatsApp Card */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:bg-white/[0.08] hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)]"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
              <PhoneCall size={22} />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">WhatsApp</p>
            <p className="mt-1 text-lg font-bold text-white">চ্যাট করে বুক করুন</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              ট্যাপ করে চ্যাট করুন <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>

          {/* Address Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
            <span className="flex size-12 items-center justify-center rounded-xl bg-slate-800 text-amber-400 border border-white/10 shadow-lg">
              <MapPin size={22} />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">ঠিকানা</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-white">{config.company.address}</p>
          </div>

          {/* Timing Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
            <span className="flex size-12 items-center justify-center rounded-xl bg-slate-800 text-amber-400 border border-white/10 shadow-lg">
              <Clock3 size={22} />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">সময়</p>
            <p className="mt-1 text-2xl font-extrabold text-white">২৪/৭</p>
            <p className="mt-0.5 text-xs text-gray-400">সবসময় বুকিং সাপোর্ট</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="#hero"
            onClick={scrollToBookingForm}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 font-bold text-slate-950 shadow-[0_10px_35px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-1 hover:from-amber-300 hover:to-amber-400 hover:shadow-[0_15px_40px_rgba(245,158,11,0.4)]"
          >
            উপরে ফর্ম পূরণ করুন <ArrowUpRight size={20} />
          </a>
          <p className="mt-3.5 text-sm text-gray-400">
            ফর্ম পূরণ করলেই হবে, <span className="text-amber-400 font-medium">অগ্রিম পেমেন্ট লাগবে না</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}