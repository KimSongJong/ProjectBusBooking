// Seat related types
export interface Seat {
  id: number;
  vehicle: {
    id: number;
    licensePlate: string;
    vehicleType: string;
    seatCount: number;
  };
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
  seatCount: number;
}
