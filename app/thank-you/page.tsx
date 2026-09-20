'use client'

import { CheckCircle2, PhoneCall } from 'lucide-react'
import config from '@/data/config.json'

export default function ThankYouPage() {
  const whatsappNumber = config.company.phone.replace(/\D/g, '')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f1ed] px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-[#eae5dd] bg-[#fffdfb] p-7 text-center shadow-[0_20px_60px_rgba(50,44,35,.12)] sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Traveling Bangladesh Rent A Car</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-stone-900 sm:text-4xl">বুকিং রিকোয়েস্ট পেয়েছি</h1>
        <p className="mt-4 leading-relaxed text-stone-600">ধন্যবাদ। আমাদের টিম ১০ মিনিটের মধ্যে আপনার নম্বরে কল করে বুকিং নিশ্চিত করবে।</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a href={`tel:${config.company.phone}`} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white transition hover:bg-amber-700">
            <PhoneCall size={18} /> ফোন করুন
          </a>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700">
            WhatsApp করুন
          </a>
        </div>
        <a href="/" className="mt-6 inline-block text-sm font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900">হোমপেজে ফিরে যান</a>
      </section>
    </main>
  )
}