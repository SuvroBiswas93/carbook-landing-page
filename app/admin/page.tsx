'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BarChart3,
  Bell,
  Car,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Settings,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import type { Booking, Car as FleetCar, Pricing, Review } from '@/lib/store'
import { formatDateTime } from '@/lib/utils'

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

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Bookings', icon: BarChart3 },
  { label: 'Fleet', icon: Car },
  { label: 'Reviews', icon: Star },
  { label: 'Customers', icon: Users },
  { label: 'Pricing', icon: Settings },
]

export default function AdminPage() {
  const [active, setActive] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cars, setCars] = useState<FleetCar[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingCar, setEditingCar] = useState<FleetCar | null>(null)
  const [carForm, setCarForm] = useState(emptyCar)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [reviewForm, setReviewForm] = useState(emptyReview)
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
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

  const saveCar = async () => {
    await fetch(editingCar ? `/api/cars/${editingCar.id}` : '/api/cars', {
      method: editingCar ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carForm),
    })
    setEditingCar(null)
    setCarForm(emptyCar)
    refresh()
  }

  const editCar = (car: FleetCar) => {
    setEditingCar(car)
    setCarForm({ ...car })
  }

  const saveReview = async () => {
    if (!editingReview) return
    await fetch(`/api/reviews/${editingReview.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm),
    })
    setEditingReview(null)
    setReviewForm(emptyReview)
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

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#282622]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#e7e0d5] bg-[#fffdf9] p-6 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="/" className="font-serif text-2xl font-bold">
            Luxe<span className="text-[#a8865f]">Drive</span>
          </a>
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <p className="mt-10 text-[10px] font-bold uppercase tracking-[.22em] text-[#a49b8f]">
          Management
        </p>

        <nav className="mt-4 grid gap-2">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActive(label)
                setMobileOpen(false)
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                active === label
                  ? 'bg-[#292724] text-[#fffdf9]'
                  : 'text-[#766e64] hover:bg-[#f0ebe3]'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <a
          href="/"
          className="absolute bottom-7 left-6 flex items-center gap-3 text-sm font-semibold text-[#766e64]"
        >
          <LogOut size={18} />
          Back to website
        </a>
      </aside>

      {/* Main Content Area */}
      <section className="lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-[#e7e0d5] bg-[#fffdf9] px-5 sm:px-8">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div>
            <p className="text-xs text-[#a49b8f]">Admin Control Center</p>
            <h1 className="mt-1 font-serif text-2xl font-bold">{active}</h1>
          </div>
          <Bell size={19} />
        </header>

        <div className="p-5 sm:p-8">
          {active === 'Overview' && (
            <Overview bookings={bookings} cars={cars} reviews={reviews} />
          )}

          {active === 'Bookings' && (
            <Module
              title="Bookings"
              description="Every website booking request from the hero form."
            >
              <BookingTable bookings={bookings} />
            </Module>
          )}

          {active === 'Fleet' && (
            <Module
              title="Fleet"
              description="Add, edit, publish, hide, or delete cars shown on the website."
              action={editingCar ? 'Cancel edit' : 'New car'}
              onAction={() => {
                setEditingCar(null)
                setCarForm(emptyCar)
              }}
            >
              <CarForm
                form={carForm}
                setForm={setCarForm}
                onSave={saveCar}
                editing={!!editingCar}
              />
              <CarCards
                cars={cars}
                onEdit={editCar}
                onDelete={async (id) => {
                  await fetch(`/api/cars/${id}`, { method: 'DELETE' })
                  refresh()
                }}
                onToggle={async (car) => {
                  await fetch(`/api/cars/${car.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...car, published: !car.published }),
                  })
                  refresh()
                }}
              />
            </Module>
          )}

          {active === 'Reviews' && (
            <Module
              title="Reviews"
              description="Edit, delete, publish, or unpublish reviews submitted from the website."
            >
              <ReviewCards
                reviews={reviews}
                onEdit={(review) => {
                  setEditingReview(review)
                  setReviewForm({ ...review })
                }}
                onDelete={async (id) => {
                  await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
                  refresh()
                }}
                onToggle={async (review) => {
                  await fetch(`/api/reviews/${review.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...review, hidden: !review.hidden }),
                  })
                  refresh()
                }}
              />
            </Module>
          )}

          {active === 'Customers' && (
            <Module
              title="Customers"
              description="Customer names collected from review activity."
            >
              <CustomerTable reviews={reviews} />
            </Module>
          )}

          {active === 'Pricing' && (
            <Module
              title="Pricing"
              description="Control the rates used by the fare calculator."
            >
              <PricingForm
                form={pricingForm}
                setForm={setPricingForm}
                savedPricing={pricing}
                onSave={savePricing}
              />
            </Module>
          )}
        </div>
      </section>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292724]/40 p-5">
          <div className="w-full max-w-xl rounded-2xl bg-[#fffdf9] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Edit Review</h2>
              <button
                onClick={() => setEditingReview(null)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            <ReviewForm
              form={reviewForm}
              setForm={setReviewForm}
              onSave={saveReview}
            />
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------------- Sub Components ---------------- */

function Module({
  title,
  description,
  action,
  onAction,
  children,
}: {
  title: string
  description: string
  action?: string
  onAction?: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-[#8c8378]">{description}</p>
        </div>
        {action && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 rounded-xl bg-[#292724] px-4 py-3 text-sm font-bold text-white"
          >
            <Plus size={17} />
            {action}
          </button>
        )}
      </div>
      <div className="mt-7">{children}</div>
    </>
  )
}

function Overview({
  bookings,
  cars,
  reviews,
}: {
  bookings: Booking[]
  cars: FleetCar[]
  reviews: Review[]
}) {
  const publishedCars = cars.filter((car) => car.published).length
  const publishedReviews = reviews.filter((review) => !review.hidden).length

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Bookings', bookings.length],
          ['Published Cars', publishedCars],
          ['Hidden Cars', cars.length - publishedCars],
          ['Published Reviews', publishedReviews],
        ].map(([label, value]) => (
          <article
            key={label as string}
            className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5"
          >
            <p className="text-sm text-[#8c8378]">{label}</p>
            <strong className="mt-3 block font-serif text-3xl">{value}</strong>
          </article>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="font-serif text-xl font-bold">Recent Bookings</h2>
        <div className="mt-4">
          <BookingTable bookings={bookings.slice(-5).reverse()} />
        </div>
      </div>
    </>
  )
}

function PricingForm({
  form,
  setForm,
  savedPricing,
  onSave,
}: {
  form: Pricing
  setForm: (form: Pricing) => void
  savedPricing: Pricing
  onSave: () => void
}) {
  return (
    <div className="max-w-2xl rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Per kilometer rate
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.farePerKm}
            onChange={(e) =>
              setForm({ ...form, farePerKm: Number(e.target.value) })
            }
            className="rounded-xl border border-[#e7e0d5] px-4 py-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Minimum fare
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minimumFare}
            onChange={(e) =>
              setForm({ ...form, minimumFare: Number(e.target.value) })
            }
            className="rounded-xl border border-[#e7e0d5] px-4 py-3 font-normal"
          />
        </label>
      </div>
      <p className="mt-4 text-sm text-[#766e64]">
        Current calculator rate: ${savedPricing.farePerKm}/km. Changes apply to
        the website calculator after saving.
      </p>
      <button
        onClick={onSave}
        className="mt-5 rounded-xl bg-[#292724] px-5 py-3 text-sm font-bold text-white"
      >
        Save pricing
      </button>
    </div>
  )
}

function BookingTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
      <table className="w-full min-w-250 text-left text-sm">
        <thead className="border-b border-[#e7e0d5] text-xs uppercase tracking-wider text-[#a49b8f]">
          <tr>
            <th className="p-5">Booking ID</th>
            <th className="p-5">Car</th>
            <th className="p-5">Mobile</th>
            <th className="p-5">Pickup</th>
            <th className="p-5">Drop-off</th>
            <th className="p-5">Trip</th>
            <th className="p-5">Schedule</th>
            <th className="p-5">Estimate</th>
            <th className="p-5">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-8 text-center text-[#8c8378]">
                No bookings yet.
              </td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-[#f0ebe3] last:border-0"
              >
                <td className="p-5 font-bold">{booking.id}</td>
                <td className="p-5">{booking.carName}</td>
                <td className="p-5 font-bold text-[#292724]">
                  {booking.mobileNumber || 'Not provided'}
                </td>
                <td className="p-5 text-[#766e64]">{booking.pickupLocation}</td>
                <td className="p-5 text-[#766e64]">{booking.dropoffLocation}</td>
                <td className="p-5">
                  {booking.tripType === 'Round Way' ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      {booking.tripType}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                      {booking.tripType}
                    </span>
                  )}
                </td>
                <td className="p-5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-stone-900">{formatDateTime(booking.pickupDate)}</p>
                    {booking.tripType === 'Round Way' && booking.dropoffDate && (
                      <div className="mt-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Return</p>
                        <p className="text-sm font-semibold text-stone-900">{formatDateTime(booking.dropoffDate)}</p>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-5 font-bold text-[#a36d16]">
                  {booking.estimatedFare !== undefined ? `$${booking.estimatedFare.toFixed(2)}` : 'N/A'}
                  {booking.distance !== undefined && <span className="block text-xs font-normal text-[#8c8378]">{booking.distance} km</span>}
                </td>
                <td className="p-5">
                  <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function CarForm({
  form,
  setForm,
  onSave,
  editing,
}: {
  form: Omit<FleetCar, 'id'>
  setForm: (form: Omit<FleetCar, 'id'>) => void
  onSave: () => void
  editing: boolean
}) {
  const update = (
    key: keyof Omit<FleetCar, 'id'>,
    value: string | number | boolean
  ) => setForm({ ...form, [key]: value })

  return (
    <div className="mb-8 rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
      <h3 className="font-serif text-xl font-bold">
        {editing ? 'Edit Car' : 'Add Car'}
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <input
          value={form.brand}
          onChange={(e) => update('brand', e.target.value)}
          placeholder="Brand"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          value={form.model}
          onChange={(e) => update('model', e.target.value)}
          placeholder="Model"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="Category"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          type="number"
          value={form.seats}
          onChange={(e) => update('seats', Number(e.target.value))}
          placeholder="Seats"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <label className="flex items-center gap-3 rounded-xl border border-[#e7e0d5] px-4 py-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.hasAc}
            onChange={(e) => update('hasAc', e.target.checked)}
          />
          AC available
        </label>
        <input
          value={form.transmission}
          onChange={(e) => update('transmission', e.target.value)}
          placeholder="Transmission"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          value={form.fuel}
          onChange={(e) => update('fuel', e.target.value)}
          placeholder="Fuel"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          type="number"
          value={form.pricePerDay}
          onChange={(e) => update('pricePerDay', Number(e.target.value))}
          placeholder="Price per day"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          type="number"
          value={form.pricePerKm}
          onChange={(e) => update('pricePerKm', Number(e.target.value))}
          placeholder="Price per km"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <label className="flex items-center gap-3 rounded-xl border border-[#e7e0d5] px-4 py-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update('published', e.target.checked)}
          />
          Publish on website
        </label>
      </div>
      <input
        value={form.image}
        onChange={(e) => update('image', e.target.value)}
        placeholder="Image URL"
        className="mt-4 w-full rounded-xl border border-[#e7e0d5] px-4 py-3"
      />
      <textarea
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Description"
        className="mt-4 min-h-24 w-full rounded-xl border border-[#e7e0d5] px-4 py-3"
      />
      <button
        onClick={onSave}
        className="mt-4 rounded-xl bg-[#292724] px-5 py-3 text-sm font-bold text-white"
      >
        {editing ? 'Save Changes' : 'Add Car'}
      </button>
    </div>
  )
}

function CarCards({
  cars,
  onEdit,
  onDelete,
  onToggle,
}: {
  cars: FleetCar[]
  onEdit: (car: FleetCar) => void
  onDelete: (id: number) => void
  onToggle: (car: FleetCar) => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {cars.map((car) => (
        <article
          key={car.id}
          className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5"
        >
          <div className="flex gap-4">
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              className="h-24 w-32 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-xl font-bold">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-[#8c8378]">
                {car.category} | {car.seats} seats | {car.hasAc ? 'AC' : 'Non-AC'} | ৳{car.pricePerDay}/day | ৳
                {car.pricePerKm}/km
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-[#766e64]">
                {car.description}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  car.published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {car.published ? 'Published' : 'Hidden'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(car)}
              className="flex items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              onClick={() => onToggle(car)}
              className="flex items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
            >
              {car.published ? <EyeOff size={15} /> : <Eye size={15} />}
              {car.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => onDelete(car.id)}
              className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function ReviewCards({
  reviews,
  onEdit,
  onDelete,
  onToggle,
}: {
  reviews: Review[]
  onEdit: (review: Review) => void
  onDelete: (id: number) => void
  onToggle: (review: Review) => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold">{review.name}</h3>
              <p className="text-sm text-[#8c8378]">
                {review.location} | {review.rating} stars
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                review.hidden
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {review.hidden ? 'Unpublished' : 'Published'}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#766e64]">
            {review.text}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(review)}
              className="flex items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              onClick={() => onToggle(review)}
              className="flex items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
            >
              {review.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
              {review.hidden ? 'Publish' : 'Unpublish'}
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function ReviewForm({
  form,
  setForm,
  onSave,
}: {
  form: Omit<Review, 'id' | 'createdAt'>
  setForm: (form: Omit<Review, 'id' | 'createdAt'>) => void
  onSave: () => void
}) {
  return (
    <div className="mt-6 grid gap-4">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        placeholder="Name"
      />
      <input
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        placeholder="Location"
      />
      <select
        value={form.rating}
        onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
        className="rounded-xl border border-[#e7e0d5] px-4 py-3"
      >
        {[5, 4, 3, 2, 1].map((rating) => (
          <option key={rating} value={rating}>
            {rating} stars
          </option>
        ))}
      </select>
      <textarea
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        className="min-h-28 rounded-xl border border-[#e7e0d5] px-4 py-3"
        placeholder="Review text"
      />
      <label className="flex items-center gap-3 text-sm font-bold">
        <input
          type="checkbox"
          checked={form.hidden}
          onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
        />
        Unpublish from website
      </label>
      <button
        onClick={onSave}
        className="rounded-xl bg-[#292724] py-3 font-bold text-white"
      >
        Save Review
      </button>
    </div>
  )
}

function CustomerTable({ reviews }: { reviews: Review[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
      <table className="w-full min-w-150 text-left text-sm">
        <thead className="border-b border-[#e7e0d5] text-xs uppercase tracking-wider text-[#a49b8f]">
          <tr>
            <th className="p-5">Customer</th>
            <th className="p-5">Location</th>
            <th className="p-5">Review Status</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr
              key={review.id}
              className="border-b border-[#f0ebe3] last:border-0"
            >
              <td className="p-5 font-bold">{review.name}</td>
              <td className="p-5">{review.location}</td>
              <td className="p-5">{review.hidden ? 'Hidden' : 'Visible'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}