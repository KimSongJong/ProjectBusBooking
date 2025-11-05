export interface ScheduleGroup {
  fromLocation: string
  destinations: DestinationInfo[]
}

export interface DestinationInfo {
  routeId: number
  toLocation: string
  distanceKm: string
  estimatedDuration: string
  basePrice: string
  vehicleTypes: string[]
}

export interface Schedule {
  routeId: number
  fromLocation: string
  toLocation: string
  distanceKm: number
  basePrice: number
  estimatedDuration: number
  vehicleTypes: string[]
  tripCount: number
}
