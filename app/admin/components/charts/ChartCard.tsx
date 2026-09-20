'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  badge?: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, badge, children }: ChartCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-bold sm:text-xl">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-[#8c8378]">{subtitle}</p>}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-[#f0ebe3] px-3 py-1 text-xs font-bold text-[#766e64]">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-5">
        {mounted ? (
          children
        ) : (
          <div className="h-[280px] animate-pulse rounded-xl bg-[#f7f4ef]" />
        )}
      </div>
    </div>
  )
}