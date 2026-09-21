import type { Booking, BookingStatus, BookingLocation } from '@/lib/store'
import { formatDateTime } from '@/lib/utils'
import { ResponsiveTable } from './ResponsiveTable'
import type { Column } from './ResponsiveTable'
import { StatusBadge, StatusSelect } from './StatusSelect'

function locationToString(loc: string | BookingLocation | undefined): string {
  if (!loc) return 'Not provided'
  if (typeof loc === 'object') return loc.name ?? 'Not provided'
  return loc || 'Not provided'
}

const createColumns = (
  onStatusChange?: (id: string, status: BookingStatus) => void,
  onDelete?: (id: string) => void
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
    render: (booking) => (
      <>
        <span className="font-bold text-[#a36d16]">
          {booking.estimatedFare !== undefined
            ? `৳${booking.estimatedFare.toFixed(2)}`
            : 'N/A'}
        </span>
        {booking.distance !== undefined && (
          <span className="block text-xs font-normal text-[#8c8378]">
            {booking.distance} km
          </span>
        )}
      </>
    ),
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
]

interface BookingTableProps {
  bookings: Booking[]
  onStatusChange?: (id: string, status: BookingStatus) => void
  onDelete?: (id: string) => void
}

export function BookingTable({ bookings, onStatusChange, onDelete }: BookingTableProps) {
  return (
    <ResponsiveTable
      data={bookings}
      columns={createColumns(onStatusChange, onDelete)}
      idKey="id"
      minWidth="min-w-[1000px]"
      emptyMessage="No bookings yet."
    />
  )
}
