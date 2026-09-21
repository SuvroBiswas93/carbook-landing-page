import { ArrowLeftRight, Building2, Clock3, Plane, RefreshCw, Route, Trash2 } from 'lucide-react'
import type { Booking, BookingCategory, BookingStatus } from '@/lib/store'
import { formatDateTime } from '@/lib/utils'
import { ResponsiveTable } from './ResponsiveTable'
import type { Column } from './ResponsiveTable'
import { StatusBadge, StatusSelect } from './StatusSelect'

const categoryMeta: Record<
  BookingCategory,
  { label: string; bangla: string; badgeClass: string; icon: typeof Building2 }
> = {
  city: {
    label: 'City',
    bangla: 'সিটি',
    badgeClass: 'bg-sky-100 text-sky-800 ring-sky-200',
    icon: Building2,
  },
  hourly: {
    label: 'Hourly',
    bangla: 'আওয়ারলি',
    badgeClass: 'bg-violet-100 text-violet-800 ring-violet-200',
    icon: Clock3,
  },
  intercity: {
    label: 'Intercity',
    bangla: 'ইন্টারসিটি',
    badgeClass: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    icon: Route,
  },
  airport: {
    label: 'Airport',
    bangla: 'এয়ারপোর্ট',
    badgeClass: 'bg-cyan-100 text-cyan-800 ring-cyan-200',
    icon: Plane,
  },
}

function CategoryBadge({ category }: { category?: BookingCategory }) {
  const meta = (category && categoryMeta[category]) || categoryMeta.city
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${meta.badgeClass}`}
    >
      <Icon size={13} />
      <span>{meta.label}</span>
      <span className="font-semibold opacity-75">· {meta.bangla}</span>
    </span>
  )
}

function RoundTripBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-amber-500/30">
      <RefreshCw size={13} aria-hidden />
      Round Trip
    </span>
  )
}

const isRoundTrip = (booking: Booking) =>
  booking.tripType?.toLowerCase().includes('round') || Boolean(booking.dropoffDate)

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
    key: 'category',
    label: 'Category',
    render: (booking) => <CategoryBadge category={booking.category} />,
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
      <span className="text-[#766e64]">{booking.pickupLocation}</span>
    ),
  },
  {
    key: 'dropoff',
    label: 'Drop-off',
    render: (booking) => (
      <span className="text-[#766e64]">{booking.dropoffLocation || '—'}</span>
    ),
    mobileHidden: true,
  },
  {
    key: 'trip',
    label: 'Trip',
    render: (booking) =>
      isRoundTrip(booking) ? (
        <RoundTripBadge />
      ) : (
        <span className="inline-flex whitespace-nowrap rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700">
          {booking.tripType || 'One Way'}
        </span>
      ),
  },
  {
    key: 'schedule',
    label: 'Schedule',
    render: (booking) => (
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-stone-900">
          {formatDateTime(booking.pickupDate)}
        </p>
        {isRoundTrip(booking) && booking.dropoffDate && (
          <div className="mt-1 rounded-lg border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 px-2.5 py-2">
            <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
              <ArrowLeftRight size={11} /> Return
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
  {
    key: 'actions',
    label: 'Actions',
    render: (booking) =>
      onDelete ? (
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Delete booking ${booking.id}? This cannot be undone.`
              )
            ) {
              onDelete(booking.id)
            }
          }}
          className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200"
          aria-label={`Delete booking ${booking.id}`}
        >
          <Trash2 size={14} />
          Delete
        </button>
      ) : null,
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