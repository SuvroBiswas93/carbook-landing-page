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
        className="fixed bottom-20 right-6 z-30 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all my-4 cursor-pointer"
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
        className="fixed bottom-6 right-6 z-30 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white p-4 rounded-full shadow-lg transition-all cursor-pointer"
        title="Scroll to top"
      >
        <ArrowUp size={24} />
      </motion.button>
    </>
  )
}
