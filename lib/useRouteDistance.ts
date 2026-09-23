'use client'

import { useEffect, useRef, useState } from 'react'
import type { LocationResult } from '@/lib/location/types'
import { getRoute } from '@/lib/location/osrm'

interface RouteDistanceOptions {
  onDistanceChange?: (meters: number | null) => void
  onReset?: () => void
}

export interface RouteDistanceState {
  distanceMeters: number | null
  isLoading: boolean
  error: boolean
}

export function useRouteDistance(
  pickup: LocationResult | null,
  dropoff: LocationResult | null,
  options: RouteDistanceOptions = {}
): RouteDistanceState {
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const requestRef = useRef<AbortController | null>(null)

  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    requestRef.current?.abort()
    setDistanceMeters(null)
    setError(false)
    optionsRef.current.onDistanceChange?.(null)
    optionsRef.current.onReset?.()

    if (!pickup || !dropoff) {
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    requestRef.current = controller
    setIsLoading(true)

    getRoute(
      pickup.longitude,
      pickup.latitude,
      dropoff.longitude,
      dropoff.latitude,
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return
        const route = data.routes[0]
        if (!route) throw new Error('No driving route found')
        setDistanceMeters(route.distance)
        optionsRef.current.onDistanceChange?.(route.distance)
        setIsLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setIsLoading(false)
        setError(true)
      })

    return () => controller.abort()
  }, [pickup, dropoff])

  return { distanceMeters, isLoading, error }
}