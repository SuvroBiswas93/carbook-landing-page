'use client'

import { useRef, useState } from 'react'
import { LocationResult } from '@/lib/location/types'
import { formatDistance } from '@/lib/location/osrm'
import { useClickOutside } from '@/lib/useClickOutside'
import { useRouteDistance } from '@/lib/useRouteDistance'
import { LocationAutocomplete } from './LocationAutocomplete'

interface PickupDropoffProps {
  pickupLocation: LocationResult | null
  setPickupLocation: (loc: LocationResult | null) => void
  dropoffLocation: LocationResult | null
  setDropoffLocation: (loc: LocationResult | null) => void
  pickupError: string | undefined
  dropoffError: string | undefined
  isAirport: boolean
  onDistanceChange?: (distanceMeters: number | null) => void
}

export function PickupDropoff({
  pickupLocation,
  setPickupLocation,
  dropoffLocation,
  setDropoffLocation,
  pickupError,
  dropoffError,
  isAirport,
  onDistanceChange,
}: PickupDropoffProps) {
  const [openPickup, setOpenPickup] = useState(false)
  const [openDropoff, setOpenDropoff] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { distanceMeters: routeDistance, isLoading: isRouteLoading, error: routeError } =
    useRouteDistance(pickupLocation, dropoffLocation, { onDistanceChange })

  useClickOutside([containerRef], () => {
    setOpenPickup(false)
    setOpenDropoff(false)
  })

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <LocationAutocomplete
          label="পিকআপ লোকেশন"
          value={pickupLocation}
          onChange={setPickupLocation}
          error={pickupError}
          open={openPickup}
          onOpenChange={setOpenPickup}
        />

        <LocationAutocomplete
          label={isAirport ? 'এয়ারপোর্টে ড্রপ-অফ' : 'ড্রপ-অফ লোকেশন'}
          value={dropoffLocation}
          onChange={setDropoffLocation}
          error={dropoffError}
          open={openDropoff}
          onOpenChange={setOpenDropoff}
        />
      </div>

      {pickupLocation && dropoffLocation && (
        <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-center text-sm text-stone-700 shadow-sm">
          {isRouteLoading && <span className="font-semibold text-amber-800">সড়কপথের দূরত্ব হিসাব হচ্ছে...</span>}
          {!isRouteLoading && routeDistance !== null && (
            <span className="font-bold">সড়কপথের দূরত্ব: {formatDistance(routeDistance)}</span>
          )}
          {!isRouteLoading && routeError && (
            <span className="font-medium text-red-600">এই দুই লোকেশনের সড়ক দূরত্ব এখন পাওয়া যাচ্ছে না</span>
          )}
        </div>
      )}

    </div>
  )
}