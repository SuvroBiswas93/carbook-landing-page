'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Edit3 } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Review } from '@/lib/store'
import { Modal } from './Modal'

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [form, setForm] = useState({ name: '', location: '', rating: 5, text: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadReviews = () => {
    fetch('/api/reviews')
      .then((response) => response.json())
      .then((data: Review[]) => setReviews(data))
      .catch(() => setReviews([]))
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!response.ok) {
      toast.error('Please complete all review fields')
      return
    }

    setForm({ name: '', location: '', rating: 5, text: '' })
    setIsModalOpen(false)
    loadReviews()
    toast.success('Thanks for your review!')
  }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <>
      <section id="reviews" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-stone-600">
              Trusted by thousands for premium car rental experiences
            </p>
          </motion.div>

          {/* Reviews Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={item}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-200'
                      }
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-stone-700 mb-6 leading-relaxed italic">
                  "{review.text}"
                </p>

                {/* Author */}
                <div className="pt-4 border-t border-stone-200">
                  <p className="font-semibold text-stone-900">{review.name}</p>
                  <p className="text-sm text-stone-500">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sticky Note Button */}
      <motion.button
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: -8 }}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-6 z-40 w-16 h-20 bg-gradient-to-br from-amber-400 to-yellow-300 shadow-xl hover:shadow-2xl rounded-lg cursor-pointer flex items-center justify-center border-2 border-amber-500/30"
        title="Leave a Review"
      >
        <Edit3 size={24} className="text-white rotate-[-8deg]" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">+</span>
        </div>
      </motion.button>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Leave a Review"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Your Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                placeholder="Your city"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              className="w-full rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">Your Experience</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
              className="w-full min-h-32 rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
              placeholder="Tell us about your experience"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg cursor-pointer"
          >
            Submit Review
          </motion.button>
        </form>
      </Modal>
    </>
  )
}
