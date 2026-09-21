'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, LoaderCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Car } from '@/lib/store'
import type { LocationResult } from '@/lib/location/types'
import { PickupDropoff } from '@/components/car-rental/PickupDropoff'
import type { BookingLocation } from '@/lib/store'

type BookingTab = 'city' | 'hourly' | 'intercity' | 'airport'
type TripType = 'One Way' | 'Round Trip'
type PickerId = 'car' | 'pickupDate' | 'returnDate' | null

const heroHeadline = 'চালকসহ গাড়ি ভাড়া, ঢাকা ও সারাদেশে'
const carTypes = ['Sedan', 'Noah-Hiace', 'Premio', 'Microbus', 'SUV']
const mobilePattern = /^01[3-9]\d{8}$/
const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
const banglaWeekdays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি']
const banglaDigits = (value: number | string) => String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])

const formatDateLabel = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return `${banglaDigits(date.getDate())} ${banglaMonths[date.getMonth()]} ${banglaDigits(date.getFullYear())}`
}

const formatTimeLabel = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  const hours = date.getHours()
  return `${banglaDigits(hours % 12 || 12)}:${banglaDigits(String(date.getMinutes()).padStart(2, '0'))} ${hours >= 12 ? 'অপরাহ্ণ' : 'পূর্বাহ্ণ'}`
}

const toDateTimeValue = (date: Date, hour: number, minute: number, period: 'AM' | 'PM') => {
  const next = new Date(date)
  let normalizedHour = hour % 12
  if (period === 'PM') normalizedHour += 12
  next.setHours(normalizedHour, minute, 0, 0)
  const offset = next.getTimezoneOffset() * 60000
  return new Date(next.getTime() - offset).toISOString().slice(0, 16)
}

interface FormErrors {
  carType?: string
  pickupLocation?: string
  dropoffLocation?: string
  pickupDate?: string
  returnDate?: string
  customerName?: string
  mobileNumber?: string
}

const getMinimumDateTime = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 16)
}

