'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ChevronDown } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Car } from '@/lib/store'
import { DEFAULT_BASE_FARE, DEFAULT_FARE_PER_KM } from '@/lib/pricing'
import type { LocationResult } from '@/lib/location/types'
import { formatDistance, getRoute } from '@/lib/location/osrm'
import { LocationAutocomplete } from './car-rental/LocationAutocomplete'

export function FareCalculator() {
  const [formData, setFormData] = useState({
    carId: '',
  })
  const [pickupLocation, setPickupLocation] = useState<LocationResult | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<LocationResult | null>(null)
  const [routeDistanceMeters, setRouteDistanceMeters] = useState<number | null>(null)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState(false)
  const routeRequestRef = useRef<AbortController | null>(null)
  const [result, setResult] = useState<{
    baseFare: number
    distanceFare: number
    totalFare: number
    distanceKm: number
    car: Car
  } | null>(null)
  const [cars, setCars] = useState<Car[]>([])

  const [showCarDropdown, setShowCarDropdown] = useState(false)
  const [openPickup, setOpenPickup] = useState(false)
  const [openDropoff, setOpenDropoff] = useState(false)

  const carDropdownRef = useRef<HTMLDivElement>(null)
  const locationContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/cars')
      .then((response) => response.json())
      .then((data: Car[]) => setCars(data))
      .catch(() => setCars([]))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!carDropdownRef.current?.contains(target)) {
        setShowCarDropdown(false)
      }
      if (!locationContainerRef.current?.contains(target)) {
        setOpenPickup(false)
        setOpenDropoff(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    routeRequestRef.current?.abort()
    setRouteDistanceMeters(null)
    setRouteError(false)
    setResult(null)

    if (!pickupLocation || !dropoffLocation) {
      setIsRouteLoading(false)
      return
    }

    const controller = new AbortController()
    routeRequestRef.current = controller
    setIsRouteLoading(true)

    getRoute(
      pickupLocation.longitude,
      pickupLocation.latitude,
      dropoffLocation.longitude,
      dropoffLocation.latitude,
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return
        const route = data.routes[0]
        if (!route) throw new Error('No driving route found')
        setRouteDistanceMeters(route.distance)
        setIsRouteLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setIsRouteLoading(false)
        setRouteError(true)
      })

    return () => controller.abort()
  }, [dropoffLocation, pickupLocation])

  const selectedCar = cars.find((c) => c.id === Number(formData.carId))
  const displayBaseFare = selectedCar?.pricePerDay ?? DEFAULT_BASE_FARE
  const displayRate = selectedCar?.pricePerKm ?? DEFAULT_FARE_PER_KM
  const distanceKm =
    routeDistanceMeters === null
      ? undefined
      : Math.round((routeDistanceMeters / 1000) * 10) / 10

  const handleCarSelect = (car: Car) => {
    setFormData({ ...formData, carId: String(car.id) })
    setResult(null)
    setShowCarDropdown(false)
  }

  const updatePickup = (loc: LocationResult | null) => {
    setPickupLocation(loc)
    setResult(null)
  }

  const updateDropoff = (loc: LocationResult | null) => {
    setDropoffLocation(loc)
    setResult(null)
  }

  const handleCalculate = () => {
    if (!formData.carId || !pickupLocation || !dropoffLocation) {
      toast.error('Please select all options')
      return
    }

    if (routeDistanceMeters === null || distanceKm === undefined) {
      toast.error(
        routeError
          ? 'Route distance could not be calculated. Please try another location pair.'
          : 'Route distance is still being calculated. Please wait.'
      )
      return
    }

    const car = selectedCar
    if (!car) {
      toast.error('Invalid selection')
      return
    }

    const rate = Number(car.pricePerKm ?? DEFAULT_FARE_PER_KM)
    const baseFare = Number(car.pricePerDay ?? DEFAULT_BASE_FARE)

    if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(baseFare) || baseFare < 0) {
      toast.error('Pricing is temporarily unavailable')
      return
    }

    const distanceFare = distanceKm * rate

    const totalFare = Math.max(baseFare, distanceFare)

    setResult({
      baseFare,
      distanceFare,
      totalFare,
      distanceKm,
      car,
    })

    toast.success('Fare calculated successfully!')
  }

  const handleBookNow = () => {
    if (!result) return

    window.dispatchEvent(
      new CustomEvent('hero-booking:prefill', {
        detail: { car: result.car, pickupLocation, dropoffLocation },
      })
    )
  }

  return (
    <>
    <section id="fare-calculator" className="py-14 bg-brand-surface sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            ভাড়া হিসাব করুন
          </h2>
          <p className="text-base sm:text-xl text-stone-600">
            বুকিং করার আগেই আনুমানিক ভাড়া জেনে নিন
          </p>
          <p className="mt-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand-navy">
            প্রাইসিং মডেল: বেস ভাড়া + প্রতি কিলোমিটার
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 space-y-6"
          >
            {/* Car Dropdown */}
            <div className="relative" ref={carDropdownRef}>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Select Car
              </label>
              <button
                type="button"
                onClick={() => { setShowCarDropdown(!showCarDropdown) }}
                className="mt-4 flex w-full items-center justify-between text-left rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <span>
                  {selectedCar ? (
                    <div className="flex items-center gap-3">
                      <img src={selectedCar.image} alt={selectedCar.brand} className="h-10 w-14 rounded-lg object-cover" />
                      <div>
                        <strong className="block font-serif text-lg text-black">{selectedCar.brand} {selectedCar.model}</strong>
                        <span className="text-sm text-[#aaa59e]">{selectedCar.seats} Seats · ৳{selectedCar.pricePerDay}/day</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[#aaa59e]">Choose a vehicle...</span>
                  )}
                </span>
                <ChevronDown size={22} />
              </button>
              {showCarDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#eae5dd] bg-white shadow-xl max-h-64 overflow-y-auto">
                  {cars.length === 0 && (
                    <p className="px-4 py-3 text-sm text-[#aaa59e]">No vehicles available.</p>
                  )}
                  {cars.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleCarSelect(car)}
                      className={`w-full cursor-pointer px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f1ed] transition-colors ${selectedCar?.id === car.id ? 'bg-[#f0edf9] border-l-4 border-[#a8865f]' : ''}`}
                    >
                      <img src={car.image} alt={car.brand} className="h-12 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-sm text-black">{car.brand} {car.model}</p>
                        <p className="text-xs text-[#aaa59e]">{car.category} · {car.seats} Seats · ৳{car.pricePerDay}/day</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pickup / Drop-off Location (Photon autocomplete) */}
            <div ref={locationContainerRef} className="space-y-4">
              <LocationAutocomplete
                label="পিকআপ লোকেশন"
                value={pickupLocation}
                onChange={updatePickup}
                open={openPickup}
                onOpenChange={setOpenPickup}
              />

              <LocationAutocomplete
                label="ড্রপ-অফ লোকেশন"
                value={dropoffLocation}
                onChange={updateDropoff}
                open={openDropoff}
                onOpenChange={setOpenDropoff}
              />

              {pickupLocation && dropoffLocation && (
                <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-center text-sm text-stone-700 shadow-sm">
                  {isRouteLoading && <span className="font-semibold text-amber-800">সড়কপথের দূরত্ব হিসাব হচ্ছে...</span>}
                  {!isRouteLoading && routeDistanceMeters !== null && (
                    <span className="font-bold">সড়কপথের দূরত্ব: {formatDistance(routeDistanceMeters)}</span>
                  )}
                  {!isRouteLoading && routeError && (
                    <span className="font-medium text-red-600">এই দুই লোকেশনের সড়ক দূরত্ব এখন পাওয়া যাচ্ছে না</span>
                  )}
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCalculate}
              className="w-full bg-[#FFB020] hover:bg-[#E08E00] text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer"
            >
              <Calculator size={20} />
              Calculate Fare
            </motion.button>
          </motion.div>

          {/* Result Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-brand-surface rounded-2xl shadow-xl p-4 sm:p-8 border-2 border-blue-100"
            >
              <h3 className="text-2xl font-bold text-stone-900 mb-8 text-center">
                Estimated Fare
              </h3>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <p className="text-sm text-stone-500 mb-2">Distance</p>
                  <p className="text-3xl font-bold text-stone-900">
                    {formatDistance(result.distanceKm * 1000)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <p className="text-sm text-stone-500 mb-2">Distance Fare</p>
                  <p className="text-2xl font-bold text-amber-700">
                      ৳{result.distanceFare.toFixed(2)}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-6 border-2 border-amber-300">
                  <p className="text-sm text-stone-500 mb-2">Total Fare</p>
                  <p className="text-4xl font-bold text-amber-700">
                    ৳{result.totalFare.toFixed(2)}
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    *This is an estimated fare based on current rates
                  </p>
                </div>

                <button onClick={handleBookNow} className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 rounded-lg transition-all cursor-pointer">
                  Book Now
                </button>
              </div>
            </motion.div>
          )}

          {/* Pricing Info */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-surface rounded-2xl shadow-xl p-4 sm:p-8 border-2 border-blue-100 flex flex-col justify-center"
            >
              <h3 className="text-2xl font-bold text-stone-900 mb-8">
                আমরা যেভাবে ভাড়া হিসাব করি
              </h3>
              {selectedCar && (
                <p className="-mt-5 mb-6 text-sm font-semibold text-brand-navy">
                  {selectedCar.brand} {selectedCar.model} ({selectedCar.category})
                </p>
              )}

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-stone-500 mb-2">বেস ভাড়া</p>
                  <p className="text-2xl font-bold text-stone-900">
                    ৳{displayBaseFare}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500 mb-2">প্রতি কিলোমিটার ভাড়া</p>
                  <p className="text-2xl font-bold text-amber-700">
                    ৳{displayRate}/km
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    মোট ভাড়া হিসাব করা হয় বেস ভাড়া অথবা দূরত্বভিত্তিক ভাড়ার
                    মধ্যে যেটি বেশি, সেটি অনুযায়ী। গাড়ি ও যাত্রার স্থান বেছে
                    হিসাব করুন এবং বুকিংয়ের আগেই আনুমানিক ভাড়া জেনে নিন।
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
    </>
  )
}