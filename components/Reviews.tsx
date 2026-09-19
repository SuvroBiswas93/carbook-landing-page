'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Review } from '@/lib/store'

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [form, setForm] = useState({ name: '', location: '', rating: 5, text: '' })

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

        <form onSubmit={handleSubmit} className="mt-12 rounded-xl border border-stone-200 bg-white p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-stone-900">Leave a Review</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="Your name" />
            <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} className="rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="Location" />
            <select value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} className="rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500">
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
            </select>
          </div>
          <textarea value={form.text} onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))} className="mt-4 min-h-32 w-full rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="Tell us about your experience" />
          <button type="submit" className="mt-4 rounded-lg bg-amber-600 px-6 py-3 font-bold text-white transition hover:bg-amber-700">Submit Review</button>
        </form>

        {/* Testimonial Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-linear-to-r from-amber-600 to-amber-700 rounded-2xl p-12 text-white text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-bold">4.9★</p>
              <p className="text-amber-100 mt-2">Average Rating</p>
            </div>
            <div>
              <p className="text-4xl font-bold">10K+</p>
              <p className="text-amber-100 mt-2">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold">98%</p>
              <p className="text-amber-100 mt-2">Satisfaction Rate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
