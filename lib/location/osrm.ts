import { OSRMResponse } from './types'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

export async function getRoute(
  pickupLng: number,
  pickupLat: number,
  dropoffLng: number,
  dropoffLat: number,
  signal: AbortSignal
): Promise<OSRMResponse> {
  const url = `${OSRM_BASE}/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?overview=full&geometries=geojson`

  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`OSRM API error: ${response.status}`)
  }

  const data: OSRMResponse = await response.json()
  return data
}

export function formatDistance(meters: number): string {
  const km = meters / 1000
  if (km >= 1) {
    return `${Math.round(km * 10) / 10} km`
  }
  return `${Math.round(meters)} m`
}
