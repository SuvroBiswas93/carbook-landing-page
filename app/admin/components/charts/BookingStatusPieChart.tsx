'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Booking, BookingStatus } from '@/lib/types'
import { ChartCard } from './ChartCard'

const statusMeta: Record<BookingStatus, string> = {
  New: '#89b2d8',
  Called: '#dfa75e',
  Confirmed: '#84ab8b',
  Cancelled: '#d0827c',
}

const statusOrder: BookingStatus[] = ['New', 'Called', 'Confirmed', 'Cancelled']

interface Slice {
  name: BookingStatus
  value: number
  total: number
  percent: number
  color: string
}

interface TooltipEntry {
  name?: string
  value?: number
}

interface StatusTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
}

function StatusTooltip({ active, payload }: StatusTooltipProps) {
  if (!active || !payload?.length) return null

  const entry = payload[0]
  const name = entry.name as BookingStatus
  const value = entry.value ?? 0

  return (
    <div className="rounded-lg border border-[#e7e0d5] bg-[#fffdf9] px-3 py-2 shadow-lg">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c8378]">
        {name}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[#282622]">
        {value} <span className="text-[#8c8378]">bookings</span>
      </p>
    </div>
  )
}

export function BookingStatusPieChart({ bookings }: { bookings: Booking[] }) {
  const total = bookings.length

  const data: Slice[] = statusOrder
    .map((status) => {
      const value = bookings.filter((booking) => booking.status === status).length
      return {
        name: status,
        value,
        total,
        percent: total === 0 ? 0 : Math.round((value / total) * 100),
        color: statusMeta[status],
      }
    })
    .filter((slice) => slice.value > 0)

  return (
    <ChartCard title="Booking Status" subtitle="Current stage breakdown">
      {total === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-[#8c8378]">No bookings yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-[250px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<StatusTooltip />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="72%"
                  outerRadius="90%"
                  paddingAngle={1.5}
                  cornerRadius={3}
                  stroke="none"
                  animationDuration={700}
                >
                  {data.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tracking-tight text-[#282622]">
                {total}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a49b8f]">
                Total
              </span>
            </div>
          </div>

          <div className="sm:w-56">
            <ul className="space-y-3">
              {data.map((slice) => (
                <li key={slice.name} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="flex-1 truncate text-sm font-medium text-[#766e64]">
                    {slice.name}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-[#282622]">
                    {slice.value}
                  </span>
                  <span className="w-9 text-right text-xs font-medium tabular-nums text-[#a49b8f]">
                    {slice.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </ChartCard>
  )
}