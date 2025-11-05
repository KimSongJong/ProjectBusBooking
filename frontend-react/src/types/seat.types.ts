// Seat related types
export interface Seat {
  id: number;
  vehicleId: number;  // API returns vehicleId as number, not nested object
  seatNumber: string;
  seatType: 'standard' | 'vip' | 'bed';
  status: 'available' | 'booked' | 'unavailable';
}

export interface CreateSeatRequest {
  vehicleId: number;
  seatNumber: string;
  seatType: 'standard' | 'vip' | 'bed';
  status?: 'available' | 'booked' | 'unavailable';
}

export interface UpdateSeatRequest {
  vehicleId?: number;
  seatNumber?: string;
  seatType?: 'standard' | 'vip' | 'bed';
  status?: 'available' | 'booked' | 'unavailable';
}

export interface VehicleOption {
  id: number;
  licensePlate: string;
  vehicleType: string;
  totalSeats: number;  // API returns totalSeats, not seatCount
  model?: string;
  seatsLayout?: string;
  createdAt?: string;
}
