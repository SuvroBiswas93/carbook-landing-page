import { PhotonResponse, LocationResult } from './types'

const PHOTON_BASE = 'https://photon.komoot.io/api'

export async function searchLocations(
  query: string,
  signal: AbortSignal
): Promise<LocationResult[]> {
  const url = new URL(PHOTON_BASE)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '10')
  url.searchParams.set('geojson', '1')

  const response = await fetch(url.toString(), { signal })

  if (!response.ok) {
    throw new Error(`Photon API error: ${response.status}`)
  }

  const data: PhotonResponse = await response.json()

  return data.features.map((feature) => {
    const [longitude, latitude] = feature.geometry.coordinates
    const parts = [
      feature.properties.name,
      feature.properties.city,
      feature.properties.state,
      feature.properties.country === 'BD' ? 'Bangladesh' : feature.properties.country,
    ].filter(Boolean)

    return {
      name: feature.properties.name,
      latitude,
      longitude,
      formattedAddress: parts.join(', '),
    }
  })
}
