'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { toast } from 'react-toastify'
import config from '@/data/config.json'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 1000)
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-stone-600">
            We are here to help. Contact us anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Phone */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-100 text-amber-600">
                  <Phone size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Phone</h3>
                <p className="mt-2 text-stone-600">{config.company.phone}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-100 text-amber-600">
                  <Mail size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Email</h3>
                <p className="mt-2 text-stone-600">{config.company.email}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-100 text-amber-600">
                  <MapPin size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Address</h3>
                <p className="mt-2 text-stone-600">{config.company.address}</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-100 text-amber-600">
                  <Clock size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Hours</h3>
                <p className="mt-2 text-stone-600">{config.company.hours}</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-8 border-t border-stone-200">
              <h3 className="text-lg font-semibold text-stone-900 mb-4">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {Object.entries(config.company.socialLinks).map(([name, link]) => (
                  <a
                    key={name}
                    href={link}
                    className="text-amber-600 hover:text-amber-700 transition-colors font-medium capitalize"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-stone-50 rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-50 transition-all resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={20} />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
