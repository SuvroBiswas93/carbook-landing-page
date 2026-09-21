'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocationResult } from '@/lib/location/types'
import { getRoute } from '@/lib/location/osrm'
import { useRef } from 'react'

const pickupIcon = L.divIcon({
  className: 'pickup-marker',
  html: `<div style="background:#16a34a;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:16px;">📍</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const dropoffIcon = L.divIcon({
  className: 'dropoff-marker',
  html: `<div style="background:#dc2626;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:16px;">📍</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function MapUpdater({ pickup, dropoff, onRoute }: {
  pickup: LocationResult | null
  dropoff: LocationResult | null
  onRoute: (distance: number, duration: number) => void
}) {
  const map = useMap()
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }

    if (!pickup || !dropoff) {
      onRoute(0, 0)
      if (pickup) {
        map.flyTo([pickup.latitude, pickup.longitude], 12, { duration: 1 })
      }
      return
    }

    const bounds = L.latLngBounds([
      [pickup.latitude, pickup.longitude],
      [dropoff.latitude, dropoff.longitude],
    ])

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    getRoute(pickup.longitude, pickup.latitude, dropoff.longitude, dropoff.latitude, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && data.routes.length > 0) {
          const route = data.routes[0]
          const geometry = route.geometry
          const coords = geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
          const polyline = L.polyline(coords, {
            color: '#16365c',
            weight: 4,
            opacity: 0.7,
          })
          const routeLayer = L.layerGroup([polyline])
          map.addLayer(routeLayer)
          routeLayerRef.current = routeLayer
          onRoute(route.distance, route.duration)
        } else {
          onRoute(0, 0)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) onRoute(0, 0)
      })

    return () => {
      abortRef.current?.abort()
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current)
        routeLayerRef.current = null
      }
    }
  }, [pickup, dropoff, map, onRoute])

  return null
}

interface LocationMapProps {
  pickup: LocationResult | null
  dropoff: LocationResult | null
  onRoute: (distance: number, duration: number) => void
}

export function LocationMap({ pickup, dropoff, onRoute }: LocationMapProps) {
  const center: [number, number] = pickup
    ? [pickup.latitude, pickup.longitude]
    : [23.8103, 90.4125]
  const zoom = pickup ? 12 : 6

  return (
    <div className="overflow-hidden rounded-2xl border border-[#eae5dd]">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-80 w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickup && (
          <Marker position={[pickup.latitude, pickup.longitude]} icon={pickupIcon}>
            <Popup>
              <div className="text-sm font-bold">{pickup.name}</div>
              <div className="text-xs text-stone-500">{pickup.formattedAddress}</div>
            </Popup>
          </Marker>
        )}
        {dropoff && (
          <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon}>
            <Popup>
              <div className="text-sm font-bold">{dropoff.name}</div>
              <div className="text-xs text-stone-500">{dropoff.formattedAddress}</div>
            </Popup>
          </Marker>
        )}
        {(pickup || dropoff) && (
          <MapUpdater pickup={pickup} dropoff={dropoff} onRoute={onRoute} />
        )}
      </MapContainer>
    </div>
  )
}
