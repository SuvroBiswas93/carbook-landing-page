'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Booking, BookingStatus, BookingLocation } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import { ResponsiveTable } from './ResponsiveTable'
import type { Column } from './ResponsiveTable'
import { StatusBadge, StatusSelect } from './StatusSelect'

function locationToString(loc: string | BookingLocation | undefined): string {
  if (!loc) return 'Not provided'
  if (typeof loc === 'object') {
    if (loc.formattedAddress) return loc.formattedAddress
    return loc.name ?? 'Not provided'
  }
  return loc || 'Not provided'
}

function estimatedDistanceKm(booking: Booking): number | undefined {
  const storedDistance = booking.distanceKm ?? booking.distance
  if (storedDistance !== undefined) return storedDistance

  if (typeof booking.pickupLocation !== 'object' || typeof booking.dropoffLocation !== 'object') {
    return undefined
  }

  const toRadians = (value: number) => (value * Math.PI) / 180
  const latitudeDelta = toRadians(booking.dropoffLocation.latitude - booking.pickupLocation.latitude)
  const longitudeDelta = toRadians(booking.dropoffLocation.longitude - booking.pickupLocation.longitude)
  const latitude = toRadians((booking.pickupLocation.latitude + booking.dropoffLocation.latitude) / 2)
  const straightLineKm = 2 * 6371 * Math.asin(
    Math.sqrt(
      Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(latitude) * Math.cos(latitude) * Math.sin(longitudeDelta / 2) ** 2,
    ),
  )

  return Math.round(straightLineKm * 1.2 * 10) / 10
}

const createColumns = (
  onStatusChange?: (id: string, status: BookingStatus) => void,
  onDelete?: (id: string) => void,
  onRequestDelete?: (booking: Booking) => void
): Column<Booking>[] => [
  {
    key: 'id',
    label: 'Booking ID',
    render: (booking) => <span className="font-bold">{booking.id}</span>,
  },
  {
    key: 'customer',
    label: 'Customer',
    render: (booking) => (
      <>
        <p className="font-semibold">
          {booking.customerName || 'Not provided'}
        </p>
        <p className="text-xs text-[#8c8378]">
          {booking.carType || 'Car type not provided'}
        </p>
      </>
    ),
  },
  {
    key: 'car',
    label: 'Car',
    render: (booking) => booking.carName,
    mobileHidden: true,
  },
  {
    key: 'mobile',
    label: 'Mobile',
    render: (booking) => (
      <span className="font-bold text-[#292724]">
        {booking.mobileNumber || 'Not provided'}
      </span>
    ),
  },
  {
    key: 'pickup',
    label: 'Pickup',
    render: (booking) => (
      <span className="text-[#766e64]">{locationToString(booking.pickupLocation)}</span>
    ),
  },
  {
    key: 'dropoff',
    label: 'Drop-off',
    render: (booking) => (
      <span className="text-[#766e64]">{locationToString(booking.dropoffLocation)}</span>
    ),
    mobileHidden: true,
  },
  {
    key: 'trip',
    label: 'Trip',
    render: (booking) =>
      booking.tripType === 'Round Trip' ? (
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          {booking.tripType}
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
          {booking.tripType || 'One Way'}
        </span>
      ),
    mobileHidden: true,
  },
  {
    key: 'schedule',
    label: 'Schedule',
    render: (booking) => (
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-stone-900">
          {formatDateTime(booking.pickupDate)}
        </p>
        {booking.tripType === 'Round Trip' && booking.dropoffDate && (
          <div className="mt-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2">
            <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
              Return
            </p>
            <p className="text-sm font-semibold text-stone-900">
              {formatDateTime(booking.dropoffDate)}
            </p>
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'estimate',
    label: 'Estimate',
    render: (booking) => {
      const estimatedKm = estimatedDistanceKm(booking)

      return (
        <>
          <span className="font-bold text-[#a36d16]">
            {booking.estimatedFare !== undefined
              ? `৳${booking.estimatedFare.toFixed(2)}`
              : ''}
          </span>
          {estimatedKm !== undefined && (
            <span className="block text-xs font-normal text-[#8c8378]">
              {estimatedKm} km
            </span>
          )}
        </>
      )
    },
  },
  {
    key: 'status',
    label: 'Status',
    render: (booking) =>
      onStatusChange ? (
        <StatusSelect
          value={booking.status}
          onSelect={(status) => onStatusChange(booking.id, status)}
        />
      ) : (
        <StatusBadge status={booking.status} />
      ),
  },
  ...(onDelete && onRequestDelete
    ? [
        {
          key: 'actions',
          label: '',
          render: (booking: Booking) => (
            <button
              type="button"
              onClick={() => onRequestDelete(booking)}
              aria-label={`Delete booking ${booking.id}`}
              className="cursor-pointer rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          ),
        } as Column<Booking>,
      ]
    : []),
]

interface BookingTableProps {
  bookings: Booking[]
  onStatusChange?: (id: string, status: BookingStatus) => void
  onDelete?: (id: string) => void
}

export function BookingTable({ bookings, onStatusChange, onDelete }: BookingTableProps) {
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)

  const handleDelete = () => {
    if (!bookingToDelete) return
    setBookingToDelete(null)
    onDelete?.(bookingToDelete.id)
  }

  return (
    <>
      <ResponsiveTable
        data={bookings}
        columns={createColumns(onStatusChange, onDelete, setBookingToDelete)}
        idKey="id"
        minWidth="min-w-[1000px]"
        emptyMessage="No bookings yet."
      />

      {bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setBookingToDelete(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#292724]">
              Delete booking?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#766e64]">
              This will permanently remove booking{' '}
              <span className="font-bold text-[#292724]">{bookingToDelete.id}</span>
              {bookingToDelete.customerName
                ? ` for ${bookingToDelete.customerName}`
                : ''}.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                className="flex-1 cursor-pointer rounded-xl border border-[#e7e0d5] bg-white px-4 py-2.5 text-sm font-bold text-[#292724] transition-colors hover:bg-[#f7f3ec]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}