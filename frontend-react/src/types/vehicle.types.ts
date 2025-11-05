export interface Vehicle {
  id: number
  licensePlate: string
  model: string
  totalSeats: number
  seatsLayout?: string
  vehicleType: 'standard' | 'vip' | 'sleeper'
  isActive: boolean
  createdAt: string
}

export interface CreateVehicleRequest {
  licensePlate: string
  model: string
  totalSeats: number
  seatsLayout?: string
  vehicleType: 'standard' | 'vip' | 'sleeper'
}

export interface UpdateVehicleRequest {
  licensePlate: string
  model: string
  totalSeats: number
  seatsLayout?: string
  vehicleType: 'standard' | 'vip' | 'sleeper'
}
