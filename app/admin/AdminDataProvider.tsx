'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'react-toastify'
import { apiFetch, redirectToLogin } from '@/lib/apiClient'
import type {
  Booking,
  BookingStatus,
  Car as FleetCar,
  Review,
} from '@/lib/types'
import { sortReviewsNewestFirst } from '@/lib/types'

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

const POLL_INTERVAL = 15000
const CACHE_KEY = 'tb_admin_cache_v2'
const CACHE_TTL_MS = 30000 // Show stale immediately, refresh in background if older than 30s
const MIN_REFRESH_INTERVAL = 5000 // Throttle refresh to at most every 5s
const SERVER_SNAPSHOT_URL = '/api/admin/data'

export interface AdminData {
  bookings: Booking[]
  cars: FleetCar[]
  reviews: Review[]
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
  saveCarPricing: (
    updates: Array<{ id: number; pricePerDay: number; pricePerKm: number }>
  ) => Promise<boolean>
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>
  deleteBooking: (id: string) => Promise<void>
  refresh: () => Promise<void>
  loading: boolean
}

const AdminContext = createContext<AdminData | null>(null)

interface CachedSnapshot {
  bookings: Booking[]
  cars: FleetCar[]
  reviews: Review[]
  timestamp: number
}

function loadCache(): CachedSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedSnapshot
    if (!parsed.timestamp || !Array.isArray(parsed.bookings)) return null
    // Expire cache after 10 minutes max
    if (Date.now() - parsed.timestamp > 10 * 60 * 1000) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveCache(data: Omit<CachedSnapshot, 'timestamp'>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: CachedSnapshot = { ...data, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota errors
  }
}

