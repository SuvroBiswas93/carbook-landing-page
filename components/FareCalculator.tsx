'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ChevronDown, Search, X } from 'lucide-react'
import { toast } from 'react-toastify'
import locationsData from '@/data/locations.json'
import type { Car, Pricing } from '@/lib/store'
import { BookingModal, type BookingFormData } from './BookingModal'

export function FareCalculator() {
  const [formData, setFormData] = useState({
    carId: '',
    pickupLocationId: '',
    dropoffLocationId: '',
  })
  const [result, setResult] = useState<{
    baseFare: number
    distanceFare: number
    totalFare: number
    distance: number
    carId: number
    pickupLocation: string
    dropoffLocation: string
  } | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null)

  const [showCarDropdown, setShowCarDropdown] = useState(false)
  const [showPickupDropdown, setShowPickupDropdown] = useState(false)
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false)
  const [carSearch, setCarSearch] = useState('')
  const [pickupSearch, setPickupSearch] = useState('')
  const [dropoffSearch, setDropoffSearch] = useState('')

  const carDropdownRef = useRef<HTMLDivElement>(null)
  const pickupDropdownRef = useRef<HTMLDivElement>(null)
  const dropoffDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/cars')
      .then((response) => response.json())
      .then((data: Car[]) => setCars(data))
      .catch(() => setCars([]))
  }, [])

  useEffect(() => {
    fetch('/api/pricing')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load pricing')
        return response.json()
      })
      .then((data: Pricing) => setPricing(data))
      .catch(() => setPricing({ farePerKm: 5, minimumFare: 25, currency: 'USD' }))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideCar = carDropdownRef.current?.contains(target)
      const isInsidePickup = pickupDropdownRef.current?.contains(target)
      const isInsideDropoff = dropoffDropdownRef.current?.contains(target)
      if (!isInsideCar && !isInsidePickup && !isInsideDropoff) {
        setShowCarDropdown(false)
        setShowPickupDropdown(false)
        setShowDropoffDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(carSearch.toLowerCase()) ||
      car.model.toLowerCase().includes(carSearch.toLowerCase())
  )
  const filteredPickup = locationsData.filter(
    (loc) =>
      loc.name.toLowerCase().includes(pickupSearch.toLowerCase()) ||
      loc.zone.toLowerCase().includes(pickupSearch.toLowerCase())
  )
  const filteredDropoff = locationsData.filter(
    (loc) =>
      loc.name.toLowerCase().includes(dropoffSearch.toLowerCase()) ||
      loc.zone.toLowerCase().includes(dropoffSearch.toLowerCase())
  )

  const selectedCar = cars.find((c) => c.id === Number(formData.carId))
  const selectedPickup = locationsData.find((l) => l.id === Number(formData.pickupLocationId))
  const selectedDropoff = locationsData.find((l) => l.id === Number(formData.dropoffLocationId))

  const handleCarSelect = (car: Car) => {
    setFormData({ ...formData, carId: String(car.id) })
    setShowCarDropdown(false)
    setCarSearch('')
  }

  const handlePickupSelect = (loc: typeof locationsData[0]) => {
    setFormData({ ...formData, pickupLocationId: String(loc.id) })
    setShowPickupDropdown(false)
    setPickupSearch('')
  }

  const handleDropoffSelect = (loc: typeof locationsData[0]) => {
    setFormData({ ...formData, dropoffLocationId: String(loc.id) })
    setShowDropoffDropdown(false)
    setDropoffSearch('')
  }

  const handleCalculate = () => {
    if (
      !formData.carId ||
      !formData.pickupLocationId ||
      !formData.dropoffLocationId
    ) {
      toast.error('Please select all options')
      return
    }

    const carId = Number(formData.carId)
    const pickupLocationId = Number(formData.pickupLocationId)
    const dropoffLocationId = Number(formData.dropoffLocationId)
    const car = Number.isInteger(carId) ? cars.find((c) => c.id === carId) : undefined
    const pickupLocation = locationsData.find(
      (l) => l.id === pickupLocationId
    )
    const dropoffLocation = locationsData.find(
      (l) => l.id === dropoffLocationId
    )

    if (!car || !pickupLocation || !dropoffLocation || !pricing) {
      toast.error('Invalid selection')
      return
    }

    const distance = Math.max(15, Math.abs(dropoffLocation.id - pickupLocation.id) * 35)
    const rate = Number(pricing.farePerKm)
    const baseFare = Number(pricing.minimumFare)

    if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(baseFare) || baseFare < 0) {
      toast.error('Pricing is temporarily unavailable')
      return
    }

    const distanceFare = distance * rate

    const totalFare = Math.max(baseFare, distanceFare)

    setResult({
      baseFare,
      distanceFare,
      totalFare,
      distance,
      carId: car.id,
      pickupLocation: pickupLocation.name,
      dropoffLocation: dropoffLocation.name,
    })

    toast.success('Fare calculated successfully!')
  }

  const handleOpenBooking = () => {
    if (!result) return

    const car = cars.find((item) => item.id === result.carId)
    if (!car) {
      toast.error('This vehicle is no longer available')
      return
    }

    setBookingData({
      car,
      pickupLocation: result.pickupLocation,
      dropoffLocation: result.dropoffLocation,
      pickupDate: '',
      mobileNumber: '',
      tripType: 'One Way',
      distance: result.distance,
      distanceFare: result.distanceFare,
      estimatedFare: result.totalFare,
    })
    setIsBookingModalOpen(true)
  }

  const handleBookConfirm = async (data: BookingFormData): Promise<boolean> => {
    if (!data.car) return false

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carId: data.car.id,
        carName: `${data.car.brand} ${data.car.model}`,
        mobileNumber: data.mobileNumber,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        pickupDate: data.pickupDate,
        tripType: data.tripType,
        distance: data.distance,
        distanceFare: data.distanceFare,
        estimatedFare: data.estimatedFare,
      }),
    })

    if (!response.ok) {
      toast.error('Could not send booking request')
      return false
    }

    setIsBookingModalOpen(false)
    setBookingData(null)
    return true
  }

  return (
    <>
    <section id="fare-calculator" className="py-20 bg-linear-to-br from-stone-100 to-amber-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            Fare Calculator
          </h2>
          <p className="text-xl text-stone-600">
            Estimate your rental cost instantly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
          >
            {/* Car Dropdown */}
            <div className="relative" ref={carDropdownRef}>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Select Car
              </label>
              <button
                type="button"
                onClick={() => { setShowCarDropdown(!showCarDropdown); setShowPickupDropdown(false); setShowDropoffDropdown(false) }}
                className="mt-4 flex w-full items-center justify-between text-left rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <span>
                  {selectedCar ? (
                    <div className="flex items-center gap-3">
                      <img src={selectedCar.image} alt={selectedCar.brand} className="h-10 w-14 rounded-lg object-cover" />
                      <div>
                        <strong className="block font-serif text-lg">{selectedCar.brand} {selectedCar.model}</strong>
                        <span className="text-sm text-[#aaa59e]">{selectedCar.seats} Seats · ${selectedCar.pricePerDay}/day</span>
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
                  {filteredCars.length === 0 && (
                    <p className="px-4 py-3 text-sm text-[#aaa59e]">No vehicles available.</p>
                  )}
                  {filteredCars.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleCarSelect(car)}
                      className={`w-full cursor-pointer px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f1ed] transition-colors ${selectedCar?.id === car.id ? 'bg-[#f0edf9] border-l-4 border-[#a8865f]' : ''}`}
                    >
                      <img src={car.image} alt={car.brand} className="h-12 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{car.brand} {car.model}</p>
                        <p className="text-xs text-[#aaa59e]">{car.category} · {car.seats} Seats · ${car.pricePerDay}/day</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pickup Location Dropdown */}
            <div className="relative" ref={pickupDropdownRef}>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Pickup Location
              </label>
              <div className="mt-4 relative">
                <button
                  type="button"
                  onClick={() => { setShowPickupDropdown(!showPickupDropdown); setShowCarDropdown(false); setShowDropoffDropdown(false) }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-sm"
                >
                  <span className={selectedPickup ? 'text-stone-900 font-semibold' : 'text-[#aaa59e]'}>
                    {selectedPickup ? selectedPickup.name : 'Select pickup location'}
                  </span>
                  <ChevronDown size={20} className="text-[#aaa59e]" />
                </button>
                {showPickupDropdown && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#eae5dd] bg-white shadow-xl overflow-hidden">
                    <div className="relative p-2 border-b border-[#eae5dd]">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59e]" />
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={pickupSearch}
                        onChange={(e) => setPickupSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#eae5dd] text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                      />
                      {pickupSearch && (
                        <button
                          type="button"
                          onClick={() => setPickupSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa59e] hover:text-stone-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredPickup.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handlePickupSelect(loc)}
                          className={`w-full cursor-pointer px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-[#f5f0eb] ${selectedPickup?.id === loc.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''}`}
                        >
                          <p className="font-semibold text-sm text-stone-900">{loc.name}</p>
                          <p className="text-xs text-[#aaa59e]">{loc.address}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drop-off Location Dropdown */}
            <div className="relative" ref={dropoffDropdownRef}>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Drop-off Location
              </label>
              <div className="mt-4 relative">
                <button
                  type="button"
                  onClick={() => { setShowDropoffDropdown(!showDropoffDropdown); setShowCarDropdown(false); setShowPickupDropdown(false) }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-sm"
                >
                  <span className={selectedDropoff ? 'text-stone-900 font-semibold' : 'text-[#aaa59e]'}>
                    {selectedDropoff ? selectedDropoff.name : 'Select drop-off location'}
                  </span>
                  <ChevronDown size={20} className="text-[#aaa59e]" />
                </button>
                {showDropoffDropdown && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#eae5dd] bg-white shadow-xl overflow-hidden">
                    <div className="relative p-2 border-b border-[#eae5dd]">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59e]" />
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={dropoffSearch}
                        onChange={(e) => setDropoffSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#eae5dd] text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                      />
                      {dropoffSearch && (
                        <button
                          type="button"
                          onClick={() => setDropoffSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa59e] hover:text-stone-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredDropoff.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleDropoffSelect(loc)}
                          className={`w-full cursor-pointer px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-[#f5f0eb] ${selectedDropoff?.id === loc.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''}`}
                        >
                          <p className="font-semibold text-sm text-stone-900">{loc.name}</p>
                          <p className="text-xs text-[#aaa59e]">{loc.address}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCalculate}
              className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer"
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
              className="bg-linear-to-br from-amber-50 to-stone-50 rounded-2xl shadow-xl p-8 border-2 border-amber-200"
            >
              <h3 className="text-2xl font-bold text-stone-900 mb-8 text-center">
                Estimated Fare
              </h3>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <p className="text-sm text-stone-500 mb-2">Distance</p>
                  <p className="text-3xl font-bold text-stone-900">
                    {result.distance} km
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <p className="text-sm text-stone-500 mb-2">Distance Fare</p>
                  <p className="text-2xl font-bold text-amber-700">
                    ${result.distanceFare.toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 border-2 border-amber-300">
                  <p className="text-sm text-stone-500 mb-2">Total Fare</p>
                  <p className="text-4xl font-bold text-amber-700">
                    ${result.totalFare.toFixed(2)}
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    *This is an estimated fare based on current rates
                  </p>
                </div>

                <button onClick={handleOpenBooking} className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 rounded-lg transition-all cursor-pointer">
                  Proceed to Booking
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
              className="bg-linear-to-br from-amber-50 to-stone-50 rounded-2xl shadow-xl p-8 border-2 border-amber-200 flex flex-col justify-center"
            >
              <h3 className="text-2xl font-bold text-stone-900 mb-8">
                How We Calculate
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-stone-500 mb-2">Base Fare</p>
                  <p className="text-2xl font-bold text-stone-900">
                    ${pricing?.minimumFare ?? 25}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500 mb-2">Per Kilometer Rate</p>
                  <p className="text-2xl font-bold text-amber-700">
                    ${pricing?.farePerKm ?? 5}/km
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Total fare is calculated as the greater of the base fare or
                    the distance-based fare. Select your vehicle, locations, and
                    calculate above to get an instant estimate.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>

    <BookingModal
      isOpen={isBookingModalOpen}
      onClose={() => {
        setIsBookingModalOpen(false)
        setBookingData(null)
      }}
      bookingData={bookingData}
      onBookConfirm={handleBookConfirm}
    />
    </>
  )
}
