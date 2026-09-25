'use client'

import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calculator, ChevronDown } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Car } from '@/lib/types'
import { DEFAULT_BASE_FARE, DEFAULT_FARE_PER_KM } from '@/lib/pricing'
import type { LocationResult } from '@/lib/location/types'
import { formatDistance } from '@/lib/location/osrm'
import { useCars } from '@/lib/useCars'
import { useClickOutside } from '@/lib/useClickOutside'
import { useRouteDistance } from '@/lib/useRouteDistance'
import { calculateFare } from '@/lib/fare'
import type { FareEstimate } from '@/lib/fare'
import { LocationAutocomplete } from './car-rental/LocationAutocomplete'
import { handleBookingLinkClick } from '@/lib/scroll'

type FareResult = FareEstimate & { car: Car }

function CarDropdown({
  cars,
  selectedCar,
  open,
  onToggle,
  onSelect,
  dropdownRef,
}: {
  cars: Car[]
  selectedCar: Car | null
  open: boolean
  onToggle: () => void
  onSelect: (car: Car) => void
  dropdownRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-stone-700 mb-3">
        Select Car
      </label>
      <button
        type="button"
        onClick={onToggle}
        className="mt-4 cursor-pointer flex w-full items-center justify-between text-left rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
      >
        <span>
          {selectedCar ? (
            <div className="flex items-center gap-3">
              <Image src={selectedCar.image} alt={selectedCar.brand} width={56} height={40} className="h-10 w-14 shrink-0 rounded-lg object-cover" />
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
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#eae5dd] bg-white shadow-xl max-h-64 overflow-y-auto">
          {cars.length === 0 && (
            <p className="px-4 py-3 text-sm text-[#aaa59e]">No vehicles available.</p>
          )}
          {cars.map((car) => (
            <button
              key={car.id}
              type="button"
              onClick={() => onSelect(car)}
              className={`w-full cursor-pointer px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f1ed] transition-colors ${selectedCar?.id === car.id ? 'bg-[#f0edf9] border-l-4 border-[#a8865f]' : ''}`}
            >
              <Image src={car.image} alt={car.brand} width={64} height={48} className="h-12 w-16 shrink-0 rounded-lg object-cover" />
              <div>
                <p className="font-semibold text-sm text-black">{car.brand} {car.model}</p>
                <p className="text-xs text-[#aaa59e]">{car.category} · {car.seats} Seats · ৳{car.pricePerDay}/day</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RouteStatus({
  isLoading,
  distanceMeters,
  error,
}: {
  isLoading: boolean
  distanceMeters: number | null
  error: boolean
}) {
  return (
    <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-center text-sm text-stone-700 shadow-sm">
      {isLoading && <span className="font-semibold text-amber-800">সড়কপথের দূরত্ব হিসাব হচ্ছে...</span>}
      {!isLoading && distanceMeters !== null && (
        <span className="font-bold">সড়কপথের দূরত্ব: {formatDistance(distanceMeters)}</span>
      )}
      {!isLoading && error && (
        <span className="font-medium text-red-600">এই দুই লোকেশনের সড়ক দূরত্ব এখন পাওয়া যাচ্ছে না</span>
      )}
    </div>
  )
}

function LocationFields({
  pickupLocation,
  onPickupChange,
  dropoffLocation,
  onDropoffChange,
  openPickup,
  onOpenPickupChange,
  openDropoff,
  onOpenDropoffChange,
  isRouteLoading,
  routeDistanceMeters,
  routeError,
  locationContainerRef,
}: {
  pickupLocation: LocationResult | null
  onPickupChange: (loc: LocationResult | null) => void
  dropoffLocation: LocationResult | null
  onDropoffChange: (loc: LocationResult | null) => void
  openPickup: boolean
  onOpenPickupChange: (open: boolean) => void
  openDropoff: boolean
  onOpenDropoffChange: (open: boolean) => void
  isRouteLoading: boolean
  routeDistanceMeters: number | null
  routeError: boolean
  locationContainerRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={locationContainerRef} className="space-y-4">
      <LocationAutocomplete
        label="পিকআপ লোকেশন"
        value={pickupLocation}
        onChange={onPickupChange}
        open={openPickup}
        onOpenChange={onOpenPickupChange}
      />

      <LocationAutocomplete
        label="ড্রপ-অফ লোকেশন"
        value={dropoffLocation}
        onChange={onDropoffChange}
        open={openDropoff}
        onOpenChange={onOpenDropoffChange}
      />

      {pickupLocation && dropoffLocation && (
        <RouteStatus
          isLoading={isRouteLoading}
          distanceMeters={routeDistanceMeters}
          error={routeError}
        />
      )}
    </div>
  )
}

function FareResultCard({ result, onBookNow }: { result: FareResult; onBookNow: () => void }) {
  return (
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
<Link href="#booking" onClick={(e) => handleBookingLinkClick(e, onBookNow)} className="block w-full cursor-pointer rounded-lg bg-linear-to-r from-amber-600 to-amber-700 py-4 text-center font-bold text-white transition-all hover:from-amber-700 hover:to-amber-800">Book Now</Link>
      </div>
    </motion.div>
  )
}

function PricingInfoCard({
  selectedCar,
  displayBaseFare,
  displayRate,
}: {
  selectedCar: Car | null
  displayBaseFare: number
  displayRate: number
}) {
  return (
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
  )
}

export function FareCalculator() {
  const [formData, setFormData] = useState({
    carId: '',
  })
  const [pickupLocation, setPickupLocation] = useState<LocationResult | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<LocationResult | null>(null)
  const [result, setResult] = useState<FareResult | null>(null)
  const [showCarDropdown, setShowCarDropdown] = useState(false)
  const [openPickup, setOpenPickup] = useState(false)
  const [openDropoff, setOpenDropoff] = useState(false)

  const carDropdownRef = useRef<HTMLDivElement>(null)
  const locationContainerRef = useRef<HTMLDivElement>(null)

  const cars = useCars()
  const { distanceMeters: routeDistanceMeters, isLoading: isRouteLoading, error: routeError } =
    useRouteDistance(pickupLocation, dropoffLocation, { onReset: () => setResult(null) })

  useClickOutside(
    [carDropdownRef, locationContainerRef],
    () => {
      setShowCarDropdown(false)
      setOpenPickup(false)
      setOpenDropoff(false)
    },
    'mousedown'
  )

  const selectedCar = cars.find((c) => c.id === Number(formData.carId)) ?? null
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

    try {
      const estimate = calculateFare(car, distanceKm)
      setResult({ ...estimate, car })
      toast.success('Fare calculated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Pricing is temporarily unavailable')
    }
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
            <CarDropdown
              cars={cars}
              selectedCar={selectedCar}
              open={showCarDropdown}
              onToggle={() => setShowCarDropdown(!showCarDropdown)}
              onSelect={handleCarSelect}
              dropdownRef={carDropdownRef}
            />

            <LocationFields
              pickupLocation={pickupLocation}
              onPickupChange={(loc) => {
                setPickupLocation(loc)
                setResult(null)
              }}
              dropoffLocation={dropoffLocation}
              onDropoffChange={(loc) => {
                setDropoffLocation(loc)
                setResult(null)
              }}
              openPickup={openPickup}
              onOpenPickupChange={setOpenPickup}
              openDropoff={openDropoff}
              onOpenDropoffChange={setOpenDropoff}
              isRouteLoading={isRouteLoading}
              routeDistanceMeters={routeDistanceMeters}
              routeError={routeError}
              locationContainerRef={locationContainerRef}
            />

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

          {/* Result / Pricing Info */}
          {result ? (
            <FareResultCard result={result} onBookNow={handleBookNow} />
          ) : (
            <PricingInfoCard
              selectedCar={selectedCar}
              displayBaseFare={displayBaseFare}
              displayRate={displayRate}
            />
          )}
        </div>
      </div>
    </section>
    </>
  )
}