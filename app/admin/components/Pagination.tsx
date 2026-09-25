import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  itemLabel?: string
}

const defaultPageSizeOptions = [5, 10, 20]

function pageNumbers(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]
  if (currentPage > 3) pages.push('ellipsis')

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (currentPage < totalPages - 2) pages.push('ellipsis')
  pages.push(totalPages)
  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = defaultPageSizeOptions,
  itemLabel = 'reviews',
}: PaginationProps) {
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e7e0d5] px-5 py-4">
      <p className="text-sm text-[#8c8378]">
        Showing{' '}
        <span className="font-semibold text-[#282622]">
          {rangeStart}–{rangeEnd}
        </span>{' '}
        of <span className="font-semibold text-[#282622]">{totalItems}</span>{' '}
        {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-[#e7e0d5] px-3 py-2 text-sm font-semibold text-[#766e64]"
          aria-label="Items per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center justify-end gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer rounded-lg border border-[#e7e0d5] p-2 text-[#766e64] transition-colors hover:bg-[#f0ebe3] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers(currentPage, totalPages).map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-9 cursor-pointer rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                  currentPage === page
                    ? 'bg-[#292724] text-white'
                    : 'text-[#766e64] hover:bg-[#f0ebe3]'
                }`}
              >
                {page}
              </button>
            ) : (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-[#a49b8f]"
                aria-hidden="true"
              >
                <Ellipsis size={16} />
              </span>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="cursor-pointer rounded-lg border border-[#e7e0d5] p-2 text-[#766e64] transition-colors hover:bg-[#f0ebe3] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}