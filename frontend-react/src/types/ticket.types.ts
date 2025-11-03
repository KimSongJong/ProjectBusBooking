// Ticket related types
export interface Ticket {
  id: number;
  user: {
    id: number;
    username: string;
    fullName: string;
    email: string;
  };
  trip: {
    id: number;
    route: {
      fromLocation: string;
      toLocation: string;
    };
    departureTime: string;
    vehicle: {
      licensePlate: string;
    };
  };
  seat: {
    id: number;
    seatNumber: string;
    seatType: string;
  };
  promotion?: {
    id: number;
    code: string;
    discountPercentage?: number;
    discountAmount?: number;
  };
  price: number;
  bookingMethod: 'online' | 'offline';
  status: 'booked' | 'confirmed' | 'cancelled';
  bookedAt: string;
  cancelledAt?: string;
}

export interface CreateTicketRequest {
  userId: number;
  tripId: number;
  seatId: number;
  promotionId?: number;
  price: number;
  bookingMethod: 'online' | 'offline';
  status?: 'booked' | 'confirmed' | 'cancelled';
}

export interface UpdateTicketRequest {
  userId?: number;
  tripId?: number;
  seatId?: number;
  promotionId?: number;
  price?: number;
  bookingMethod?: 'online' | 'offline';
  status?: 'booked' | 'confirmed' | 'cancelled';
}