function isCacheStale(cache: CachedSnapshot | null): boolean {
  if (!cache) return true
  return Date.now() - cache.timestamp > CACHE_TTL_MS
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname.startsWith('/admin/login')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [cars, setCars] = useState<FleetCar[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(() => (isLoginPage ? false : true))

  const refreshPromiseRef = useRef<Promise<void> | null>(null)
  const lastFetchRef = useRef<number>(0)
  const hasCacheRef = useRef<boolean>(false)
  const hydratedRef = useRef(false)

  // Hydrate from localStorage cache synchronously after mount for instant render
  // Uses layout effect to apply before paint where possible, avoiding hydration mismatch
  useEffect(() => {
    if (isLoginPage) return
    if (hydratedRef.current) return
    hydratedRef.current = true
    const cache = loadCache()
    if (cache) {
      setBookings(cache.bookings)
      setCars(cache.cars)
      setReviews(sortReviewsNewestFirst(cache.reviews))
      hasCacheRef.current = true
      lastFetchRef.current = cache.timestamp
      setLoading(false)
    }
  }, [isLoginPage])

  const fetchSnapshot = useCallback(async (): Promise<{ bookings: Booking[]; cars: FleetCar[]; reviews: Review[] } | null> => {
    // Try bundled endpoint first - single round trip, server cached
    try {
      const res = await apiFetch(SERVER_SNAPSHOT_URL, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const data = (await res.json()) as {
          bookings: Booking[]
          cars: FleetCar[]
          reviews: Review[]
        }
        if (Array.isArray(data.bookings) && Array.isArray(data.cars) && Array.isArray(data.reviews)) {
          return {
            bookings: data.bookings,
            cars: data.cars,
            reviews: sortReviewsNewestFirst(data.reviews),
          }
        }
      }
      // If snapshot returns 404, fallback to individual fetches (e.g., old server)
      if (res.status !== 404) {
        // For other errors, we still fallback if not ok but not 404, but only if we got 401 we already handled via apiFetch
        // If snapshot failed, try legacy path
        if (!res.ok && res.status !== 401) throw new Error('snapshot failed')
      }
    } catch {
      // Fall through to legacy
    }

    // Legacy fallback: 3 parallel requests
    const responses = await Promise.all([
      apiFetch('/api/bookings'),
      apiFetch('/api/cars?admin=1'),
      apiFetch('/api/reviews?admin=1'),
    ])
    const [bookingRes, carRes, reviewRes] = responses

    if (responses.some((r) => r.status === 401)) {
      if (typeof window !== 'undefined') redirectToLogin()
      return null
    }
    if (!responses.every((r) => r.ok)) {
      return null
    }
    const [bookingData, carData, reviewData] = await Promise.all([
      bookingRes.json(),
      carRes.json(),
      reviewRes.json(),
    ])
    if (!Array.isArray(bookingData) || !Array.isArray(carData) || !Array.isArray(reviewData)) {
      return null
    }
    return {
      bookings: bookingData as Booking[],
      cars: carData as FleetCar[],
      reviews: sortReviewsNewestFirst(reviewData as Review[]),
    }
  }, [])

  const refresh = useCallback(
    async (opts?: { force?: boolean; silent?: boolean }) => {
      if (isLoginPage) return
      const now = Date.now()
      const force = opts?.force ?? false
      const silent = opts?.silent ?? hasCacheRef.current

      // Throttle unless forced
      if (!force && now - lastFetchRef.current < MIN_REFRESH_INTERVAL) {
        // If there's an ongoing refresh, return it; otherwise skip
        if (refreshPromiseRef.current) return refreshPromiseRef.current
        // If cache is fresh, skip background refresh entirely
        const cache = loadCache()
        if (cache && !isCacheStale(cache)) return
      }

      // Dedupe concurrent refreshes
      if (refreshPromiseRef.current) return refreshPromiseRef.current

      const promise = (async () => {
        // Only show loading spinner if we have no data at all
        if (!silent && !hasCacheRef.current) {
          setLoading(true)
        }
        try {
          const data = await fetchSnapshot()
          if (!data) return
          setBookings(data.bookings)
          setCars(data.cars)
          setReviews(data.reviews)
          saveCache(data)
          hasCacheRef.current = true
          lastFetchRef.current = Date.now()
        } catch {
          // Keep stale data on failure
        } finally {
          setLoading(false)
          refreshPromiseRef.current = null
        }
      })()

      refreshPromiseRef.current = promise
      return promise
    },
    [isLoginPage, fetchSnapshot]
  )

  // Exposed refresh without options for compatibility (always throttled but not forced)
  const refreshPublic = useCallback(async () => {
    await refresh({ force: false, silent: hasCacheRef.current })
  }, [refresh])

  // Initial load + polling + visibility handling
  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }

    // Decide initial fetch after hydration
    // Use timeout to let hydration effect complete first
    const initialTimer = setTimeout(() => {
      const cache = loadCache()
      if (!hasCacheRef.current && !cache) {
        refresh({ silent: false, force: true })
      } else if (cache && isCacheStale(cache)) {
        refresh({ silent: true })
      } else if (hasCacheRef.current || cache) {
        // Fresh cache - gentle background refresh after short delay
        setTimeout(() => refresh({ silent: true }), 800)
      }
    }, 50)

    // Polling - always set up
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh({ silent: true })
    }, POLL_INTERVAL)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh({ silent: true })
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Listen for cache updates from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as CachedSnapshot
          if (Array.isArray(parsed.bookings)) {
            setBookings(parsed.bookings)
            setCars(parsed.cars)
            setReviews(sortReviewsNewestFirst(parsed.reviews))
            hasCacheRef.current = true
            lastFetchRef.current = parsed.timestamp
          }
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      clearTimeout(initialTimer)
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('storage', onStorage)
    }
  }, [isLoginPage, refresh])

  // Persist cache on data changes (debounced via effect)
  useEffect(() => {
    if (isLoginPage) return
    if (bookings.length === 0 && cars.length === 0 && reviews.length === 0) return
    // Don't save during initial loading with no cache
    if (loading) return
    saveCache({ bookings, cars, reviews })
  }, [bookings, cars, reviews, isLoginPage, loading])

  // ----- Car editor with optimistic updates -----
  const [editingCar, setEditingCar] = useState<FleetCar | null>(null)
  const [carForm, setCarForm] = useState(emptyCar)

  const resetCarForm = useCallback(() => {
    setEditingCar(null)
    setCarForm(emptyCar)
  }, [])

  const startEditCar = useCallback((car: FleetCar) => {
    setEditingCar(car)
    setCarForm({ ...car })
  }, [])

  const saveCar = useCallback(async (): Promise<boolean> => {
    const isEditing = Boolean(editingCar)
    const optimisticCar: FleetCar = editingCar ? { ...editingCar, ...carForm } : ({ ...carForm, id: Date.now() } as FleetCar)

    // Optimistic update
    if (isEditing && editingCar) {
      setCars((prev) => prev.map((c) => (c.id === editingCar.id ? optimisticCar : c)))
    } else {
      // For new car, optimistically add with temp id, will be replaced via refresh
      setCars((prev) => [...prev, optimisticCar])
    }

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
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        toast.error(data?.error ?? 'Car could not be saved. Please try again.')
        // Rollback on failure
        await refresh({ force: true, silent: true })
        return false
      }
      const wasEditing = Boolean(editingCar)
      resetCarForm()
      // For create, fetch fresh to get real id; for edit optimistic is already applied
      if (!wasEditing) {
        await refresh({ force: true, silent: true })
      }
      toast.success(wasEditing ? 'Car updated.' : 'Car added.')
      return true
    } catch {
      toast.error('Network error. Car was not saved.')
      await refresh({ force: true, silent: true })
      return false
    }
  }, [editingCar, carForm, resetCarForm, refresh])

  const deleteCar = useCallback(
    async (id: number) => {
      const prev = cars
      setCars((cur) => cur.filter((c) => c.id !== id))
      try {
        const res = await apiFetch(`/api/cars/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('delete failed')
        toast.success('Car deleted.')
      } catch {
        setCars(prev)
        toast.error('Could not delete car.')
      }
    },
    [cars]
  )

  const toggleCar = useCallback(
    async (car: FleetCar) => {
      const updated = { ...car, published: !car.published }
      setCars((cur) => cur.map((c) => (c.id === car.id ? updated : c)))
      try {
        const res = await apiFetch(`/api/cars/${car.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...car, published: !car.published }),
        })
        if (!res.ok) throw new Error('toggle failed')
      } catch {
        setCars((cur) => cur.map((c) => (c.id === car.id ? car : c)))
        toast.error('Could not update car.')
      }
    },
    []
  )

  // ----- Review editor with optimistic -----
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [reviewForm, setReviewForm] = useState(emptyReview)

  const resetReviewForm = useCallback(() => {
    setEditingReview(null)
    setReviewForm(emptyReview)
  }, [])

  const startEditReview = useCallback((review: Review) => {
    setEditingReview(review)
    setReviewForm({ ...review })
  }, [])

  const saveReview = useCallback(async (): Promise<void> => {
    if (!editingReview) return
    const optimistic = { ...editingReview, ...reviewForm }
    setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? optimistic : r)))
    try {
      const res = await apiFetch(`/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      })
      if (!res.ok) throw new Error('save failed')
      resetReviewForm()
      toast.success('Review updated.')
    } catch {
      setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? editingReview : r)))
      toast.error('Could not save review.')
    }
  }, [editingReview, reviewForm, resetReviewForm])

  const deleteReview = useCallback(
    async (id: number) => {
      const prev = reviews
      setReviews((cur) => cur.filter((r) => r.id !== id))
      try {
        const res = await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('delete failed')
        toast.success('Review deleted.')
      } catch {
        setReviews(prev)
        toast.error('Could not delete review.')
      }
    },
    [reviews]
  )

  const toggleReview = useCallback(
    async (review: Review) => {
      const updated = { ...review, hidden: !review.hidden }
      setReviews((cur) => cur.map((r) => (r.id === review.id ? updated : r)))
      try {
        const res = await apiFetch(`/api/reviews/${review.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...review, hidden: !review.hidden }),
        })
        if (!res.ok) throw new Error('toggle failed')
      } catch {
        setReviews((cur) => cur.map((r) => (r.id === review.id ? review : r)))
        toast.error('Could not update review.')
      }
    },
    []
  )

  // ----- Pricing -----
  const saveCarPricing = useCallback(
    async (updates: Array<{ id: number; pricePerDay: number; pricePerKm: number }>): Promise<boolean> => {
      // Optimistic: update cars immediately
      const prevCars = cars
      setCars((cur) =>
        cur.map((car) => {
          const upd = updates.find((u) => u.id === car.id)
          return upd ? { ...car, pricePerDay: upd.pricePerDay, pricePerKm: upd.pricePerKm } : car
        })
      )
      try {
        const results = await Promise.all(
          updates.map((update) =>
            apiFetch(`/api/cars/${update.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pricePerDay: update.pricePerDay,
                pricePerKm: update.pricePerKm,
              }),
            })
          )
        )
        const failed = results.find((r) => !r.ok)
        if (failed) {
          const idx = results.indexOf(failed)
          const id = updates[idx]?.id
          toast.error(`Pricing for car #${id} could not be saved.`)
          setCars(prevCars)
          return false
        }
        toast.success('Pricing saved successfully.')
        // Cache already optimistic, save it
        return true
      } catch {
        setCars(prevCars)
        toast.error('Network error. Pricing was not saved.')
        return false
      }
    },
    [cars]
  )

  // ----- Booking actions (already optimistic) -----
  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      setBookings((current) =>
        current.map((booking) => (booking.id === id ? { ...booking, status } : booking))
      )
      try {
        const response = await apiFetch(`/api/bookings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (!response.ok) {
          // Revert via refresh
          await refresh({ force: true, silent: true })
        }
      } catch {
        await refresh({ force: true, silent: true })
      }
    },
    [refresh]
  )

  const deleteBooking = useCallback(
    async (id: string) => {
      const prev = bookings
      setBookings((current) => current.filter((booking) => booking.id !== id))
      try {
        const response = await apiFetch(`/api/bookings/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          setBookings(prev)
          await refresh({ force: true, silent: true })
          toast.error('Could not delete booking.')
        } else {
          toast.success('Booking deleted.')
        }
      } catch {
        setBookings(prev)
        await refresh({ force: true, silent: true })
        toast.error('Could not delete booking.')
      }
    },
    [bookings, refresh]
  )

  const value: AdminData = {
    bookings,
    cars,
    reviews,
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
    saveCarPricing,
    updateBookingStatus,
    deleteBooking,
    refresh: refreshPublic,
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
