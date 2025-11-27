// filepath: src/utils/cityNormalizer.ts
/**
 * 🏙️ CITY NORMALIZATION UTILITY
 *
 * Purpose: Normalize city names from different sources
 * - OpenStreetMap returns: "Ho Chi Minh City", "Hanoi", "Da Nang", "Dong Nai Province"
 * - Database has: "Hồ Chí Minh", "TP Hồ Chí Minh", "TPHCM", "Hà Nội", "Đồng Nai"
 * - Combobox uses: ALL 63 provinces from provinces.ts
 *
 * This utility creates a mapping to convert between formats
 *
 * Date: 2025-11-27
 * Updated: Added all 63 Vietnam provinces
 */

import { VIETNAM_PROVINCES } from '@/constants/provinces';

/**
 * Standard city names used in the application
 * Now uses all 63 provinces from provinces.ts
 */
export const STANDARD_CITIES = VIETNAM_PROVINCES;

/**
 * 🌟 PRIORITY CITIES - Shown first in dropdowns
 * These are major bus routes in Vietnam
 */
export const PRIORITY_CITIES = [
  'TP Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Nha Trang',
  'Đà Lạt',
  'Vũng Tàu',
  'Phan Thiết',
  'Cần Thơ',
  'Hải Phòng',
  'Huế',
] as const;

/**
 * Sort cities by priority (major cities first, then alphabetically)
 * Used in dropdowns to show popular cities at the top
 */
export function sortCitiesByPriority(cities: string[]): string[] {
  return cities.sort((a, b) => {
    const aIndex = PRIORITY_CITIES.indexOf(a as any);
    const bIndex = PRIORITY_CITIES.indexOf(b as any);

    // Both are priority cities - sort by priority order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // Only a is priority - a comes first
    if (aIndex !== -1) return -1;

    // Only b is priority - b comes first
    if (bIndex !== -1) return 1;

    // Neither are priority - sort alphabetically (Vietnamese)
    return a.localeCompare(b, 'vi');
  });
}

/**
 * Aliases mapping - all possible variations of city names
 * Key: Standard name (shown in UI)
 * Value: Array of aliases (from OSM, old DB, etc.)
 *
 * Auto-generated for all 63 provinces with common OSM formats
 */
export const CITY_ALIASES: Record<string, string[]> = {
  // Major cities with extensive aliases
  'TP Hồ Chí Minh': [
    'Ho Chi Minh City', 'Ho Chi Minh', 'Hồ Chí Minh',
    'TP Hồ Chí Minh', 'TP.Hồ Chí Minh', 'TPHCM', 'Tp.HCM',
    'Saigon', 'Sài Gòn', 'Thanh pho Ho Chi Minh',
  ],
  'Hà Nội': [
    'Hanoi', 'Ha Noi', 'Hà Nội', 'Hanoi, Vietnam',
    'Ha Noi City', 'Hanoi Capital',
  ],
  'Đà Nẵng': [
    'Da Nang', 'Danang', 'Đà Nẵng', 'Da Nang City',
  ],
  'Hải Phòng': [
    'Hai Phong', 'Haiphong', 'Hải Phòng', 'Hai Phong City',
  ],
  'Cần Thơ': [
    'Can Tho', 'Cần Thơ', 'Can Tho City',
  ],

  // Popular tourist destinations
  'Nha Trang': [
    'Nha Trang', 'Nha Trang City', 'Khánh Hòa', 'Khanh Hoa',
  ],
  'Đà Lạt': [
    'Da Lat', 'Dalat', 'Đà Lạt', 'Lâm Đồng', 'Lam Dong',
  ],
  'Huế': [
    'Hue', 'Huế', 'Thừa Thiên Huế', 'Thua Thien Hue',
  ],
  'Vũng Tàu': [
    'Vung Tau', 'Vũng Tàu', 'Ba Ria - Vung Tau', 'Bà Rịa - Vũng Tàu',
  ],
  'Phan Thiết': [
    'Phan Thiet', 'Phan Thiết', 'Bình Thuận', 'Binh Thuan',
  ],

  // Northern provinces
  'Quảng Ninh': ['Quang Ninh', 'Quảng Ninh', 'Ha Long', 'Hạ Long'],
  'Lào Cai': ['Lao Cai', 'Lào Cai', 'Sa Pa', 'Sapa'],
  'Điện Biên': ['Dien Bien', 'Điện Biên', 'Dien Bien Phu'],
  'Thái Nguyên': ['Thai Nguyen', 'Thái Nguyên'],
  'Bắc Ninh': ['Bac Ninh', 'Bắc Ninh'],
  'Hải Dương': ['Hai Duong', 'Hải Dương'],
  'Ninh Bình': ['Ninh Binh', 'Ninh Bình'],

  // Central provinces
  'Thanh Hóa': ['Thanh Hoa', 'Thanh Hóa'],
  'Nghệ An': ['Nghe An', 'Nghệ An', 'Vinh', 'Vinh City'],
  'Quảng Bình': ['Quang Binh', 'Quảng Bình', 'Dong Hoi', 'Đồng Hới'],
  'Quảng Nam': ['Quang Nam', 'Quảng Nam', 'Hoi An', 'Hội An'],
  'Bình Định': ['Binh Dinh', 'Bình Định', 'Quy Nhon', 'Quy Nhơn'],
  'Phú Yên': ['Phu Yen', 'Phú Yên', 'Tuy Hoa', 'Tuy Hòa'],
  'Kon Tum': ['Kon Tum', 'Kontum'],
  'Gia Lai': ['Gia Lai', 'Pleiku'],
  'Đắk Lắk': ['Dak Lak', 'Đắk Lắk', 'Daklak', 'Buon Ma Thuot'],

  // Southern provinces
  'Bình Dương': ['Binh Duong', 'Bình Dương', 'Thu Dau Mot', 'Thủ Dầu Một'],
  'Đồng Nai': ['Dong Nai', 'Đồng Nai', 'Bien Hoa', 'Biên Hòa'],
  'Long An': ['Long An', 'Tan An', 'Tân An'],
  'Tiền Giang': ['Tien Giang', 'Tiền Giang', 'My Tho', 'Mỹ Tho'],
  'Bến Tre': ['Ben Tre', 'Bến Tre'],
  'Vĩnh Long': ['Vinh Long', 'Vĩnh Long'],
  'An Giang': ['An Giang', 'Long Xuyen', 'Long Xuyên'],
  'Kiến Giang': ['Kien Giang', 'Kiến Giang', 'Rach Gia', 'Rạch Giá', 'Phu Quoc', 'Phú Quốc'],
};

