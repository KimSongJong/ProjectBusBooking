import type { Trip } from "@/types/trip.types";

/**
 * Kiểm tra xem tài xế có đang bận không (có chuyến scheduled hoặc ongoing)
 */
export function isDriverBusy(driverId: number, trips: Trip[], excludeTripId?: number): boolean {
  return trips.some(
    (trip) =>
      trip.driver.id === driverId &&
      (trip.status === "scheduled" || trip.status === "ongoing") &&
      trip.id !== excludeTripId
  );
}

/**
 * Kiểm tra xem xe có đang được sử dụng không (có chuyến scheduled hoặc ongoing)
 */
export function isVehicleBusy(vehicleId: number, trips: Trip[], excludeTripId?: number): boolean {
  return trips.some(
    (trip) =>
      trip.vehicle.id === vehicleId &&
      (trip.status === "scheduled" || trip.status === "ongoing") &&
      trip.id !== excludeTripId
  );
}

/**
 * Lấy tài xế đang rảnh (không có chuyến scheduled hoặc ongoing)
 */
export function getAvailableDrivers(allDriverIds: number[], trips: Trip[]): number[] {
  return allDriverIds.filter((driverId) => !isDriverBusy(driverId, trips));
}

/**
 * Lấy xe đang rảnh (không có chuyến scheduled hoặc ongoing)
 */
export function getAvailableVehicles(allVehicleIds: number[], trips: Trip[]): number[] {
  return allVehicleIds.filter((vehicleId) => !isVehicleBusy(vehicleId, trips));
}

/**
 * Kiểm tra ngày giờ khởi hành có hợp lệ không (> ngày hiện tại)
 */
export function isValidDepartureTime(departureTime: string): boolean {
  const departureDate = new Date(departureTime);
  const now = new Date();
  
  // Ngày khởi hành phải > ngày hiện tại
  return departureDate > now;
}

/**
 * Kiểm tra thời gian đến có sau thời gian khởi hành không (>= 30 phút và <= 3 ngày)
 */
export function isValidArrivalTime(departureTime: string, arrivalTime: string): boolean {
  if (!arrivalTime) return true; // Optional field
  
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  
  // Thời gian đến phải > thời gian khởi hành
  if (arrival <= departure) {
    return false;
  }
  
  // Thời gian đến phải cách thời gian khởi hành ít nhất 30 phút
  const thirtyMinutesLater = new Date(departure.getTime() + 30 * 60 * 1000);
  if (arrival < thirtyMinutesLater) {
    return false;
  }
  
  // Thời gian đến không được quá 3 ngày so với thời gian khởi hành
  const threeDaysLater = new Date(departure.getTime() + 3 * 24 * 60 * 60 * 1000);
  if (arrival > threeDaysLater) {
    return false;
  }
  
  return true;
}

/**
 * Format datetime cho input datetime-local
 */
export function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Lấy thời gian tối thiểu cho input (ngày hiện tại)
 */
export function getMinDateTime(): string {
  const now = new Date();
  return formatDateTimeLocal(now.toISOString());
}

/**
 * Lấy thời gian tối đa cho input (24 giờ kể từ bây giờ)
 */
export function getMaxDateTime(): string {
  const now = new Date();
  const maxDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return formatDateTimeLocal(maxDate.toISOString());
}

/**
 * Lấy thời gian tối đa cho arrival (3 ngày sau departure)
 */
export function getMaxArrivalTime(departureTime: string): string {
  if (!departureTime) return "";
  const departure = new Date(departureTime);
  const maxArrival = new Date(departure.getTime() + 3 * 24 * 60 * 60 * 1000);
  return formatDateTimeLocal(maxArrival.toISOString());
}

/**
 * Lấy thời gian tối thiểu cho arrival (departure + 30 phút)
 */
export function getMinArrivalTime(departureTime: string): string {
  if (!departureTime) return "";
  const departure = new Date(departureTime);
  const minArrival = new Date(departure.getTime() + 30 * 60 * 1000);
  return formatDateTimeLocal(minArrival.toISOString());
}
