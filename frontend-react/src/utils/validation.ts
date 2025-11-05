/**
 * Validation utilities and patterns for form validation
 */

// Vietnamese phone number pattern: 10 digits starting with 0
export const PHONE_REGEX = /^0[0-9]{9}$/;

// Vietnamese license plate pattern: 51A-12345, 30H-99999
export const LICENSE_PLATE_REGEX = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}(\.[0-9]{2})?$/;

// Driver license number pattern: Letters, numbers and hyphens
export const DRIVER_LICENSE_REGEX = /^[A-Za-z0-9-]{5,20}$/;

// Name pattern: Letters and spaces (including Vietnamese characters)
export const NAME_REGEX = /^[a-zA-ZÀ-ỹ\s]+$/;

// Username pattern: Letters, numbers and underscores
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

// Email pattern
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate Vietnamese phone number
 */
export function validatePhone(phone: string): { valid: boolean; message?: string } {
  if (!phone) return { valid: false, message: "Số điện thoại là bắt buộc" };
  if (!PHONE_REGEX.test(phone)) {
    return { valid: false, message: "Số điện thoại phải có 10 chữ số bắt đầu bằng 0 (VD: 0912345678)" };
  }
  return { valid: true };
}

/**
 * Validate license plate
 */
export function validateLicensePlate(plate: string): { valid: boolean; message?: string } {
  if (!plate) return { valid: false, message: "Biển số xe là bắt buộc" };
  if (plate.length < 7 || plate.length > 10) {
    return { valid: false, message: "Biển số xe phải có từ 7-10 ký tự" };
  }
  if (!LICENSE_PLATE_REGEX.test(plate)) {
    return { valid: false, message: "Biển số xe không đúng định dạng (VD: 51A-12345)" };
  }
  return { valid: true };
}

/**
 * Validate driver license number
 */
export function validateDriverLicense(license: string): { valid: boolean; message?: string } {
  if (!license) return { valid: false, message: "Số bằng lái là bắt buộc" };
  if (license.length < 5 || license.length > 13) {
    return { valid: false, message: "Số bằng lái phải có từ 5-13 ký tự" };
  }
  if (!DRIVER_LICENSE_REGEX.test(license)) {
    return { valid: false, message: "Số bằng lái chỉ chứa chữ in hoa và số" };
  }
  return { valid: true };
}

/**
 * Validate full name
 */
export function validateFullName(name: string): { valid: boolean; message?: string } {
  if (!name) return { valid: false, message: "Họ tên là bắt buộc" };
  if (name.length < 2 || name.length > 30) {
    return { valid: false, message: "Họ tên phải có từ 2-30 ký tự" };
  }
  if (!NAME_REGEX.test(name)) {
    return { valid: false, message: "Họ tên chỉ chứa chữ cái và khoảng trắng" };
  }
  return { valid: true };
}

/**
 * Validate username
 */
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username) return { valid: false, message: "Tên đăng nhập là bắt buộc" };
  if (username.length < 3 || username.length > 20) {
    return { valid: false, message: "Tên đăng nhập phải có từ 3-20 ký tự" };
  }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, message: "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới" };
  }
  return { valid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) return { valid: false, message: "Email là bắt buộc" };
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: "Email không đúng định dạng" };
  }
  return { valid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) return { valid: false, message: "Mật khẩu là bắt buộc" };
  if (password.length < 6) {
    return { valid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
  }
  if (password.length > 20) {
    return { valid: false, message: "Mật khẩu không được quá 20 ký tự" };
  }
  return { valid: true };
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; message?: string } {
  if (value < min || value > max) {
    return { valid: false, message: `${fieldName} phải từ ${min} đến ${max}` };
  }
  return { valid: true };
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(
  value: number,
  fieldName: string
): { valid: boolean; message?: string } {
  if (value <= 0) {
    return { valid: false, message: `${fieldName} phải là số dương` };
  }
  return { valid: true };
}

/**
 * Validate vehicle type
 */
export function validateVehicleType(type: string): { valid: boolean; message?: string } {
  const validTypes = ["Ghế ngồi", "Giường nằm"];
  if (!validTypes.includes(type)) {
    return { valid: false, message: "Loại xe phải là 'Ghế ngồi' hoặc 'Giường nằm'" };
  }
  return { valid: true };
}

/**
 * Validate price range (VND)
 */
export function validatePrice(price: number): { valid: boolean; message?: string } {
  if (price < 10000) {
    return { valid: false, message: "Giá phải ít nhất 10,000 VND" };
  }
  if (price > 10000000) {
    return { valid: false, message: "Giá không được quá 10,000,000 VND" };
  }
  return { valid: true };
}

/**
 * Validate distance (km)
 */
export function validateDistance(distance: number): { valid: boolean; message?: string } {
  if (distance < 1) {
    return { valid: false, message: "Khoảng cách phải ít nhất 1 km" };
  }
  if (distance > 5000) {
    return { valid: false, message: "Khoảng cách không được quá 5,000 km" };
  }
  return { valid: true };
}

/**
 * Validate duration (minutes)
 */
export function validateDuration(duration: number): { valid: boolean; message?: string } {
  if (duration < 30) {
    return { valid: false, message: "Thời gian ít nhất 30 phút" };
  }
  if (duration > 4320) {
    return { valid: false, message: "Thời gian không được quá 4320 phút (3 ngày)" };
  }
  return { valid: true };
}
