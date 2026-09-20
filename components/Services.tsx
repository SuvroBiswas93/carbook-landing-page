'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  MapPin,
  BadgeCheck,
  Banknote,
  CreditCard,
  Zap,
} from 'lucide-react'
import { Modal } from './Modal'
import servicesData from '@/data/services.json'

const iconMap: Record<string, React.ReactNode> = {
  'verified-icon': <BadgeCheck size={32} />,
  'price-icon': <Banknote size={32} />,
  'phone-icon': <Phone size={32} />,
  'map-icon': <MapPin size={32} />,
  'no-payment-icon': <CreditCard size={32} />,
  'speed-icon': <Zap size={32} />,
}

export function Services() {
  const [selectedService, setSelectedService] = useState<(typeof servicesData)[0] | null>(null)

  return (
    <section id="services" className="py-14 bg-stone-50 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            কেন আমাদের বেছে নেবেন
          </h2>
          <p className="text-base sm:text-xl text-stone-600">
            নিরাপদ ও নিশ্চিন্ত যাত্রার জন্য আমাদের প্রতিশ্রুতি
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-3 lg:gap-6">
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="min-w-[86%] snap-start cursor-pointer rounded-xl bg-white p-4 shadow-lg transition-all sm:min-w-[58%] md:min-w-0 md:p-7"
              onClick={() => setSelectedService(service)}
            >
              <div className="mb-3 text-brand-navy sm:mb-4">
                {iconMap[service.icon as keyof typeof iconMap]}
              </div>
              <h3 className="text-base font-bold leading-6 text-stone-900 sm:text-xl">
                {service.title}
              </h3>
              <p className="mb-4 mt-2 text-sm leading-6 text-stone-600 sm:mb-6 sm:text-base">{service.description}</p>
              <button className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#FFB020] transition-colors hover:text-[#E08E00] sm:text-base">
                বিস্তারিত দেখুন →
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.title || ''}
      >
        {selectedService && (
          <div className="space-y-4">
            <p className="text-lg text-stone-700 leading-relaxed">
              {selectedService.fullDescription}
            </p>
            <div className="mt-8 pt-6 border-t border-stone-200 flex gap-4">
              <button
                onClick={() => setSelectedService(null)}
                className="flex-1 cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold py-3 rounded-lg transition-colors"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  setSelectedService(null)
                  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex-1 cursor-pointer bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 rounded-lg transition-all"
              >
                বুকিং সম্পর্কে জানুন
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