/**
 * Normalize a city name to the standard format
 *
 * @param rawName - City name from any source (OSM, database, user input)
 * @returns Standard city name or null if not found
 *
 * @example
 * normalizeCityName("Ho Chi Minh City") → "Hồ Chí Minh"
 * normalizeCityName("TP.HCM") → "Hồ Chí Minh"
 * normalizeCityName("Hanoi") → "Hà Nội"
 * normalizeCityName("Unknown City") → null
 */
export function normalizeCityName(rawName: string): string | null {
  if (!rawName || typeof rawName !== 'string') {
    return null;
  }

  const normalized = rawName.trim();

  // First, check if it's already a standard name
  if (STANDARD_CITIES.includes(normalized as any)) {
    return normalized;
  }

  // Search through aliases
  for (const [standardName, aliases] of Object.entries(CITY_ALIASES)) {
    // Exact match
    if (standardName.toLowerCase() === normalized.toLowerCase()) {
      return standardName;
    }

    // Check aliases (case-insensitive, partial match)
    for (const alias of aliases) {
      if (
        normalized.toLowerCase().includes(alias.toLowerCase()) ||
        alias.toLowerCase().includes(normalized.toLowerCase())
      ) {
        return standardName;
      }
    }
  }

  return null; // Not found
}

/**
 * Extract city/province name from a full address string
 *
 * OpenStreetMap returns addresses in various formats:
 * - "Street, District, City, Country"
 * - "Stadium Name, Street, District, Hanoi, Vietnam"
 * - "Ben xe Nha Be, District 7, Ho Chi Minh City, Vietnam"
 *
 * @param address - Full address from OSM reverse geocoding
 * @returns Extracted city name (not normalized yet)
 *
 * @example
 * extractCityFromAddress("Ben xe Nha Be, Ho Chi Minh City, Vietnam")
 * → "Ho Chi Minh City"
 *
 * extractCityFromAddress("Hang Day Stadium, Giai Phong, Hoang Mai, Hanoi, Vietnam")
 * → "Hanoi"
 */
export function extractCityFromAddress(address: string): string {
  if (!address) return '';

  // OSM format: "Location, Street, District, City/Province, Country"
  const parts = address.split(',').map(p => p.trim());

  if (parts.length < 2) {
    return address; // Fallback: return original
  }

  // Strategy 1: Try each part from right to left (skip "Vietnam")
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];

    // Skip "Vietnam" or numeric-only values
    if (
      part.toLowerCase() === 'vietnam' ||
      part.toLowerCase() === 'việt nam' ||
      /^\d+$/.test(part)
    ) {
      continue;
    }

    // Try to normalize this part
    const normalized = normalizeCityName(part);
    if (normalized) {
      console.log(`✅ Found city in address part: "${part}" → "${normalized}"`);
      return part; // Return raw name for further normalization
    }

    // Special case: Check if part contains known city keywords
    const lowerPart = part.toLowerCase();
    if (
      lowerPart.includes('hanoi') || lowerPart.includes('hà nội') ||
      lowerPart.includes('ho chi minh') || lowerPart.includes('hồ chí minh') ||
      lowerPart.includes('da nang') || lowerPart.includes('đà nẵng') ||
      lowerPart.includes('hai phong') || lowerPart.includes('hải phòng')
    ) {
      console.log(`✅ Found city by keyword match: "${part}"`);
      return part;
    }
  }

  // Strategy 2: Fallback - second-to-last part (usually city/province)
  const fallback = parts[parts.length - 2] || parts[parts.length - 1] || '';
  console.log(`⚠️ Using fallback city extraction: "${fallback}"`);
  return fallback;
}

/**
 * Auto-detect and normalize city from address
 *
 * Combines extraction + normalization in one step
 *
 * @param address - Full address from OSM
 * @returns Standard city name or null
 *
 * @example
 * autoDetectCity("Ben xe My Dinh, Hanoi, Vietnam")
 * → "Hà Nội"
 */
export function autoDetectCity(address: string): string | null {
  const extractedCity = extractCityFromAddress(address);
  return normalizeCityName(extractedCity);
}



