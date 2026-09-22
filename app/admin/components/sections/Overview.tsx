'use client'

import type { Booking } from '@/lib/store'
import type { AdminData } from '../../useAdminData'
import { PAGE_SIZE_OPTIONS, usePagination } from '../../usePagination'
import { BookingTable } from '../BookingTable'
import { Pagination } from '../Pagination'
import { StatCard } from '../StatCard'
import { BookingStatusPieChart } from '../charts/BookingStatusPieChart'
import { BookingsByCarBarChart } from '../charts/BookingsByCarBarChart'

export function Overview({ admin }: { admin: AdminData }) {
  const { bookings, cars, reviews } = admin
  const publishedCars = cars.filter((car) => car.published).length
  const publishedReviews = reviews.filter((review) => !review.hidden).length

  const { currentPage, pageSize, totalPages, setCurrentPage, changePageSize, paginate } =
    usePagination<Booking>(bookings.length, 5)
  const pageBookings = paginate(bookings)

  return (
    <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Bookings" value={bookings.length} />
        <StatCard label="Published Cars" value={publishedCars} />
        <StatCard label="Hidden Cars" value={cars.length - publishedCars} />
        <StatCard label="Published Reviews" value={publishedReviews} />
      </div>
      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <BookingStatusPieChart bookings={bookings} />
        <BookingsByCarBarChart bookings={bookings} />
      </div>
      <div className="mt-8">
        <h2 className="font-serif text-xl font-bold">All Bookings</h2>
        <div className="mt-4 rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
          <div className="overflow-x-auto">
            <BookingTable bookings={pageBookings} onDelete={admin.deleteBooking} />
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
      </div>
    </>
  )
}