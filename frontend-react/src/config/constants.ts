// Central place for API base URL and endpoints
// Base URL includes /api context path from application.properties
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8080/api"

export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },

  // User management endpoints
  USERS: {
    BASE: "/users",
    BY_ID: (id: number | string) => `/users/${id}`,
  },

  // Ticket endpoints
  TICKETS: {
    BASE: "/tickets",
    BY_ID: (id: number | string) => `/tickets/${id}`,
    BY_USER: (userId: number | string) => `/tickets/user/${userId}`,
    BY_TRIP: (tripId: number | string) => `/tickets/trip/${tripId}`,
    UPDATE_STATUS: (id: number | string) => `/tickets/${id}/status`,
  },

  // Trip endpoints
  TRIPS: {
    BASE: "/trips",
    BY_ID: (id: number | string) => `/trips/${id}`,
    BY_ROUTE: (routeId: number | string) => `/trips/route/${routeId}`,
    BY_STATUS: (status: string) => `/trips/status/${status}`,
    SEARCH: "/trips/search",
  },

  // Route endpoints
  ROUTES: {
    BASE: "/routes",
    BY_ID: (id: number | string) => `/routes/${id}`,
    SEARCH: "/routes/search",
  },

  // Vehicle endpoints
  VEHICLES: {
    BASE: "/vehicles",
    BY_ID: (id: number | string) => `/vehicles/${id}`,
  },

  // Seat endpoints
  SEATS: {
    BASE: "/seats",
    BY_ID: (id: number | string) => `/seats/${id}`,
  },

  // Driver endpoints
  DRIVERS: {
    BASE: "/drivers",
    BY_ID: (id: number | string) => `/drivers/${id}`,
  },

  // Promotion endpoints
  PROMOTIONS: {
    BASE: "/promotions",
    BY_ID: (id: number | string) => `/promotions/${id}`,
  },

  // Utility endpoints (development/testing only)
  UTIL: {
    ENCODE_PASSWORD: "/util/encode-password",
    VERIFY_PASSWORD: "/util/verify-password",
  },
}

export default ENDPOINTS
