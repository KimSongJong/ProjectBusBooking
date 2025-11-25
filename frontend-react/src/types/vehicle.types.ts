export interface Vehicle {
  id: number
  licensePlate: string
  model: string
  totalSeats: number
  seatsLayout?: string
  vehicleType: 'standard' | 'sleeper' | 'limousine'
  vehicleTypeDisplay?: string
  isActive: boolean
  createdAt: string
}

export interface CreateVehicleRequest {
  licensePlate: string
  model: string
  totalSeats: number
  seatsLayout?: string
  vehicleType: 'standard' | 'sleeper' | 'limousine'
}

export interface UpdateVehicleRequest {
  licensePlate: string
  model: string
  totalSeats: number
  seatsLayout?: string
  vehicleType: 'standard' | 'sleeper' | 'limousine'
}