function CarPicker({ value, cars, onChange, error, open, onOpenChange }: { value: string; cars: Car[]; onChange: (value: string) => void; error?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const availableCars = cars.filter((car) => car.published !== false)

  return (
    <div className="relative text-sm font-bold text-stone-800">
      <span>গাড়ির ধরন <span className="text-red-500">*</span></span>
      <button type="button" onClick={() => onOpenChange(!open)} className={`mt-2 flex min-h-12 w-full cursor-pointer items-center justify-between rounded-2xl border bg-white px-3 text-left font-normal shadow-[0_3px_8px_rgba(50,44,35,.06)] ${error ? 'border-red-400' : 'border-[#eae5dd]'}`}>
        <span className={value ? 'font-semibold text-stone-800' : 'text-stone-400'}>{value || 'গাড়ি বেছে নিন'}</span>
        <ChevronDown size={20} className={`text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#eae5dd] bg-white p-2 shadow-[0_18px_35px_rgba(50,44,35,.18)]">
          {availableCars.length > 0 ? availableCars.map((car) => (
            <button key={car.id} type="button" onClick={() => { onChange(car.category); onOpenChange(false) }} className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition hover:bg-amber-50">
              <img src={car.image} alt={`${car.brand} ${car.model}`} className="size-14 rounded-lg bg-stone-100 object-cover" />
              <span className="min-w-0"><span className="block truncate font-bold text-stone-800">{car.brand} {car.model}</span><span className="block text-xs font-normal text-stone-500">{car.category} · {banglaDigits(car.seats)} সিট · {car.hasAc ? 'এসি' : 'নন-এসি'}</span></span>
            </button>
          )) : carTypes.map((type) => <button key={type} type="button" onClick={() => { onChange(type); onOpenChange(false) }} className="block w-full cursor-pointer rounded-xl px-3 py-3 text-left font-bold text-stone-800 hover:bg-amber-50">{type}</button>)}
        </div>
      )}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </div>
  )
}

function DateTimePicker({ label, value, onChange, error, min, open, onOpenChange }: { label: string; value: string; onChange: (value: string) => void; error?: string; min?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = useState<'date' | 'time'>('date')
  const initialDate = value ? new Date(value) : new Date()
  const [month, setMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [hour, setHour] = useState(initialDate.getHours() % 12 || 12)
  const [minute, setMinute] = useState(initialDate.getMinutes())
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialDate.getHours() >= 12 ? 'PM' : 'AM')
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const minimum = min ? new Date(min) : new Date()
  const commit = (date: Date, nextHour = hour, nextMinute = minute, nextPeriod = period) => onChange(toDateTimeValue(date, nextHour, nextMinute, nextPeriod))

  return (
    <div className="relative text-sm font-bold text-stone-800">
      <span>{label} <span className="text-red-500">*</span></span>
      <button type="button" onClick={() => onOpenChange(!open)} className={`mt-2 flex min-h-12 w-full cursor-pointer items-center justify-between rounded-2xl border bg-white px-4 text-left font-normal shadow-[0_3px_8px_rgba(50,44,35,.06)] ${error ? 'border-red-400' : 'border-[#eae5dd]'}`}>
        <span className={value ? 'font-semibold text-stone-800' : 'text-stone-400'}>{value ? `${formatDateLabel(value)} · ${formatTimeLabel(value)}` : 'তারিখ ও সময় বেছে নিন'}</span>
        <CalendarDays size={19} className="text-stone-400" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-3xl border border-[#eae5dd] bg-white shadow-[0_18px_35px_rgba(50,44,35,.2)]">
          <div className="grid grid-cols-2 border-b border-[#eae5dd]">
            {([['date', 'তারিখ'], ['time', 'সময়']] as const).map(([key, text]) => <button key={key} type="button" onClick={() => setTab(key)} className={`cursor-pointer border-b-2 px-3 py-3 font-bold ${tab === key ? 'border-amber-600 text-amber-600' : 'border-transparent text-stone-500'}`}>{text}</button>)}
          </div>
          {tab === 'date' ? (
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between"><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="cursor-pointer text-amber-600"><ChevronLeft size={20} /></button><span className="font-bold">{banglaMonths[month.getMonth()]} {banglaDigits(month.getFullYear())}</span><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="cursor-pointer text-amber-600"><ChevronRight size={20} /></button></div>
              <div className="mb-2 grid grid-cols-7 text-center text-[11px] text-stone-400">{banglaWeekdays.map((day) => <span key={day}>{day}</span>)}</div>
              <div className="grid grid-cols-7 gap-y-1 text-center">{Array.from({ length: firstDay }).map((_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => { const date = new Date(month.getFullYear(), month.getMonth(), day); const disabled = date < new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate()); const selected = selectedDate.toDateString() === date.toDateString(); return <button key={day} type="button" disabled={disabled} onClick={() => { setSelectedDate(date); commit(date); setTab('time') }} className={`mx-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-sm ${selected ? 'bg-amber-600 font-bold text-white' : disabled ? 'cursor-not-allowed text-stone-300' : 'text-stone-700 hover:bg-amber-50'}`}>{banglaDigits(day)}</button> })}</div>
            </div>
          ) : (
            <div className="p-4"><div className="mb-3 flex items-center gap-2 text-stone-500"><Clock3 size={17} /><span className="font-bold text-stone-800">সময় বেছে নিন</span></div><div className="grid grid-cols-[1fr_1fr_auto] gap-2"><TimeColumn title="ঘণ্টা" values={Array.from({ length: 12 }, (_, index) => index + 1)} selected={hour} onSelect={(next) => { setHour(next); commit(selectedDate, next, minute, period) }} /><TimeColumn title="মিনিট" values={[0, 15, 30, 45]} selected={minute} onSelect={(next) => { setMinute(next); commit(selectedDate, hour, next, period) }} /><div className="space-y-2 pt-6">{(['AM', 'PM'] as const).map((nextPeriod) => <button key={nextPeriod} type="button" onClick={() => { setPeriod(nextPeriod); commit(selectedDate, hour, minute, nextPeriod) }} className={`block w-16 rounded-xl px-2 py-3 text-xs font-bold ${period === nextPeriod ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-100 text-stone-600'}`}>{nextPeriod}</button>)}</div></div></div>
          )}
          <div className="flex gap-2 border-t border-[#eae5dd] p-3"><button type="button" onClick={() => onOpenChange(false)} className="flex-1 cursor-pointer rounded-2xl border border-[#eae5dd] py-2 font-bold text-stone-600">বাতিল</button><button type="button" onClick={() => { if (tab === 'date') setTab('time'); else onOpenChange(false) }} className="flex-1 cursor-pointer rounded-2xl bg-amber-600 py-2 font-bold text-white">{tab === 'date' ? 'পরবর্তী: সময় →' : '✓ নিশ্চিত'}</button></div>
        </div>
      )}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </div>
  )
}

