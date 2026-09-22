'use client'

import type { Review } from '@/lib/types'
import type { AdminData } from '../../useAdminData'
import { PAGE_SIZE_OPTIONS, usePagination } from '../../usePagination'
import { CustomerTable } from '../CustomerTable'
import { Module } from '../Module'
import { Pagination } from '../Pagination'

export function CustomersSection({ admin }: { admin: AdminData }) {
  const { reviews } = admin
  const { currentPage, pageSize, totalPages, setCurrentPage, changePageSize, paginate } =
    usePagination<Review>(reviews.length)
  const pageReviews = paginate(reviews)

  return (
    <Module
      title="Customers"
      description="Customer names collected from review activity."
    >
      <div className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
        <div className="overflow-x-auto">
          <CustomerTable reviews={pageReviews} />
        </div>
        {reviews.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={reviews.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={changePageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemLabel="customers"
          />
        )}
      </div>
    </Module>
  )
}