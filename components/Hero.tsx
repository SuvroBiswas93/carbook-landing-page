'use client'

import { useEffect, useState } from 'react'
import {
  CalendarDays,
  CarFront,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Search,
  X,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'react-toastify'
import locationsData from '@/data/locations.json'
import type { Car } from '@/lib/store'

interface BookingFormData {
  car: Car | null
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  mobileNumber: string
  tripType: string
}

interface HeroProps {
  onContinueClick?: (data: BookingFormData) => void
}

export function Hero({ onContinueClick }: HeroProps) {
  const [tripType, setTripType] = useState('One Way')
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [showCarDropdown, setShowCarDropdown] = useState(false)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [pickerDate, setPickerDate] = useState(new Date())
  const [pickerHour, setPickerHour] = useState(12)
  const [pickerMinute, setPickerMinute] = useState(0)
  const [pickerPeriod, setPickerPeriod] = useState<'AM' | 'PM'>('AM')
  const [pickerView, setPickerView] = useState<'date' | 'time'>('date')
  const [showPickupDropdown, setShowPickupDropdown] = useState(false)
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false)
  const [pickupSearch, setPickupSearch] = useState('')
  const [dropoffSearch, setDropoffSearch] = useState('')
  const [cars, setCars] = useState<Car[]>([])

  useEffect(() => {
    fetch('/api/cars')
      .then((response) => response.json())
      .then((data: Car[]) => setCars(data))
      .catch(() => toast.error('Could not load available cars'))
  }, [])

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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCar) {
      toast.error('Please select a car')
      return
    }
    if (!pickupLocation || !dropoffLocation || !pickupDate || !mobileNumber.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!/^[+\d][\d\s-]{7,18}$/.test(mobileNumber.trim())) {
      toast.error('Please enter a valid mobile number')
      return
    }
    if (pickupLocation === dropoffLocation) {
      toast.error('Pickup and drop-off locations must be different')
      return
    }
    const data: BookingFormData = {
      car: selectedCar,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      mobileNumber: mobileNumber.trim(),
      tripType,
    }
    onContinueClick?.(data)
  }

  return (
    <section id="hero" className="bg-[#f3f1ed] pb-16 pt-28 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-345 px-4 sm:px-8">
        <div className="max-w-117.5 rounded-t-[14px] bg-[#fffdfb] p-2 shadow-[0_12px_35px_rgba(50,44,35,.07)] sm:p-3">
          <div className="grid grid-cols-1 gap-2">
            <button type="button" className="rounded-lg px-4 py-4 text-sm font-bold sm:text-lg bg-amber-600 text-white">
              <CarFront className="mr-2 inline" size={17} /> Car Rental
            </button>
          </div>
        </div>

        <div className="rounded-b-[14px] rounded-tr-[14px] border-t border-[#eae5dd] bg-[#fffdfb] p-5 shadow-[0_16px_42px_rgba(50,44,35,.09)] sm:p-7 lg:p-8">
          <form onSubmit={handleContinue}>
            <div className="grid divide-y divide-[#eae5dd] lg:grid-cols-[1.2fr_1.25fr_1.25fr_1.3fr] lg:divide-x lg:divide-y-0">
              <div className="pb-5 lg:pb-0 lg:pr-8 relative">
                <label className="flex items-center gap-2 text-base font-bold">
                  <CarFront size={18} /> Choose a Car <span className="text-[#b94a43]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCarDropdown(!showCarDropdown)}
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
                      <span className="text-[#aaa59e]">Select a car...</span>
                    )}
                  </span>
                  <ChevronDown size={22} />
                </button>
                {showCarDropdown && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#eae5dd] bg-white shadow-xl max-h-64 overflow-y-auto">
                    {cars.length === 0 && (
                      <p className="px-4 py-3 text-sm text-[#aaa59e]">No published cars available.</p>
                    )}
                    {cars.map((car) => (
                      <button
                        key={car.id}
                        type="button"
                        onClick={() => { setSelectedCar(car); setShowCarDropdown(false) }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#f3f1ed] transition-colors ${selectedCar?.id === car.id ? 'bg-[#f0edf9] border-l-4 border-[#a8865f]' : ''}`}
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

              <div className="py-5 lg:px-8 lg:py-0 relative">
                <label className="flex items-center gap-2 text-base font-bold">
                  <span className="size-3 rounded-full bg-amber-500 ring-4 ring-amber-100" /> Pickup Location <span className="text-[#b94a43]">*</span>
                </label>
                <div className="mt-4 relative">
                  <button
                    type="button"
                    onClick={() => { setShowPickupDropdown(!showPickupDropdown); setShowDropoffDropdown(false) }}
                    className="flex w-full items-center justify-between rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-sm"
                  >
                    <span className={pickupLocation ? 'text-stone-900 font-semibold' : 'text-[#aaa59e]'}>
                      {pickupLocation || 'Select pickup location'}
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
                            onClick={() => { setPickupLocation(loc.name); setShowPickupDropdown(false); setPickupSearch('') }}
                            className={`w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-[#f5f0eb] ${pickupLocation === loc.name ? 'bg-amber-50 border-l-4 border-amber-500' : ''}`}
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

              <div className="py-5 lg:px-8 lg:py-0 relative">
                <label className="flex items-center gap-2 text-base font-bold">
                  <MapPin size={18} className="text-[#9b805d]" /> Drop-off Location <span className="text-[#b94a43]">*</span>
                </label>
                <div className="mt-4 relative">
                  <button
                    type="button"
                    onClick={() => { setShowDropoffDropdown(!showDropoffDropdown); setShowPickupDropdown(false) }}
                    className="flex w-full items-center justify-between rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-sm"
                  >
                    <span className={dropoffLocation ? 'text-stone-900 font-semibold' : 'text-[#aaa59e]'}>
                      {dropoffLocation || 'Select drop-off location'}
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
                            onClick={() => { setDropoffLocation(loc.name); setShowDropoffDropdown(false); setDropoffSearch('') }}
                            className={`w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-[#f5f0eb] ${dropoffLocation === loc.name ? 'bg-amber-50 border-l-4 border-amber-500' : ''}`}
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

              <div className="pt-5 lg:pl-8 lg:pt-0 relative">
                <label className="flex items-center gap-2 text-base font-bold">
                  <CalendarDays size={18} /> Pickup Date &amp; Time <span className="text-[#b94a43]">*</span>
                </label>
                <div className="mt-4 relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#eae5dd] bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-sm"
                  >
                    <span className={pickupDate ? 'text-stone-900 font-semibold' : 'text-[#aaa59e]'}>
                      {pickupDate || 'Select date & time'}
                    </span>
                    <CalendarDays size={20} className="text-amber-500" />
                  </button>
                  {showDatePicker && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-[#eae5dd] bg-white shadow-2xl overflow-hidden" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      <div className="flex border-b border-[#eae5dd]">
                        <button
                          type="button"
                          onClick={() => setPickerView('date')}
                          className={`flex-1 py-2.5 text-xs font-bold transition-colors ${pickerView === 'date' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50' : 'text-stone-500'}`}
                        >
                          Date
                        </button>
                        <button
                          type="button"
                          onClick={() => setPickerView('time')}
                          className={`flex-1 py-2.5 text-xs font-bold transition-colors ${pickerView === 'time' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50' : 'text-stone-500'}`}
                        >
                          Time
                        </button>
                      </div>
                      {pickerView === 'date' ? (
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <button
                              type="button"
                              onClick={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1, pickerDate.getDate()))}
                              className="w-7 h-7 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors"
                            >
                              <ChevronUp size={16} className="text-amber-600" />
                            </button>
                            <p className="font-bold text-stone-900 text-xs">
                              {pickerDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                            <button
                              type="button"
                              onClick={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, pickerDate.getDate()))}
                              className="w-7 h-7 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors"
                            >
                              <ChevronDown size={16} className="text-amber-600" />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-0.5 text-center">
                            {Array.from({ length: new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate() }).map((_, dayIndex) => {
                              const day = dayIndex + 1
                              const firstDayOfMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay()
                              const isPast = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
                              const isToday = day === new Date().getDate() && pickerDate.getMonth() === new Date().getMonth() && pickerDate.getFullYear() === new Date().getFullYear()
                              const isSelected = pickerDate.getDate() === day && pickerDate.getMonth() === new Date().getMonth() && pickerDate.getFullYear() === new Date().getFullYear()
                              const isEmpty = dayIndex < firstDayOfMonth
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    if (isEmpty) return
                                    const d = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day)
                                    setPickerDate(d)
                                    const formatted = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                                    setPickupDate(formatted)
                                  }}
                                  disabled={isEmpty}
                                  className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${isEmpty ? 'invisible' : isToday ? 'bg-amber-600 text-white' : isSelected ? 'bg-amber-600 text-white' : isPast ? 'text-stone-300' : 'text-stone-700 hover:bg-amber-50'}`}
                                >
                                  {day}
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowDatePicker(false)}
                              className="flex-1 py-2 rounded-xl border border-[#eae5dd] text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowDatePicker(false); setPickerView('time') }}
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-semibold hover:from-amber-700 hover:to-amber-800 transition-colors shadow-md"
                            >
                              Next: Time →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-stone-900 mb-3 text-center">Select Time</p>
                          <div className="flex justify-center gap-3">
                            <div className="w-24">
                              <p className="text-[10px] font-bold text-stone-400 mb-1.5 text-center">HOURS</p>
                              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto rounded-xl border border-[#eae5dd] p-1">
                                {Array.from({ length: 12 }, (_, i) => {
                                  const h = i + 1
                                  return (
                                    <button
                                      key={h}
                                      type="button"
                                      onClick={() => setPickerHour(h)}
                                      className={`w-full py-1 rounded-lg text-[11px] font-bold transition-all ${pickerHour === h ? 'bg-amber-600 text-white shadow-md' : 'text-stone-600 hover:bg-amber-50'}`}
                                    >
                                      {String(h).padStart(2,'0')}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                            <div className="w-24">
                              <p className="text-[10px] font-bold text-stone-400 mb-1.5 text-center">MINUTES</p>
                              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto rounded-xl border border-[#eae5dd] p-1">
                                {Array.from({ length: 60 }, (_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setPickerMinute(i)}
                                    className={`w-full py-1 rounded-lg text-[11px] font-bold transition-all ${pickerMinute === i ? 'bg-amber-600 text-white shadow-md' : 'text-stone-600 hover:bg-amber-50'}`}
                                  >
                                    {String(i).padStart(2,'0')}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 justify-center">
                              <button
                                type="button"
                                onClick={() => setPickerPeriod('AM')}
                                className={`w-12 h-8 rounded-lg text-[10px] font-bold transition-all ${pickerPeriod === 'AM' ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-amber-50'}`}
                              >
                                AM
                              </button>
                              <button
                                type="button"
                                onClick={() => setPickerPeriod('PM')}
                                className={`w-12 h-8 rounded-lg text-[10px] font-bold transition-all ${pickerPeriod === 'PM' ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-amber-50'}`}
                              >
                                PM
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowDatePicker(false)}
                              className="flex-1 py-2 rounded-xl border border-[#eae5dd] text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const hour24 = pickerPeriod === 'AM' ? (pickerHour === 12 ? 0 : pickerHour) : (pickerHour === 12 ? 12 : pickerHour + 12)
                                const formatted = `${String(pickerDate.getFullYear()).padStart(4,'0')}-${String(pickerDate.getMonth()+1).padStart(2,'0')}-${String(pickerDate.getDate()).padStart(2,'0')}T${String(hour24).padStart(2,'0')}:${String(pickerMinute).padStart(2,'0')}`
                                setPickupDate(formatted)
                                setShowDatePicker(false)
                              }}
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-semibold hover:from-amber-700 hover:to-amber-800 transition-colors shadow-md"
                            >
                              ✓ Confirm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-5 border-t border-[#eae5dd] pt-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="flex items-center gap-2 text-base font-bold">
                  <Phone size={18} /> Mobile Number <span className="text-[#b94a43]">*</span>
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+880 1XXXXXXXXX"
                  className="mt-3 w-full rounded-xl border border-[#eae5dd] bg-white px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
              <div className="flex flex-wrap gap-2">
                {['One Way', 'Round Way', 'Hourly'].map((item) => (
                  <button key={item} type="button" onClick={() => setTripType(item)} className={`rounded-lg px-4 py-3 text-sm font-bold cursor-pointer bg-stone-100 text-[#2c2a27] hover:bg-stone-200`}>
                    <span className={`mr-2 inline-block size-5 align-[-5px] rounded-full ${tripType === item ? 'bg-amber-600' : 'bg-transparent border-[3px] border-[#dfe1e3]'}`} /> {item}
                  </button>
                ))}
              </div>
              <button type="submit" className="flex items-center justify-center gap-6 rounded-xl bg-amber-600 px-8 py-4 text-base font-bold text-white transition hover:bg-amber-700 cursor-pointer shadow-lg hover:shadow-xl">
                Continue <ChevronRight size={24} />
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
