'use client'

import type { BookingStatus } from '@/lib/store'
import { Dropdown } from './Dropdown'

export const bookingStatuses: readonly BookingStatus[] = [
  'New',
  'Called',
  'Confirmed',
  'Cancelled',
]

const statusStyles: Record<BookingStatus, { dotClass: string; pillClass: string }> = {
  New: { dotClass: 'bg-sky-500', pillClass: 'bg-sky-100 text-sky-800 ring-sky-200' },
  Called: { dotClass: 'bg-amber-500', pillClass: 'bg-amber-100 text-amber-800 ring-amber-200' },
  Confirmed: { dotClass: 'bg-green-500', pillClass: 'bg-green-100 text-green-800 ring-green-200' },
  Cancelled: { dotClass: 'bg-red-500', pillClass: 'bg-red-100 text-red-700 ring-red-200' },
}

interface StatusSelectProps {
  value: BookingStatus
  onSelect: (status: BookingStatus) => void
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusStyles[status].pillClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${statusStyles[status].dotClass}`} />
      {status}
    </span>
  )
}

export function StatusSelect({ value, onSelect }: StatusSelectProps) {
  const options = bookingStatuses.map((status) => ({
    value: status,
    label: status,
    dotClass: statusStyles[status].dotClass,
  }))

  return (
    <Dropdown
      value={value}
      options={options}
      onChange={onSelect}
      ariaLabel="Booking status"
      triggerClassName={`w-32 ${statusStyles[value].pillClass}`}
      menuWidth={148}
    />
  )
}