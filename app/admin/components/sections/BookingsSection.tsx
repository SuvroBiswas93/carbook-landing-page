'use client'

import type { Booking } from '@/lib/types'
import type { AdminData } from '../../useAdminData'
import { PAGE_SIZE_OPTIONS, usePagination } from '../../usePagination'
import { BookingTable } from '../BookingTable'
import { Module } from '../Module'
import { Pagination } from '../Pagination'

export function BookingsSection({ admin }: { admin: AdminData }) {
  const { bookings } = admin
  const { currentPage, pageSize, totalPages, setCurrentPage, changePageSize, paginate } =
    usePagination<Booking>(bookings.length)
  const pageBookings = paginate(bookings)

  return (
    <Module
      title="Bookings"
      description="Every website booking request from the hero form."
    >
      <div className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
        <div className="overflow-x-auto">
          <BookingTable
          bookings={pageBookings}
          onStatusChange={admin.updateBookingStatus}
          onDelete={admin.deleteBooking}
        />
        </div>
        {bookings.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={bookings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={changePageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemLabel="bookings"
          />
        )}
      </div>
    </Module>
  )
}