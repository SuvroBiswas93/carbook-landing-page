'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ArrowUp } from 'lucide-react'

export function FloatingButtons() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
        setIsScrollTopVisible(true)
      } else {
        setIsVisible(false)
        setIsScrollTopVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      'Hi! I would like to inquire about car rental services.'
    )
    window.open(
      `https://wa.me/1234567890?text=${message}`,
      '_blank'
    )
  }

  return (
    <>
      {/* WhatsApp Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isVisible ? 1 : 0 }}
        exit={{ scale: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleWhatsApp}
        className="fixed bottom-21 right-3 z-30 hidden cursor-pointer rounded-full bg-brand-whatsapp p-3 text-white shadow-lg transition-all hover:bg-[#1fb957] sm:bottom-20 sm:right-6 sm:block sm:p-4 mb-4"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isScrollTopVisible ? 1 : 0 }}
        exit={{ scale: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={scrollToTop}
        className="fixed bottom-3 right-3 z-30 hidden cursor-pointer rounded-full bg-brand-navy p-3 text-white shadow-lg transition-all hover:bg-brand-navy-soft sm:bottom-6 sm:right-6 sm:block sm:p-4"
        title="Scroll to top"
      >
        <ArrowUp size={24} />
      </motion.button>
    </>
  )
}
