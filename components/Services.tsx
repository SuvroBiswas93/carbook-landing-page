'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  Shield,
  Calendar,
  Star,
  MapPin,
  Smartphone,
} from 'lucide-react'
import { Modal } from './Modal'
import servicesData from '@/data/services.json'

const iconMap: Record<string, React.ReactNode> = {
  'phone-icon': <Phone size={32} />,
  'shield-icon': <Shield size={32} />,
  'calendar-icon': <Calendar size={32} />,
  'star-icon': <Star size={32} />,
  'map-icon': <MapPin size={32} />,
  'smartphone-icon': <Smartphone size={32} />,
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
            Our Premium Services
          </h2>
          <p className="text-base sm:text-xl text-stone-600">
            Everything you need for a seamless rental experience
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl shadow-lg p-5 sm:p-8 cursor-pointer transition-all"
              onClick={() => setSelectedService(service)}
            >
              <div className="text-amber-600 mb-4">
                {iconMap[service.icon as keyof typeof iconMap]}
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">
                {service.title}
              </h3>
              <p className="text-stone-600 mb-6">{service.description}</p>
              <button className="text-amber-600 font-semibold hover:text-amber-700 transition-colors inline-flex items-center gap-2">
                View Details →
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
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold py-3 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 rounded-lg transition-all">
                Learn More
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
