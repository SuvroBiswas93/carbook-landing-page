'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { LocationResult } from '@/lib/location/types'
import { LocationAutocomplete } from './LocationAutocomplete'
import { formatDistance, formatDuration } from '@/lib/location/osrm'

const LocationMap = dynamic(() => import('./LocationMap').then((mod) => mod.LocationMap), { ssr: false })

interface PickupDropoffProps {
  pickupLocation: LocationResult | null
  setPickupLocation: (loc: LocationResult | null) => void
  dropoffLocation: LocationResult | null
  setDropoffLocation: (loc: LocationResult | null) => void
  pickupError: string | undefined
  dropoffError: string | undefined
  isHourly: boolean
  isAirport: boolean
  onRouteChange?: (distanceKm: number, durationMinutes: number) => void
}

export function PickupDropoff({
  pickupLocation,
  setPickupLocation,
  dropoffLocation,
  setDropoffLocation,
  pickupError,
  dropoffError,
  isHourly,
  isAirport,
  onRouteChange,
}: PickupDropoffProps) {
  const [distanceKm, setDistanceKm] = useState(0)
  const [durationMinutes, setDurationMinutes] = useState(0)

  useEffect(() => {
    if (onRouteChange) onRouteChange(distanceKm, durationMinutes)
  }, [distanceKm, durationMinutes, onRouteChange])

  const onRoute = useCallback((distance: number, duration: number) => {
    setDistanceKm(distance)
    setDurationMinutes(duration)
  }, [])

  const hasRoute = pickupLocation && dropoffLocation && distanceKm > 0

  return (
    <div className="space-y-4">
      <LocationAutocomplete
        label="পিকআপ লোকেশন"
        value={pickupLocation}
        onChange={setPickupLocation}
        error={pickupError}
        open={false}
        onOpenChange={() => {}}
      />

      {!isHourly && (
        <LocationAutocomplete
          label={isAirport ? 'এয়ারপোর্টে ড্রপ-অফ' : 'ড্রপ-অফ লোকেশন'}
          value={dropoffLocation}
          onChange={setDropoffLocation}
          error={dropoffError}
          open={false}
          onOpenChange={() => {}}
        />
      )}

      {(pickupLocation || dropoffLocation) && (
        <LocationMap
          pickup={pickupLocation}
          dropoff={dropoffLocation}
          onRoute={onRoute}
        />
      )}

      {hasRoute && (
        <div className="flex justify-center">
          <div className="rounded-xl bg-amber-50 px-6 py-3 text-center text-sm font-bold text-stone-800 shadow-sm">
            <span>{formatDistance(distanceKm)}</span>
            <span className="mx-2 text-stone-300">|</span>
            <span>{formatDuration(durationMinutes)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
