'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  Booking,
  BookingStatus,
  Car as FleetCar,
  Pricing,
  Review,
} from '@/lib/store'

const emptyCar: Omit<FleetCar, 'id'> = {
  brand: '',
  model: '',
  category: '',
  seats: 4,
  hasAc: true,
  transmission: 'automatic',
  fuel: 'petrol',
  pricePerDay: 0,
  pricePerKm: 0,
  description: '',
  image: '',
  published: true,
}

const emptyReview: Omit<Review, 'id' | 'createdAt'> = {
  name: '',
  rating: 5,
  text: '',
  location: '',
  hidden: false,
}

const defaultPricing: Pricing = { farePerKm: 5, minimumFare: 25, currency: 'USD' }

export function useAdminData() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cars, setCars] = useState<FleetCar[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)

  const [editingCar, setEditingCar] = useState<FleetCar | null>(null)
  const [carForm, setCarForm] = useState(emptyCar)

  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [reviewForm, setReviewForm] = useState(emptyReview)

  const [pricingForm, setPricingForm] = useState<Pricing>(defaultPricing)
  const pricingFormInitialized = useRef(false)

  const refresh = async () => {
    const [bookingRes, carRes, reviewRes, pricingRes] = await Promise.all([
      fetch('/api/bookings'),
      fetch('/api/cars?admin=1'),
      fetch('/api/reviews?admin=1'),
      fetch('/api/pricing'),
    ])

    setBookings(await bookingRes.json())
    setCars(await carRes.json())
    setReviews(await reviewRes.json())

    const currentPricing = (await pricingRes.json()) as Pricing
    setPricing(currentPricing)

    if (!pricingFormInitialized.current) {
      setPricingForm(currentPricing)
      pricingFormInitialized.current = true
    }
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [])

  const resetCarForm = () => {
    setEditingCar(null)
    setCarForm(emptyCar)
  }

  const startEditCar = (car: FleetCar) => {
    setEditingCar(car)
    setCarForm({ ...car })
  }

  const saveCar = async () => {
    await fetch(editingCar ? `/api/cars/${editingCar.id}` : '/api/cars', {
      method: editingCar ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carForm),
    })
    resetCarForm()
    refresh()
  }

  const deleteCar = async (id: number) => {
    await fetch(`/api/cars/${id}`, { method: 'DELETE' })
    refresh()
  }

  const toggleCar = async (car: FleetCar) => {
    await fetch(`/api/cars/${car.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...car, published: !car.published }),
    })
    refresh()
  }

  const resetReviewForm = () => {
    setEditingReview(null)
    setReviewForm(emptyReview)
  }

  const startEditReview = (review: Review) => {
    setEditingReview(review)
    setReviewForm({ ...review })
  }

  const saveReview = async () => {
    if (!editingReview) return
    await fetch(`/api/reviews/${editingReview.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm),
    })
    resetReviewForm()
    refresh()
  }

  const deleteReview = async (id: number) => {
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    refresh()
  }

  const toggleReview = async (review: Review) => {
    await fetch(`/api/reviews/${review.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...review, hidden: !review.hidden }),
    })
    refresh()
  }

  const savePricing = async () => {
    const response = await fetch('/api/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pricingForm),
    })
    if (!response.ok) return
    const savedPricing = (await response.json()) as Pricing
    setPricing(savedPricing)
    setPricingForm(savedPricing)
  }

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    )
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) refresh()
    } catch {
      refresh()
    }
  }

  return {
    bookings,
    cars,
    reviews,
    pricing,
    editingCar,
    carForm,
    setCarForm,
    startEditCar,
    resetCarForm,
    saveCar,
    deleteCar,
    toggleCar,
    editingReview,
    reviewForm,
    setReviewForm,
    startEditReview,
    resetReviewForm,
    saveReview,
    deleteReview,
    toggleReview,
    pricingForm,
    setPricingForm,
    savePricing,
    updateBookingStatus,
  }
}

export type AdminData = ReturnType<typeof useAdminData>