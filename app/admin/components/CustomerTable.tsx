import type { Review } from '@/lib/store'
import { ResponsiveTable } from './ResponsiveTable'
import type { Column } from './ResponsiveTable'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const columns: Column<Review>[] = [
  {
    key: 'customer',
    label: 'Customer',
    render: (review) => (
      <span className="inline-flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#292724] text-xs font-bold text-[#fffdf9]">
          {initials(review.name)}
        </span>
        <span className="font-bold">{review.name}</span>
      </span>
    ),
  },
  {
    key: 'location',
    label: 'Location',
    render: (review) => (
      <span className="text-[#766e64]">{review.location}</span>
    ),
  },
  {
    key: 'status',
    label: 'Review Status',
    render: (review) => (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
          review.hidden
            ? 'bg-amber-100 text-amber-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {review.hidden ? 'Hidden' : 'Visible'}
      </span>
    ),
  },
]

export function CustomerTable({ reviews }: { reviews: Review[] }) {
  return (
    <ResponsiveTable
      data={reviews}
      columns={columns}
      idKey="id"
      emptyMessage="No customers yet."
      rowClassName="transition-colors hover:bg-[#fbf8f3]"
    />
  )
}