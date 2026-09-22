'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Booking } from '@/lib/types'
import { ChartCard } from './ChartCard'

const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0]

interface CarDatum {
  car: string
  bookings: number
  revenue: number
}

interface TooltipEntry {
  payload?: CarDatum
}

interface CarTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
}

function CarTooltip({ active, payload }: CarTooltipProps) {
  if (!active || !payload?.length || !payload[0].payload) return null

  const { car, bookings, revenue } = payload[0].payload

  return (
    <div className="rounded-lg border border-[#e7e0d5] bg-[#fffdf9] px-3 py-2 shadow-lg">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c8378]">
        {car}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[#282622]">
        {bookings} <span className="text-[#8c8378]">bookings</span>
      </p>
      {revenue > 0 && (
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#a8865f]">
          ৳{revenue.toLocaleString()}
        </p>
      )}
    </div>
  )
}

export function BookingsByCarBarChart({ bookings }: { bookings: Booking[] }) {
  const byCar = new Map<string, CarDatum>()
  bookings.forEach((booking) => {
    const current = byCar.get(booking.carName) ?? {
      car: booking.carName,
      bookings: 0,
      revenue: 0,
    }
    current.bookings += 1
    current.revenue += Number(booking.estimatedFare ?? 0)
    byCar.set(booking.carName, current)
  })

  const data = [...byCar.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 5)

  return (
    <ChartCard title="Most Booked Cars" subtitle="Top 5 by booking volume">
      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-[#8c8378]">No bookings yet.</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                stroke="#efe9e0"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a49b8f', fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                type="category"
                dataKey="car"
                width={118}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#766e64', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(value: string) =>
                  value.length > 14 ? value.slice(0, 13) + '…' : value
                }
              />
              <Tooltip content={<CarTooltip />} cursor={{ fill: '#fbf8f3' }} />
              <Bar
                dataKey="bookings"
                radius={BAR_RADIUS}
                barSize={12}
                fill="#a8865f"
                activeBar={{ fill: '#9a7a52' }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-xs text-[#a49b8f]">
            Bookings grouped per car; revenue is the total estimated fare.
          </p>
        </>
      )}
    </ChartCard>
  )
}