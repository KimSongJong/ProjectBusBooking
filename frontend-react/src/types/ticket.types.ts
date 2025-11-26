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
  tripSeat?: {
    id: number;
    tripId: number;
    seatId?: number;
    seatNumber: string;
    seatType: string;
    status: string;
  };
  promotion?: {
    id: number;
    code: string;
    discountPercentage?: number;
    discountAmount?: number;
  };
  pickupPoint?: string;
  dropoffPoint?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  price: number;
  bookingMethod: 'online' | 'offline';
  status: 'booked' | 'confirmed' | 'cancelled';
  bookedAt: string;
  cancelledAt?: string;

  // ⭐ Round trip fields
  tripType?: 'one_way' | 'round_trip';
  isReturnTrip?: boolean;
  linkedTicketId?: number;
  bookingGroupId?: string;
}

export interface CreateTicketRequest {
  userId: number;
  tripId: number;
  tripSeatId: number;    // ⭐ Required: ID from trip_seats table
  seatId?: number;       // ✅ Optional: ID from seats table (may be null)
  promotionId?: number;
  pickupPoint?: string;
  dropoffPoint?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
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

// ⭐ Round Trip Booking Types
export interface RoundTripBookingRequest {
  userId: number;
  tripType: 'one_way' | 'round_trip';

  // Outbound trip (chuyến đi)
  outboundTripId: number;
  outboundSeats: string[];
  outboundPickupLocation?: string;
  outboundDropoffLocation?: string;

  // Return trip (chuyến về) - optional for one-way
  returnTripId?: number;
  returnSeats?: string[];
  returnPickupLocation?: string;
  returnDropoffLocation?: string;

  // Common customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
}

export interface RoundTripBookingResponse {
  success: boolean;
  message: string;
  bookingGroupId: string;
  tripType: 'ONE_WAY' | 'ROUND_TRIP';
  totalPrice: number;
  discountAmount?: number;
  finalPrice?: number;
  totalSeats: number;
  outboundTickets: Ticket[];
  returnTickets?: Ticket[];
}

export interface CancelRoundTripRequest {
  bookingGroupId: string;
  option: 'BOTH' | 'OUTBOUND_ONLY' | 'RETURN_ONLY';
}

export interface CancelRoundTripResponse {
  success: boolean;
  message: string;
  bookingGroupId: string;
  cancelOption: string;
  refundAmount: number;
}
