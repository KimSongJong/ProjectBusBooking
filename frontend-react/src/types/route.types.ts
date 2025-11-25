export interface PickupPoint {
  name: string
  address: string
}

export interface DropoffPoint {
  name: string
  address: string
}

export interface Route {
  id: number
  fromLocation: string
  toLocation: string
  distanceKm: number
  basePrice: number
  estimatedDuration: number
  pickupPoints?: PickupPoint[]
  dropoffPoints?: DropoffPoint[]
  createdAt: string
}

export interface CreateRouteRequest {
  fromLocation: string
  toLocation: string
  distanceKm: number
  basePrice: number
  estimatedDuration: number
}

export interface UpdateRouteRequest {
  fromLocation: string
  toLocation: string
  distanceKm: number
  basePrice: number
  estimatedDuration: number
}
