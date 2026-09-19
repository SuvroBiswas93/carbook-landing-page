'use client'

import { useState } from 'react'
import type { ComponentProps } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { Services } from '@/components/Services'
import { CarSlider } from '@/components/CarSlider'
import { Reviews } from '@/components/Reviews'
import { FAQ } from '@/components/FAQ'
import { FareCalculator } from '@/components/FareCalculator'
import { FloatingButtons } from '@/components/FloatingButtons'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { BookingModal } from '@/components/BookingModal'

type BookingFormData = Parameters<
  NonNullable<ComponentProps<typeof Hero>['onContinueClick']>
>[0]

export default function Page() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [pendingBooking, setPendingBooking] = useState<BookingFormData | null>(null)

  const handleContinue = (data: BookingFormData) => {
    setPendingBooking(data)
    setIsBookingModalOpen(true)
  }

  const handleBookConfirm = async (data: BookingFormData): Promise<boolean> => {
    if (!data.car) {
      return false
    }
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
      dropoffDate: data.dropoffDate ?? '',
      tripType: data.tripType,
      }),
    })
    if (!response.ok) return false
    setIsBookingModalOpen(false)
    setPendingBooking(null)
    return true
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero onContinueClick={handleContinue} />
      <CarSlider />
      <FareCalculator />
      <Services />
      
      <Reviews />
      <FAQ />
      <Contact />
     
      <FloatingButtons />
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setPendingBooking(null)
        }}
        bookingData={pendingBooking as ComponentProps<typeof BookingModal>['bookingData']}
        onBookConfirm={handleBookConfirm}
      />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}
