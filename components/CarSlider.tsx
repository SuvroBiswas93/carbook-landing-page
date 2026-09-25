'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Users, Fuel, Zap, Snowflake } from 'lucide-react'
import { Modal } from './Modal'
import type { Car } from '@/lib/types'
import { useCarsWithLoading } from '@/lib/useCars'
import { handleBookingLinkClick } from '@/lib/scroll'

function CarCardSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      className={`${isMobile ? 'min-w-[86%] snap-start snap-always' : 'w-[calc((100%_-_4rem)_/_3)]'} shrink-0 overflow-hidden rounded-xl bg-stone-50 shadow-lg`}
      style={isMobile ? { scrollSnapAlign: 'start', scrollSnapStop: 'always' } : undefined}
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div className={`relative ${isMobile ? 'h-40 w-full' : 'h-48 w-full'} bg-stone-200 animate-pulse`} />
      <div className={isMobile ? 'space-y-3 p-4' : 'space-y-4 p-6'}>
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded-lg bg-stone-200 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-stone-200 animate-pulse" />
        </div>
        {/* Specs grid - matches 4 specs */}
        <div className={isMobile ? 'grid grid-cols-2 gap-2 border-y border-stone-200 py-3' : 'grid grid-cols-2 gap-3 border-y border-stone-200 py-4 sm:grid-cols-4'}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="size-5 rounded-full bg-stone-200 animate-pulse" />
              <div className="h-3 w-8 rounded bg-stone-200 animate-pulse" />
              <div className="h-2 w-10 rounded bg-stone-200 animate-pulse" />
            </div>
          ))}
        </div>
        {/* Pricing */}
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-stone-200 animate-pulse" />
          <div className="flex items-baseline gap-2">
            <div className="h-7 w-24 rounded bg-amber-100 animate-pulse" />
            <div className="h-3 w-12 rounded bg-stone-200 animate-pulse" />
          </div>
          <div className="h-3 w-20 rounded bg-stone-200 animate-pulse" />
        </div>
        {/* CTA button */}
        <div className="h-10 w-full rounded-lg bg-stone-200 animate-pulse sm:h-11" />
      </div>
    </div>
  )
}

function CarSliderSkeleton({ isMobile, itemsPerView }: { isMobile: boolean; itemsPerView: number }) {
  const count = itemsPerView
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={`skeleton-${i}`} isMobile={isMobile} />
      ))}
    </>
  )
}

export function CarSlider() {
  const { cars, loading } = useCarsWithLoading()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isMobile, setIsMobile] = useState(false)
  const [sliderWidth, setSliderWidth] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const heroHeadline = 'গাড়ি ভাড়া, ঢাকা ও সারাদেশে'


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
    <section id="cars" className="py-14 bg-white mt-10 sm:py-20">
      <h1 aria-label={heroHeadline} className="font-serif text-center text-4xl font-bold leading-tight text-[#282622] sm:text-6xl">
          <span className="bg-linear-to-r from-[#FFB020] via-[#E08E00] to-[#16365C] bg-clip-text text-transparent">{heroHeadline}</span>
      </h1>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            আমাদের গাড়ির তালিকা
          </h2> */}
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
              {loading ? (
                <CarSliderSkeleton isMobile={isMobile} itemsPerView={itemsPerView} />
              ) : cars.length === 0 ? (
                <div className="w-full rounded-xl border border-stone-200 bg-stone-50 p-8 text-center text-stone-500">
                  No cars are published yet.
                </div>
              ) : (
                cars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${isMobile ? 'min-w-[86%] snap-start snap-always' : cardWidthClass} shrink-0 overflow-hidden rounded-xl bg-stone-50 shadow-lg transition-all hover:shadow-2xl`}
                  style={isMobile ? { scrollSnapAlign: 'start', scrollSnapStop: 'always' } : undefined}
                >
                  <div className={`relative ${isMobile ? 'h-40 w-full' : 'h-48 w-full'}`}>
                    <Image src={car.image} alt={`${car.brand} ${car.model}`} fill sizes={isMobile ? '86vw' : '(min-width: 1280px) 405px, 33vw'} className="object-cover" />
                  </div>

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

                    <Link
                      href="#booking"
                      onClick={(e) => handleBookingLinkClick(e, () => {
                        window.dispatchEvent(new CustomEvent('car-booking:selected', { detail: car }))
                      })}
                      className={isMobile ? 'block w-full cursor-pointer rounded-lg bg-linear-to-r from-amber-600 to-amber-700 py-2.5 text-center text-sm font-semibold text-white transition-all hover:from-amber-700 hover:to-amber-800' : 'block w-full cursor-pointer rounded-lg bg-linear-to-r from-amber-600 to-amber-700 py-3 text-center font-semibold text-white transition-all hover:from-amber-700 hover:to-amber-800'}
                    >
                      বুক করুন
                    </Link>
                  </div>
                </motion.div>
              ))
              )}
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
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image src={selectedCar.image} alt={`${selectedCar.brand} ${selectedCar.model}`} fill sizes="(min-width: 1280px) 40vw, 90vw" className="object-cover" />
            </div>

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
              <Link
                href="#booking"
                onClick={(e) => handleBookingLinkClick(e, () => {
                  setSelectedCar(null)
                  window.dispatchEvent(new CustomEvent('car-booking:selected', { detail: selectedCar }))
                })}
                className="flex-1 cursor-pointer rounded-lg bg-linear-to-r from-amber-600 to-amber-700 py-3 text-center font-semibold text-white transition-all hover:from-amber-700 hover:to-amber-800"
              >
                বুক করুন
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
