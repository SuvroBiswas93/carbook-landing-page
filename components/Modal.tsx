'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto sm:max-h-[90vh] sm:w-full"
          >
            <div className="rounded-2xl bg-stone-50 p-5 shadow-2xl sm:p-8">
              <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
                <h2 className="text-2xl font-semibold text-stone-900 sm:text-3xl">{title}</h2>
                <button
                  onClick={onClose}
                  className="shrink-0 cursor-pointer text-stone-400 transition-colors hover:text-red-600"
                >
                  <X size={28} />
                </button>
              </div>
              <div className="text-stone-700">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
