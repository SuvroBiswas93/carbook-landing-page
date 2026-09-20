'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CarFront, CheckCircle2, LoaderCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import locationsData from '@/data/locations.json'
import type { Car } from '@/lib/store'

type BookingTab = 'city' | 'hourly' | 'intercity' | 'airport'
type TripType = 'One Way' | 'Round Trip'

const heroHeadline = 'চালকসহ গাড়ি ভাড়া, ঢাকা ও সারাদেশে'
const carTypes = ['Sedan', 'Noah-Hiace', 'Premio', 'Microbus', 'SUV']
const mobilePattern = /^01[3-9]\d{8}$/

interface FormErrors {
  carType?: string
  pickupLocation?: string
  dropoffLocation?: string
  pickupDate?: string
  customerName?: string
  mobileNumber?: string
}

const getMinimumDateTime = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 16)
}

export function Hero() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BookingTab>('city')
  const [tripType, setTripType] = useState<TripType>('One Way')
  const [carType, setCarType] = useState('')
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [cars, setCars] = useState<Car[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/cars')
      .then((response) => response.json())
      .then((data: Car[]) => setCars(data))
      .catch(() => toast.error('গাড়ির তালিকা লোড করা যায়নি'))
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

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    if (!carType) nextErrors.carType = 'গাড়ির ধরন নির্বাচন করুন'
    if (!pickupLocation) nextErrors.pickupLocation = 'পিকআপ লোকেশন দিন'
    if (!isHourly && !dropoffLocation) nextErrors.dropoffLocation = 'ড্রপ-অফ লোকেশন দিন'
    if (!pickupDate) nextErrors.pickupDate = 'তারিখ ও সময় নির্বাচন করুন'
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
    if (field === 'pickupLocation') setPickupLocation(value)
    if (field === 'dropoffLocation') setDropoffLocation(value)
    if (field === 'pickupDate') setPickupDate(value)
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
              ? 'বর্তমান বা ভবিষ্যতের তারিখ নির্বাচন করুন'
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
    setActiveTab(tab)
    setErrors({})
    if (tab !== 'intercity') setTripType('One Way')
    if (tab === 'hourly') setDropoffLocation('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCar?.id ?? 0,
          carName: selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : carType,
          carType,
          customerName: customerName.trim(),
          mobileNumber,
          pickupLocation,
          dropoffLocation: isHourly ? '' : dropoffLocation,
          pickupDate,
          tripType: isIntercity ? tripType : 'One Way',
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
    <section id="hero" className="bg-[#f3f1ed] pb-12 pt-24 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-345 px-3 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <h1 aria-label={heroHeadline} className="font-serif text-4xl font-bold leading-tight text-[#282622] sm:text-6xl">
            <span className="bg-linear-to-r from-[#FFB020] via-[#E08E00] to-[#16365C] bg-clip-text text-transparent">{heroHeadline}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-muted sm:text-xl">
            ফিক্সড প্রাইস, কোনো হিডেন চার্জ নেই। ফর্ম পূরণ করুন, <span className="font-bold text-brand-navy">১০ মিনিটে আমরা কল করবো।</span>
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#eae5dd] bg-[#fffdfb] shadow-[0_16px_42px_rgba(50,44,35,.12)]">
          <div className="grid grid-cols-2 border-b border-[#eae5dd] sm:grid-cols-4">
            {([['city', 'সিটি'], ['hourly', 'আওয়ারলি'], ['intercity', 'ইন্টারসিটি'], ['airport', 'এয়ারপোর্ট']] as const).map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => handleTabChange(tab)} className={`cursor-pointer px-3 py-4 text-sm font-bold transition sm:px-5 sm:text-base ${activeTab === tab ? 'bg-brand-navy text-white' : 'text-brand-muted hover:bg-brand-surface'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-7 lg:p-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-bold text-stone-800">
                গাড়ির ধরন <span className="text-red-500">*</span>
                <select value={carType} onChange={(event) => updateField('carType', event.target.value)} className={inputClass('carType')}>
                  <option value="">গাড়ি বেছে নিন</option>
                  {carTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                {errors.carType && <span className="mt-1 block text-xs font-medium text-red-600">{errors.carType}</span>}
              </label>

              <label className="text-sm font-bold text-stone-800">
                পিকআপ লোকেশন <span className="text-red-500">*</span>
                <input list="pickup-locations" type="text" value={pickupLocation} onChange={(event) => updateField('pickupLocation', event.target.value)} placeholder="যেখান থেকে উঠবেন" className={inputClass('pickupLocation')} />
                <datalist id="pickup-locations">
                  {locationsData.map((location) => <option key={location.id} value={location.name} />)}
                </datalist>
                {errors.pickupLocation && <span className="mt-1 block text-xs font-medium text-red-600">{errors.pickupLocation}</span>}
              </label>

              {!isHourly && (
                <label className="text-sm font-bold text-stone-800">
                  {isAirport ? 'এয়ারপোর্টে ড্রপ-অফ' : 'ড্রপ-অফ লোকেশন'} <span className="text-red-500">*</span>
                  {isIntercity || isAirport ? (
                    <select value={dropoffLocation} onChange={(event) => updateField('dropoffLocation', event.target.value)} className={inputClass('dropoffLocation')}>
                      <option value="">ড্রপ-অফ লোকেশন বেছে নিন</option>
                      {locationsData.map((location) => <option key={location.id} value={location.name}>{location.name}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={dropoffLocation} onChange={(event) => updateField('dropoffLocation', event.target.value)} placeholder="যেখানে যাবেন" className={inputClass('dropoffLocation')} />
                  )}
                  {errors.dropoffLocation && <span className="mt-1 block text-xs font-medium text-red-600">{errors.dropoffLocation}</span>}
                </label>
              )}

              <label className="text-sm font-bold text-stone-800">
                তারিখ ও সময় <span className="text-red-500">*</span>
                <input type="datetime-local" min={getMinimumDateTime()} value={pickupDate} onChange={(event) => updateField('pickupDate', event.target.value)} className={inputClass('pickupDate')} />
                {errors.pickupDate && <span className="mt-1 block text-xs font-medium text-red-600">{errors.pickupDate}</span>}
              </label>

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
