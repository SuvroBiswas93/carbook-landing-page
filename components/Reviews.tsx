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
  const [isReviewTriggerExpanded, setIsReviewTriggerExpanded] = useState(false)

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
    toast.success('We truly appreciate your valuable feedback.')
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
      <section id="reviews" className="py-14 bg-stone-50 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base sm:text-xl text-stone-600">
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

      {/* Right-center review trigger */}
      <motion.button
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: isReviewTriggerExpanded ? 0 : 14 }}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isReviewTriggerExpanded) {
            setIsModalOpen(true)
            return
          }
          setIsReviewTriggerExpanded(true)
        }}
        className={`fixed right-0 top-[42%] z-40 flex max-h-[28vh] -translate-y-1/2 cursor-pointer flex-col items-center gap-1.5 rounded-l-xl rounded-r-none border border-r-0 border-amber-200/70 bg-linear-to-br from-amber-500 via-amber-500 to-yellow-400 px-2 py-3 text-white shadow-[0_8px_24px_rgba(180,83,9,0.28)] ring-2 ring-white/70 backdrop-blur-sm transition-[padding,border-radius,box-shadow] hover:shadow-[0_10px_28px_rgba(180,83,9,0.36)] sm:right-3 sm:top-1/2 sm:gap-2 sm:rounded-l-xl sm:rounded-r-none sm:border-r sm:px-2.5 sm:py-4 md:right-4 lg:right-0 lg:px-3 lg:py-5 ${isReviewTriggerExpanded ? '' : 'sm:translate-x-3'}`}
        title={isReviewTriggerExpanded ? 'Open review form' : 'Show review option'}
        aria-label={isReviewTriggerExpanded ? 'Open review form' : 'Show review option'}
        aria-expanded={isReviewTriggerExpanded}
      >
        <Edit3 size={18} aria-hidden="true" className="sm:h-5 sm:w-5" />
        {isReviewTriggerExpanded && (
          <span className="text-xs font-bold tracking-wide [writing-mode:vertical-rl] sm:text-sm lg:text-base">Review</span>
        )}
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
            className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg cursor-pointer"
          >
            Submit Review
          </motion.button>
        </form>
      </Modal>
    </>
  )
}
