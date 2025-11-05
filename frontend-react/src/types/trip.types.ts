// Trip related types
export interface Trip {
  id: number;
  route: {
    id: number;
    fromLocation: string;
    toLocation: string;
    distanceKm: number;
    basePrice: number;
    estimatedDuration?: number;
  };
  vehicle: {
    id: number;
    licensePlate: string;
    vehicleType: string;
    seatCount: number;
  };
  driver: {
    id: number;
    fullName: string;
    phoneNumber: string;
  };
  departureTime: string; // ISO datetime string
  arrivalTime?: string;  // ISO datetime string
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CreateTripRequest {
  routeId: number;
  vehicleId: number;
  driverId: number;
  departureTime: string; // ISO datetime string
  arrivalTime?: string;  // ISO datetime string
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface UpdateTripRequest {
  routeId?: number;
  vehicleId?: number;
  driverId?: number;
  departureTime?: string;
  arrivalTime?: string;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

// Simplified types for dropdowns
export interface RouteOption {
  id: number;
  fromLocation: string;
  toLocation: string;
}

export interface VehicleOption {
  id: number;
  licensePlate: string;
  vehicleType: string;
}

export interface DriverOption {
  id: number;
  fullName: string;
  phoneNumber: string;
}
