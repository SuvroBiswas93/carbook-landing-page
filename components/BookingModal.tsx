'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Car, MapPin, CalendarDays, ChevronRight, Route, Phone } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Car as CarInfo } from '@/lib/store'
import { formatDateTime } from '@/lib/utils'

export interface BookingFormData {
  car: CarInfo | null
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate?: string
  mobileNumber: string
  tripType: string
  distance?: number
  distanceFare?: number
  estimatedFare?: number
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  bookingData: BookingFormData | null
  onBookConfirm: (data: BookingFormData) => boolean | void | Promise<boolean | void>
}

export function BookingModal({ isOpen, onClose, bookingData, onBookConfirm }: BookingModalProps) {
  const [mobileNumber, setMobileNumber] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [tripType, setTripType] = useState('One Way')

  const [dropoffDate, setDropoffDate] = useState('')

  useEffect(() => {
    setMobileNumber(bookingData?.mobileNumber ?? '')
    setPickupDate(bookingData?.pickupDate ?? '')
    setDropoffDate(bookingData?.dropoffDate ?? '')
    setTripType(bookingData?.tripType ?? 'One Way')
  }, [bookingData])

  if (!bookingData) return null

  const handleConfirm = async () => {
    if (!mobileNumber.trim() || !pickupDate.trim()) {
      toast.error('Please enter your phone number and pickup date')
      return
    }
    if (tripType === 'Round Way' && !dropoffDate.trim()) {
      toast.error('Please enter drop-off date and time')
      return
    }
    if (!/^[+\d][\d\s-]{7,18}$/.test(mobileNumber.trim())) {
      toast.error('Please enter a valid mobile number')
      return
    }

    const submitted = await onBookConfirm({ ...bookingData, mobileNumber: mobileNumber.trim(), pickupDate: pickupDate.trim(), tripType, dropoffDate })
    if (submitted === false) return
    toast.success('Car booking request has been sent! A person will contact you shortly.', { autoClose: 5000 })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-linear-to-r from-amber-600 to-amber-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Booking Review</h2>
                  <button onClick={onClose} className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="overflow-hidden rounded-xl border border-stone-200">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative h-56 md:h-auto bg-stone-100">
                      {bookingData.car && (
                        <img
                          src={bookingData.car.image}
                          alt={`${bookingData.car.brand} ${bookingData.car.model}`}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/car${bookingData.car?.id}/400/300` }}
                        />
                      )}
                      {bookingData.car && (
                        <div className="absolute top-4 left-4">
                          <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">{bookingData.car.category.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      {bookingData.car && (
                        <>
                          <h3 className="text-xl font-bold text-stone-900">{bookingData.car.brand} {bookingData.car.model}</h3>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <Car size={16} className="text-amber-600" />
                              <span className="text-sm text-stone-600">{bookingData.car.seats} Seats</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-stone-600 capitalize">{bookingData.car.transmission}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-amber-700">${bookingData.car.pricePerDay}/day</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-stone-600 capitalize">{bookingData.car.fuel}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-stone-500">{bookingData.car.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                    <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <MapPin className="text-red-500" size={16} /> Route
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-500" />
                        <span className="text-sm font-semibold text-stone-900">{bookingData.pickupLocation}</span>
                      </div>
                      <div className="flex justify-center"><Route size={16} className="text-amber-500" /></div>
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-red-500" />
                        <span className="text-sm font-semibold text-stone-900">{bookingData.dropoffLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                    <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <CalendarDays className="text-blue-500" size={16} /> Schedule
                    </h4>
                    <div className="space-y-2">
                      {bookingData.pickupDate ? (
                        <p className="text-sm text-stone-600">{formatDateTime(pickupDate)}</p>
                      ) : (
                        <input
                          type="datetime-local"
                          value={pickupDate}
                          onChange={(event) => setPickupDate(event.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                          aria-label="Pickup date and time"
                        />
                      )}
                      {tripType === 'Round Way' && (
                        dropoffDate ? (
                          <p className="text-sm text-stone-600">{formatDateTime(dropoffDate)}</p>
                        ) : (
                          <input
                            type="datetime-local"
                            value={dropoffDate}
                            onChange={(event) => setDropoffDate(event.target.value)}
                            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                            aria-label="Drop-off date and time"
                          />
                        )
                      )}
                      <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
                        Trip type
                        <select
                          value={tripType}
                          onChange={(event) => setTripType(event.target.value)}
                          className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold normal-case tracking-normal text-amber-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                        >
                          <option value="One Way">One Way</option>
                          <option value="Round Way">Round Way</option>
                          <option value="Hourly">Hourly</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 md:col-span-2">
                    <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <Phone className="text-amber-600" size={16} /> Contact Number
                    </h4>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(event) => setMobileNumber(event.target.value)}
                      placeholder="e.g. +1 555 014 782"
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                      aria-label="Contact number"
                    />
                  </div>
                </div>

                {bookingData.estimatedFare !== undefined && (
                  <div className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Fare estimate</p>
                        <p className="mt-1 text-sm text-stone-600">{bookingData.distance} km route at the current rate</p>
                      </div>
                      <p className="text-3xl font-black text-amber-700">${bookingData.estimatedFare.toFixed(2)}</p>
                    </div>
                  </div>
                )}

               

                <div className="flex gap-4 pt-2">
                  <button onClick={onClose} className="flex-1 rounded-xl border-2 border-stone-200 bg-white py-3 font-bold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50">Close</button>
                  <button onClick={handleConfirm} className="flex-1 rounded-xl bg-amber-600 py-3 font-bold text-white transition-all hover:bg-amber-700 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30">Continue Booking <ChevronRight size={20} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
