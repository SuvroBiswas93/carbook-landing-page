export interface PhotonFeature {
  type: 'Feature'
  properties: {
    name: string
    country: string
    countrycode: string
    state: string
    city?: string
    type: string
    housenumber?: string | null
    street?: string | null
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface PhotonResponse {
  type: 'FeatureCollection'
  features: PhotonFeature[]
}

export interface LocationResult {
  name: string
  latitude: number
  longitude: number
  formattedAddress: string
}

export interface OSRMRouteGeometry {
  type: 'LineString'
  coordinates: [number, number][]
}

export interface OSRMLeg {
  distance: number
  duration: number
  summary: {
    distance: number
    duration: number
  }
}

export interface OSRMResponse {
  code: string
  routes: Array<{
    distance: number
    duration: number
    geometry: OSRMRouteGeometry
    legs: OSRMLeg[]
  }>
}

export interface BookingLocation {
  name: string
  latitude: number
  longitude: number
  formattedAddress?: string
}
