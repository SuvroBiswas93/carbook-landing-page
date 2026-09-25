'use client'

import { useEffect, useRef, useState } from 'react'
import type { Car } from '@/lib/types'

const CARS_POLL_INTERVAL = 15000

export function useCars(onError?: (error: unknown) => void): { cars: Car[]; loading: boolean } {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    let cancelled = false
    let reportedInitialError = false
    let isFirstLoad = true

    const load = async () => {
      try {
        if (isFirstLoad) setLoading(true)
        const response = await fetch('/api/cars', { cache: 'no-store' })
        const data = (await response.json()) as Car[]
        if (!cancelled) {
          setCars(data)
          if (isFirstLoad) {
            setLoading(false)
            isFirstLoad = false
          }
        }
      } catch (error: unknown) {
        if (cancelled) return
        if (isFirstLoad) {
          setLoading(false)
          isFirstLoad = false
        }
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

  return { cars, loading }
}

// Backward-compatible alias - same as useCars
export function useCarsWithLoading(onError?: (error: unknown) => void): { cars: Car[]; loading: boolean } {
  return useCars(onError)
}