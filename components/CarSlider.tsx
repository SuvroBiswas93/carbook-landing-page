'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Users, Fuel, Zap, Snowflake } from 'lucide-react'
import { Modal } from './Modal'
import type { Car } from '@/lib/store'

export function CarSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isMobile, setIsMobile] = useState(false)
  const [sliderWidth, setSliderWidth] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsPerView = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setItemsPerView(mobile ? 1 : 3)
    }
    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  useEffect(() => {
    fetch('/api/cars')
      .then((response) => response.json())
      .then((data: Car[]) => setCars(data))
      .catch(() => setCars([]))
  }, [])

  useEffect(() => {
    const slider = sliderRef.current

    if (!slider) return

    const resizeObserver = new ResizeObserver(() => {
      setSliderWidth(slider.clientWidth)
    })

    resizeObserver.observe(slider)
    setSliderWidth(slider.clientWidth)

    return () => resizeObserver.disconnect()
  }, [])

  const maxIndex = Math.max(0, cars.length - itemsPerView)

  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex)
  }, [maxIndex])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const gap = 32
  const cardWidth = (sliderWidth - gap * (itemsPerView - 1)) / itemsPerView
  const slideOffset = -currentIndex * (cardWidth + gap)

  const cardWidthClass =
    itemsPerView === 3 ? 'w-[calc((100%_-_4rem)_/_3)]' : 'w-full'

  return (
    <section id="cars" className="py-14 bg-white sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            আমাদের গাড়ির তালিকা
          </h2>
          <p className="text-base sm:text-xl text-stone-600">
            আপনার প্রয়োজন অনুযায়ী গাড়ি বেছে নিন
          </p>
        </motion.div>

        {/* Slider */}
        <div className="relative">
          <div
            ref={sliderRef}
            className={`w-full ${isMobile ? 'scroll-smooth overflow-x-auto overscroll-x-contain pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]' : 'overflow-hidden'}`}
            style={isMobile ? { scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' } : undefined}
          >
            <motion.div
              animate={isMobile ? undefined : { x: slideOffset }}
              transition={{ type: 'tween', duration: 0.5 }}
              className={`flex ${isMobile ? 'gap-4 snap-x snap-mandatory' : 'gap-8'}`}
            >
              {cars.length === 0 && (
                <div className="w-full rounded-xl border border-stone-200 bg-stone-50 p-8 text-center text-stone-500">
                  No cars are published yet.
                </div>
              )}
              {cars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${isMobile ? 'min-w-[86%] snap-start snap-always' : cardWidthClass} shrink-0 overflow-hidden rounded-xl bg-stone-50 shadow-lg transition-all hover:shadow-2xl`}
                  style={isMobile ? { scrollSnapAlign: 'start', scrollSnapStop: 'always' } : undefined}
                >
                  <img src={car.image} alt={`${car.brand} ${car.model}`} className={isMobile ? 'h-40 w-full object-cover' : 'h-48 w-full object-cover'} />

                  <div className={isMobile ? 'space-y-3 p-4' : 'space-y-4 p-6'}>
                    <div>
                      <h3 className={isMobile ? 'text-xl font-bold text-stone-900' : 'text-2xl font-bold text-stone-900'}>
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-xs text-stone-500 capitalize sm:text-sm">{car.category}</p>
                    </div>

                    <div className={isMobile ? 'grid grid-cols-2 gap-2 border-y border-stone-200 py-3' : 'grid grid-cols-2 gap-3 border-y border-stone-200 py-4 sm:grid-cols-4'}>
                      <div className="text-center">
                        <Users size={isMobile ? 16 : 20} className="mx-auto mb-1 text-brand-navy" />
                        <p className="text-xs font-semibold text-stone-900 sm:text-sm">{car.seats}</p>
                        <p className="text-[10px] text-stone-500 sm:text-xs">Seats</p>
                      </div>
                      <div className="text-center">
                        <Fuel size={isMobile ? 16 : 20} className="mx-auto mb-1 text-brand-navy" />
                        <p className="text-xs font-semibold capitalize text-stone-900 sm:text-sm">{car.fuel}</p>
                        <p className="text-[10px] text-stone-500 sm:text-xs">Fuel</p>
                      </div>
                      <div className="text-center">
                        <Zap size={isMobile ? 16 : 20} className="mx-auto mb-1 text-brand-navy" />
                        <p className="text-xs font-semibold capitalize text-stone-900 sm:text-sm">{car.transmission}</p>
                        <p className="text-[10px] text-stone-500 sm:text-xs">Trans</p>
                      </div>
                      <div className="text-center">
                        <Snowflake size={isMobile ? 16 : 20} className={`mx-auto mb-1 ${car.hasAc ? 'text-sky-500' : 'text-stone-300'}`} />
                        <p className="text-xs font-semibold text-stone-900 sm:text-sm">{car.hasAc ? 'আছে' : 'নেই'}</p>
                        <p className="text-[10px] text-stone-500 sm:text-xs">AC</p>
                      </div>
                    </div>

                    <div>
                      <p className={isMobile ? 'mb-1 text-xs text-stone-600' : 'mb-2 text-sm text-stone-600'}>
                        From{' '}
                        <span className={isMobile ? 'text-xl font-bold text-amber-700' : 'text-2xl font-bold text-amber-700'}>৳{car.pricePerDay}</span>
                        <span className="text-stone-500"> শুরু</span>
                      </p>
                      <p className="text-[10px] text-stone-500 sm:text-xs">৳{car.pricePerKm}/কিমি</p>
                    </div>

                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('car-booking:selected', { detail: car }))
                        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className={isMobile ? 'w-full cursor-pointer rounded-lg bg-linear-to-r from-amber-600 to-amber-700 py-2.5 text-sm font-semibold text-white transition-all hover:from-amber-700 hover:to-amber-800' : 'w-full cursor-pointer rounded-lg bg-linear-to-r from-amber-600 to-amber-700 py-3 font-semibold text-white transition-all hover:from-amber-700 hover:to-amber-800'}
                    >
                      বুক করুন
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {!isMobile && (
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
              <motion.button
                whileHover={{ scale: 1.15, boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                style={{ visibility: currentIndex <= 0 ? 'hidden' : 'visible' }}
                className="pointer-events-auto z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand-navy text-white shadow-lg transition-all hover:bg-brand-navy-soft sm:size-14"
              >
                <ChevronLeft size={28} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15, boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                style={{ visibility: currentIndex >= maxIndex ? 'hidden' : 'visible' }}
                className="pointer-events-auto z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand-navy text-white shadow-lg transition-all hover:bg-brand-navy-soft sm:size-14"
              >
                <ChevronRight size={28} />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Car Detail Modal */}
      <Modal
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        title={selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : ''}
      >
        {selectedCar && (
          <div className="space-y-6">
            <img src={selectedCar.image} alt={`${selectedCar.brand} ${selectedCar.model}`} className="h-64 w-full object-cover rounded-lg" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-stone-500 mb-1">Category</p>
                <p className="text-lg font-semibold text-stone-900 capitalize">
                  {selectedCar.category}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Transmission</p>
                <p className="text-lg font-semibold text-stone-900 capitalize">
                  {selectedCar.transmission}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Seating</p>
                <p className="text-lg font-semibold text-stone-900">
                  {selectedCar.seats} Seats
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Fuel Type</p>
                <p className="text-lg font-semibold text-stone-900 capitalize">
                  {selectedCar.fuel}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-stone-500 mb-2">Description</p>
              <p className="text-stone-700 leading-relaxed">
                {selectedCar.description}
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-stone-600 mb-2">Pricing</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-amber-700">
                    ৳{selectedCar.pricePerDay}
                  </p>
                  <p className="text-sm text-stone-500">per day</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">
                    ৳{selectedCar.pricePerKm}
                  </p>
                  <p className="text-sm text-stone-500">per km</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-stone-200">
              <button
                onClick={() => setSelectedCar(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold py-3 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCar(null)
                  window.dispatchEvent(new CustomEvent('car-booking:selected', { detail: selectedCar }))
                  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex-1 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 rounded-lg transition-all"
              >
                বুক করুন
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
