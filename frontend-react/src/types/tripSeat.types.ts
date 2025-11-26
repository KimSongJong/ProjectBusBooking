export interface TripSeat {
  id: number;
  tripId: number;
  seatId?: number; // ⭐ ADDED: Seat ID from backend (optional for backward compatibility)
  seatNumber: string;
  seatType: 'standard' | 'vip' | 'bed';
  status: 'available' | 'booked' | 'locked';
}

export interface TripOption {
  id: number;
  route: {
    fromLocation: string;
    toLocation: string;
  };
  vehicle: {
    licensePlate: string;
    vehicleType: string;
    seatCount: number; // Changed from totalSeats to match Trip interface
  };
  departureTime: string;
  status: string;
}

export interface UpdateTripSeatRequest {
  status?: 'available' | 'booked' | 'locked';
}