function TimeColumn({ title, values, selected, onSelect }: { title: string; values: number[]; selected: number; onSelect: (value: number) => void }) {
  return <div><p className="mb-2 text-center text-xs font-bold text-stone-400">{title}</p><div className="max-h-36 overflow-y-auto rounded-2xl border border-[#eae5dd] p-1">{values.map((value) => <button key={value} type="button" onClick={() => onSelect(value)} className={`block w-full cursor-pointer rounded-xl py-2 text-sm font-bold ${selected === value ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-amber-50'}`}>{banglaDigits(String(value).padStart(2, '0'))}</button>)}</div></div>
}

export function Hero() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BookingTab>('city')
  const [tripType, setTripType] = useState<TripType>('One Way')
  const [carType, setCarType] = useState('')
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [pickupLocation, setPickupLocation] = useState<LocationResult | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<LocationResult | null>(null)
  const [distanceKm, setDistanceKm] = useState(0)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [cars, setCars] = useState<Car[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openPicker, setOpenPicker] = useState<PickerId>(null)
  const heroCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/cars')
      .then((response) => response.json())
      .then((data: Car[]) => setCars(data))
      .catch(() => toast.error('গাড়ির তালিকা লোড করা যায়নি'))
  }, [])

  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      if (heroCardRef.current && !heroCardRef.current.contains(event.target as Node)) setOpenPicker(null)
    }
    document.addEventListener('pointerdown', handleOutsidePointer)
    return () => document.removeEventListener('pointerdown', handleOutsidePointer)
  }, [])

  useEffect(() => {
    const handleCarBooking = (event: Event) => {
      const car = (event as CustomEvent<Car>).detail
      if (!car) return
      setSelectedCar(car)
      setCarType(carTypes.find((type) => `${car.brand} ${car.model}`.toLowerCase().includes(type.toLowerCase())) ?? 'Sedan')
    }

    window.addEventListener('car-booking:selected', handleCarBooking)
    return () => window.removeEventListener('car-booking:selected', handleCarBooking)
  }, [])

  const isHourly = activeTab === 'hourly'
  const isIntercity = activeTab === 'intercity'
  const isAirport = activeTab === 'airport'
  const isRoundTrip = isIntercity && tripType === 'Round Trip'

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    if (!carType) nextErrors.carType = 'গাড়ির ধরন নির্বাচন করুন'
    if (!pickupLocation || !pickupLocation.latitude || !pickupLocation.longitude) nextErrors.pickupLocation = 'পিকআপ লোকেশন দিন'
    if (!isHourly && (!dropoffLocation || !dropoffLocation.latitude || !dropoffLocation.longitude)) nextErrors.dropoffLocation = 'ড্রপ-অফ লোকেশন দিন'
    if (!pickupDate) nextErrors.pickupDate = 'তারিখ ও সময় নির্বাচন করুন'
    if (isRoundTrip && (!returnDate || new Date(returnDate).getTime() < new Date(pickupDate).getTime())) {
      nextErrors.returnDate = 'ফেরার সময় পিকআপের সময়ের পরে হতে হবে'
    }
    if (!customerName.trim()) nextErrors.customerName = 'আপনার নাম লিখুন'
    if (!mobilePattern.test(mobileNumber)) nextErrors.mobileNumber = 'সঠিক ১১ সংখ্যার বাংলাদেশি নম্বর দিন'
    return nextErrors
  }

  const updateField = <K extends keyof FormErrors>(field: K, value: string) => {
    if (field === 'carType') {
      setCarType(value)
      const matchingCar = cars.find((car) => {
        const label = `${car.brand} ${car.model}`.toLowerCase()
        return label.includes(value.toLowerCase()) || car.category.toLowerCase() === value.toLowerCase()
      })
      setSelectedCar(matchingCar ?? cars[0] ?? null)
    }
    if (field === 'pickupDate') setPickupDate(value)
    if (field === 'returnDate') setReturnDate(value)
    if (field === 'customerName') setCustomerName(value)
    if (field === 'mobileNumber') setMobileNumber(value.replace(/\D/g, '').slice(0, 11))

    const nextErrors = { ...errors }
    const fieldError =
      field === 'carType' && !value
        ? 'গাড়ির ধরন নির্বাচন করুন'
        : field === 'pickupLocation' && !value
          ? 'পিকআপ লোকেশন দিন'
          : field === 'dropoffLocation' && !value && !isHourly
            ? 'ড্রপ-অফ লোকেশন দিন'
            : field === 'pickupDate' && (!value || new Date(value).getTime() < Date.now())
              ? 'বর্তমান বা ভবিষ্টের তারিখ নির্বাচন করুন'
                : field === 'returnDate' && isRoundTrip && (!value || new Date(value).getTime() < new Date(pickupDate).getTime())
                  ? 'ফেরার সময় পিকআপের সময়ের পরে হতে হবে'
              : field === 'customerName' && !value.trim()
                ? 'আপনার নাম লিখুন'
                : field === 'mobileNumber' && !mobilePattern.test(value.replace(/\D/g, ''))
                  ? 'সঠিক ১১ সংখ্যার বাংলাদেশি নম্বর দিন'
                  : undefined

    if (fieldError) nextErrors[field] = fieldError
    else delete nextErrors[field]
    setErrors(nextErrors)
  }

  const handleTabChange = (tab: BookingTab) => {
    setOpenPicker(null)
    setActiveTab(tab)
    setErrors({})
    if (tab !== 'intercity') setTripType('One Way')
    if (tab !== 'intercity') setReturnDate('')
    if (tab === 'hourly') setDropoffLocation(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const pickupBookingLocation: BookingLocation | string = pickupLocation
        ? { name: pickupLocation.name, latitude: pickupLocation.latitude, longitude: pickupLocation.longitude }
        : ''
      const dropoffBookingLocation: BookingLocation | string = dropoffLocation
        ? { name: dropoffLocation.name, latitude: dropoffLocation.latitude, longitude: dropoffLocation.longitude }
        : ''

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCar?.id ?? 0,
          carName: selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : carType,
          carType,
          customerName: customerName.trim(),
          mobileNumber,
          pickupLocation: pickupBookingLocation,
          dropoffLocation: isHourly ? '' : dropoffBookingLocation,
          pickupDate,
          dropoffDate: isRoundTrip ? returnDate : '',
          tripType: isIntercity ? tripType : 'One Way',
          distanceKm: distanceKm || undefined,
          durationMinutes: durationMinutes || undefined,
        }),
      })

      if (!response.ok) {
        const result = (await response.json()) as { error?: string }
        toast.error(result.error ?? 'বুকিং পাঠানো যায়নি')
        return
      }

      router.push('/thank-you')
    } catch {
      toast.error('ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (field: keyof FormErrors) => `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 ${errors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-[#eae5dd]'}`

  return (
    <section id="hero" className="relative z-20 bg-[#f3f1ed] pb-12 pt-24 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-345 px-3 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <h1 aria-label={heroHeadline} className="font-serif text-4xl font-bold leading-tight text-[#282622] sm:text-6xl">
            <span className="bg-linear-to-r from-[#FFB020] via-[#E08E00] to-[#16365C] bg-clip-text text-transparent">{heroHeadline}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-muted sm:text-xl">
            ফিক্সড প্রাইস, কোনো হিডেন চার্জ নেই। ফর্ম পূরণ করুন, <span className="font-bold text-brand-navy">১০ মিনিটে আমরা কল করবো।</span>
          </p>
        </div>

        <div ref={heroCardRef} className="relative z-10 overflow-visible rounded-2xl border border-[#eae5dd] bg-[#fffdfb] shadow-[0_16px_42px_rgba(50,44,35,.12)]">
          <div className="grid grid-cols-2 border-b border-[#eae5dd] sm:grid-cols-4">
            {([['city', 'সিটি'], ['hourly', 'আওয়ারলি'], ['intercity', 'ইন্টারসিটি'], ['airport', 'এয়ারপোর্ট']] as const).map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => handleTabChange(tab)} className={`cursor-pointer px-3 py-4 text-sm font-bold transition sm:px-5 sm:text-base ${activeTab === tab ? 'bg-brand-navy text-white' : 'text-brand-muted hover:bg-brand-surface'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="relative z-10 p-4 sm:p-7 lg:p-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <CarPicker value={carType} cars={cars} onChange={(value) => updateField('carType', value)} error={errors.carType} open={openPicker === 'car'} onOpenChange={(open) => setOpenPicker(open ? 'car' : null)} />

              <div className="lg:col-span-2">
                <PickupDropoff
                  pickupLocation={pickupLocation}
                  setPickupLocation={setPickupLocation}
                  dropoffLocation={dropoffLocation}
                  setDropoffLocation={setDropoffLocation}
                  pickupError={errors.pickupLocation}
                  dropoffError={errors.dropoffLocation}
                  isHourly={isHourly}
                  isAirport={isAirport}
                  onRouteChange={(dk, dm) => { setDistanceKm(dk); setDurationMinutes(dm) }}
                />
              </div>

              <DateTimePicker label="তারিখ ও সময়" min={getMinimumDateTime()} value={pickupDate} onChange={(value) => updateField('pickupDate', value)} error={errors.pickupDate} open={openPicker === 'pickupDate'} onOpenChange={(open) => setOpenPicker(open ? 'pickupDate' : null)} />

              {isRoundTrip && (
                <DateTimePicker label="ফেরার তারিখ ও সময়" min={pickupDate || getMinimumDateTime()} value={returnDate} onChange={(value) => updateField('returnDate', value)} error={errors.returnDate} open={openPicker === 'returnDate'} onOpenChange={(open) => setOpenPicker(open ? 'returnDate' : null)} />
              )}

              <label className="text-sm font-bold text-stone-800">
                আপনার নাম <span className="text-red-500">*</span>
                <input type="text" value={customerName} onChange={(event) => updateField('customerName', event.target.value)} placeholder="আপনার নাম লিখুন" className={inputClass('customerName')} />
                {errors.customerName && <span className="mt-1 block text-xs font-medium text-red-600">{errors.customerName}</span>}
              </label>

              <label className="text-sm font-bold text-stone-800">
                মোবাইল নম্বর <span className="text-red-500">*</span>
                <input type="tel" inputMode="numeric" pattern="01[3-9][0-9]{8}" value={mobileNumber} onChange={(event) => updateField('mobileNumber', event.target.value)} placeholder="01XXXXXXXXX" className={inputClass('mobileNumber')} />
                {errors.mobileNumber && <span className="mt-1 block text-xs font-medium text-red-600">{errors.mobileNumber}</span>}
              </label>
            </div>

            {isIntercity && (
              <fieldset className="mt-6">
                <legend className="text-sm font-bold text-stone-800">ট্রিপ টাইপ <span className="text-red-500">*</span></legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(['One Way', 'Round Trip'] as const).map((type) => (
                    <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${tripType === type ? 'border-brand-navy bg-blue-50 text-brand-navy' : 'border-[#eae5dd] text-brand-muted'}`}>
                      <input type="radio" name="tripType" value={type} checked={tripType === type} onChange={() => setTripType(type)} className="accent-brand-navy" />
                      {type === 'One Way' ? 'ওয়ান ওয়ে' : 'রাউন্ড ট্রিপ'}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mt-7 border-t border-[#eae5dd] pt-6">
              <button type="submit" disabled={isSubmitting} className="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 lg:mx-auto lg:w-72">
                {isSubmitting ? <LoaderCircle className="animate-spin" size={21} /> : <CheckCircle2 size={21} />}
                {isSubmitting ? 'পাঠানো হচ্ছে...' : 'বুকিং কনফার্ম করুন'}
              </button>
              <p className="mx-auto mt-3 max-w-xs rounded-lg bg-brand-surface px-3 py-2 text-center text-[13px] font-semibold leading-5 text-brand-navy sm:max-w-none sm:bg-transparent sm:px-0 sm:py-0">
                অগ্রিম পেমেন্ট লাগবে না -{' '}
                <strong className="whitespace-nowrap font-bold text-brand-navy">১০ মিনিটে</strong> কল ব্যাক
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
