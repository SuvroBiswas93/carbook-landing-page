import { PhotonResponse, LocationResult } from './types'

const PHOTON_BASE = 'https://photon.komoot.io/api/'

export async function searchLocations(
  query: string,
  signal: AbortSignal
): Promise<LocationResult[]> {
  const url = new URL(PHOTON_BASE)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '20')
  url.searchParams.set('geometry', 'geojson')
  url.searchParams.set('countrycode', 'BD')
  url.searchParams.set('lang', 'en')

  const response = await fetch(url.toString(), { signal })

  if (!response.ok) {
    throw new Error(`Photon API error: ${response.status}`)
  }

  const data: PhotonResponse = await response.json()

  return data.features.map((feature) => {
    const [longitude, latitude] = feature.geometry.coordinates
    const properties = feature.properties
    const name = properties.name || properties.city || properties.district || properties.state || 'Bangladesh'
    const parts = [
      name,
      properties.street,
      properties.housenumber,
      properties.locality,
      properties.neighbourhood,
      properties.suburb,
      properties.hamlet,
      properties.village,
      properties.union,
      properties.upazila,
      properties.town,
      properties.municipality,
      properties.city,
      properties.district,
      properties.county,
      properties.state,
      properties.postcode,
      properties.countrycode === 'BD' || properties.country === 'Bangladesh' ? 'Bangladesh' : properties.country,
    ].filter((part): part is string => Boolean(part))
    const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index)

    return {
      name,
      type: properties.type,
      latitude,
      longitude,
      formattedAddress: uniqueParts.join(', '),
    }
  })
}
