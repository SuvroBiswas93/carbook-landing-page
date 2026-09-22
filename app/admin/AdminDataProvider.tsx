'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { toast } from 'react-toastify'
import { apiFetch, redirectToLogin } from '@/lib/apiClient'
import type {
  Booking,
  BookingStatus,
  Car as FleetCar,
  CarTypePricing,
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

const defaultPricing: Pricing = { currency: 'BDT', carTypes: [] }

const POLL_INTERVAL = 15000

export interface AdminData {
  bookings: Booking[]
  cars: FleetCar[]
  reviews: Review[]
  pricing: Pricing
  editingCar: FleetCar | null
  carForm: Omit<FleetCar, 'id'>
  setCarForm: React.Dispatch<React.SetStateAction<Omit<FleetCar, 'id'>>>
  startEditCar: (car: FleetCar) => void
  resetCarForm: () => void
  saveCar: () => Promise<boolean>
  deleteCar: (id: number) => Promise<void>
  toggleCar: (car: FleetCar) => Promise<void>
  editingReview: Review | null
  reviewForm: Omit<Review, 'id' | 'createdAt'>
  setReviewForm: React.Dispatch<React.SetStateAction<Omit<Review, 'id' | 'createdAt'>>>
  startEditReview: (review: Review) => void
  resetReviewForm: () => void
  saveReview: () => Promise<void>
  deleteReview: (id: number) => Promise<void>
  toggleReview: (review: Review) => Promise<void>
  pricingForm: Pricing
  setPricingForm: React.Dispatch<React.SetStateAction<Pricing>>
  savePricing: () => Promise<void>
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>
  deleteBooking: (id: string) => Promise<void>
  refresh: () => Promise<void>
  loading: boolean
}

const AdminContext = createContext<AdminData | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cars, setCars] = useState<FleetCar[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
  const [loading, setLoading] = useState(true)

  const [editingCar, setEditingCar] = useState<FleetCar | null>(null)
  const [carForm, setCarForm] = useState(emptyCar)

  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [reviewForm, setReviewForm] = useState(emptyReview)

  const [pricingForm, setPricingForm] = useState<Pricing>(defaultPricing)

  const pricingFormInitialized = useRef(false)
  const refreshingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    try {
      if (
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin/login')
      ) {
        return
      }
      const responses = await Promise.all([
        apiFetch('/api/bookings'),
        apiFetch('/api/cars?admin=1'),
        apiFetch('/api/reviews?admin=1'),
        apiFetch('/api/pricing'),
      ])
      const [bookingRes, carRes, reviewRes, pricingRes] = responses

      if (responses.some((response) => response.status === 401)) {
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/admin/login')
        ) {
          redirectToLogin()
        }
        return
      }

      if (!responses.every((response) => response.ok)) {
        // Keep existing data on failure so routes never appear to hang.
        return
      }

      const [bookingData, carData, reviewData, pricingData] = await Promise.all([
        bookingRes.json(),
        carRes.json(),
        reviewRes.json(),
        pricingRes.json(),
      ])

      if (Array.isArray(bookingData)) setBookings(bookingData)
      if (Array.isArray(carData)) setCars(carData)
      if (Array.isArray(reviewData)) setReviews(reviewData)

      const currentPricing = pricingData as Pricing
      if (currentPricing && typeof currentPricing === 'object') {
        setPricing(currentPricing)

        if (!pricingFormInitialized.current) {
          setPricingForm(currentPricing)
          pricingFormInitialized.current = true
        }
      }
    } catch {
      // Keep existing data on failure so routes never appear to hang.
    } finally {
      refreshingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const poll = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const intervalId = window.setInterval(poll, POLL_INTERVAL)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [refresh])

  const resetCarForm = () => {
    setEditingCar(null)
    setCarForm(emptyCar)
  }

  const startEditCar = (car: FleetCar) => {
    setEditingCar(car)
    setCarForm({ ...car })
  }

  const saveCar = async (): Promise<boolean> => {
    try {
      const response = await apiFetch(
        editingCar ? `/api/cars/${editingCar.id}` : '/api/cars',
        {
          method: editingCar ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carForm),
        }
      )
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        toast.error(data?.error ?? 'Car could not be saved. Please try again.')
        return false
      }
      const wasEditing = Boolean(editingCar)
      resetCarForm()
      await refresh()
      toast.success(wasEditing ? 'Car updated.' : 'Car added.')
      return true
    } catch {
      toast.error('Network error. Car was not saved.')
      return false
    }
  }

  const deleteCar = async (id: number) => {
    await apiFetch(`/api/cars/${id}`, { method: 'DELETE' })
    refresh()
  }

  const toggleCar = async (car: FleetCar) => {
    await apiFetch(`/api/cars/${car.id}`, {
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
    await apiFetch(`/api/reviews/${editingReview.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm),
    })
    resetReviewForm()
    refresh()
  }

  const deleteReview = async (id: number) => {
    await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' })
    refresh()
  }

  const toggleReview = async (review: Review) => {
    await apiFetch(`/api/reviews/${review.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...review, hidden: !review.hidden }),
    })
    refresh()
  }

  const savePricing = async () => {
    const carTypes: CarTypePricing[] = Array.from(
      new Map(
        pricingForm.carTypes
          .map((item) => ({ ...item, carType: item.carType.trim() }))
          .filter((item) => item.carType)
          .map((item) => [item.carType, item] as const)
      ).values()
    )

    try {
      const response = await apiFetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pricingForm, carTypes }),
      })
      if (!response.ok) {
        toast.error('Pricing could not be saved. Please try again.')
        return
      }
      const savedPricing = (await response.json()) as Pricing
      setPricing(savedPricing)
      setPricingForm(savedPricing)
      toast.success('Pricing saved successfully.')
    } catch {
      toast.error('Network error. Pricing was not saved.')
    }
  }

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    )
    try {
      const response = await apiFetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) refresh()
    } catch {
      refresh()
    }
  }

  const deleteBooking = async (id: string) => {
    setBookings((current) =>
      current.filter((booking) => booking.id !== id)
    )
    try {
      const response = await apiFetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (!response.ok) refresh()
    } catch {
      refresh()
    }
  }

  const value: AdminData = {
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
    deleteBooking,
    refresh,
    loading,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdminData(): AdminData {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdminData must be used within <AdminDataProvider>')
  }
  return context
}