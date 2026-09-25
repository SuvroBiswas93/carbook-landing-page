'use client'

import { X } from 'lucide-react'
import type { Review } from '@/lib/types'
import type { AdminData } from '../../useAdminData'
import { PAGE_SIZE_OPTIONS, usePagination } from '../../usePagination'
import { Module } from '../Module'
import { Pagination } from '../Pagination'
import { ReviewForm } from '../ReviewForm'
import { ReviewList } from '../ReviewList'

export function ReviewsSection({ admin }: { admin: AdminData }) {
  const { reviews, editingReview, reviewForm, setReviewForm } = admin
  const { currentPage, pageSize, totalPages, setCurrentPage, changePageSize, paginate } =
    usePagination<Review>(reviews.length)
  const pageReviews = paginate(reviews)

  return (
    <>
      <Module
        title="Reviews"
        description="Edit, delete, publish, or unpublish reviews submitted from the website."
      >
        <div className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
          <ReviewList
            reviews={pageReviews}
            onEdit={admin.startEditReview}
            onDelete={admin.deleteReview}
            onToggle={admin.toggleReview}
          />
          {reviews.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={reviews.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={changePageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </div>
      </Module>

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292724]/40 p-5">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#fffdf9] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Edit Review</h2>
              <button onClick={admin.resetReviewForm} aria-label="Close" className="cursor-pointer">
                <X />
              </button>
            </div>
            <ReviewForm
              form={reviewForm}
              setForm={setReviewForm}
              onSave={admin.saveReview}
            />
          </div>
        </div>
      )}
    </>
  )
}