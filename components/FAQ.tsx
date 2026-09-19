'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import faqData from '@/data/faq.json'

export function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <section id="faq" className="py-14 bg-white sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-xl text-stone-600">
            Everything you need to know about our rental service
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-4 py-4 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors sm:px-6"
              >
                <h3 className="text-left font-semibold text-stone-900 text-base sm:text-lg">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 ml-4"
                >
                  <ChevronDown size={24} className="text-amber-600" />
                </motion.div>
              </button>

              {/* Answer */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: openId === faq.id ? 'auto' : 0,
                  opacity: openId === faq.id ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-4 bg-stone-50 border-t border-stone-200 sm:px-6">
                  <p className="text-stone-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-stone-600 mb-4">
            Can&apos;t find your answer?
          </p>
          <a
            href="#contact"
            className="inline-block bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-8 rounded-lg transition-all"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  )
}
