'use client'

import { useEffect, useRef, useState } from 'react'
import type { Car } from '@/lib/types'

const CARS_POLL_INTERVAL = 15000

export function useCars(onError?: (error: unknown) => void): Car[] {
  const [cars, setCars] = useState<Car[]>([])
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    let cancelled = false
    let reportedInitialError = false

    const load = async () => {
      try {
        const response = await fetch('/api/cars', { cache: 'no-store' })
        const data = (await response.json()) as Car[]
        if (!cancelled) setCars(data)
      } catch (error: unknown) {
        if (cancelled) return
        if (!reportedInitialError) {
          reportedInitialError = true
          onErrorRef.current?.(error)
        }
      }
    }

    load()

    const refresh = () => {
      if (document.visibilityState === 'visible') {
        load()
      }
    }

    const pollId = window.setInterval(refresh, CARS_POLL_INTERVAL)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)

    return () => {
      cancelled = true
      window.clearInterval(pollId)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return cars
}