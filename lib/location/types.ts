export interface PhotonFeature {
  type: 'Feature'
  properties: {
    name?: string
    country?: string
    countrycode?: string
    state?: string
    city?: string
    town?: string
    village?: string
    hamlet?: string
    municipality?: string
    union?: string
    upazila?: string
    district?: string
    county?: string
    locality?: string
    suburb?: string
    neighbourhood?: string
    postcode?: string
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
  type?: string
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
