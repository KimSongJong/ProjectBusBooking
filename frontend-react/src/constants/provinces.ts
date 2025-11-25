// filepath: c:\Users\lnnta\Downloads\J2EE-ProjectCuoiKi\ProjectBusBooking\frontend-react\src\constants\provinces.ts
// Danh sách các tỉnh thành Việt Nam phân theo vùng miền (2025)

export interface Province {
  name: string;
  region: "north" | "central" | "south";
  isPopular?: boolean; // Đánh dấu các thành phố lớn
}

// Miền Bắc
export const NORTH_PROVINCES: Province[] = [
  { name: "Hà Nội", region: "north", isPopular: true },
  { name: "Hải Phòng", region: "north", isPopular: true },
  { name: "Quảng Ninh", region: "north", isPopular: true },
  { name: "Hà Giang", region: "north" },
  { name: "Cao Bằng", region: "north" },
  { name: "Lào Cai", region: "north", isPopular: true },
  { name: "Điện Biên", region: "north" },
  { name: "Lai Châu", region: "north" },
  { name: "Sơn La", region: "north" },
  { name: "Yên Bái", region: "north" },
  { name: "Hòa Bình", region: "north" },
  { name: "Thái Nguyên", region: "north" },
  { name: "Lạng Sơn", region: "north" },
  { name: "Bắc Giang", region: "north" },
  { name: "Phú Thọ", region: "north" },
  { name: "Vĩnh Phúc", region: "north" },
  { name: "Bắc Ninh", region: "north" },
  { name: "Hải Dương", region: "north" },
  { name: "Hưng Yên", region: "north" },
  { name: "Thái Bình", region: "north" },
  { name: "Hà Nam", region: "north" },
  { name: "Nam Định", region: "north" },
  { name: "Ninh Bình", region: "north" },
];

// Miền Trung
export const CENTRAL_PROVINCES: Province[] = [
  { name: "Thanh Hóa", region: "central" },
  { name: "Nghệ An", region: "central", isPopular: true },
  { name: "Hà Tĩnh", region: "central" },
  { name: "Quảng Bình", region: "central" },
  { name: "Quảng Trị", region: "central" },
  { name: "Huế", region: "central", isPopular: true },
  { name: "Đà Nẵng", region: "central", isPopular: true },
  { name: "Quảng Nam", region: "central" },
  { name: "Quảng Ngãi", region: "central" },
  { name: "Bình Định", region: "central" },
  { name: "Phú Yên", region: "central" },
  { name: "Nha Trang", region: "central", isPopular: true },
  { name: "Ninh Thuận", region: "central" },
  { name: "Phan Thiết", region: "central", isPopular: true },
  { name: "Kon Tum", region: "central" },
  { name: "Gia Lai", region: "central" },
  { name: "Đắk Lắk", region: "central", isPopular: true },
  { name: "Đắk Nông", region: "central" },
  { name: "Đà Lạt", region: "central", isPopular: true },
];

// Miền Nam
export const SOUTH_PROVINCES: Province[] = [
  { name: "TP Hồ Chí Minh", region: "south", isPopular: true },
  { name: "Vũng Tàu", region: "south", isPopular: true },
  { name: "Bình Dương", region: "south", isPopular: true },
  { name: "Đồng Nai", region: "south", isPopular: true },
  { name: "Bình Phước", region: "south" },
  { name: "Tây Ninh", region: "south" },
  { name: "Long An", region: "south" },
  { name: "Tiền Giang", region: "south" },
  { name: "Bến Tre", region: "south" },
  { name: "Trà Vinh", region: "south" },
  { name: "Vĩnh Long", region: "south" },
  { name: "Đồng Tháp", region: "south" },
  { name: "An Giang", region: "south" },
  { name: "Kiến Giang", region: "south" },
  { name: "Cần Thơ", region: "south", isPopular: true },
  { name: "Hậu Giang", region: "south" },
  { name: "Sóc Trăng", region: "south" },
  { name: "Bạc Liêu", region: "south" },
  { name: "Cà Mau", region: "south" },
];

// Tất cả các tỉnh
export const ALL_PROVINCES: Province[] = [
  ...NORTH_PROVINCES,
  ...CENTRAL_PROVINCES,
  ...SOUTH_PROVINCES,
];

// Các tỉnh phổ biến (để hiển thị đầu tiên)
export const POPULAR_PROVINCES = ALL_PROVINCES.filter(p => p.isPopular);

// Danh sách tên tỉnh (legacy support)
export const VIETNAM_PROVINCES = ALL_PROVINCES.map(p => p.name).sort();

/**
 * Logic tuyến xe thực tế:
 * - Xe liên tỉnh đường dài thường chỉ chạy giữa các thành phố lớn
 * - Không có xe quá ngắn (< 100km) hoặc quá dài (> 2000km)
 * - Tuyến Bắc - Nam: chỉ giữa các thành phố trọng điểm
 * - Tuyến nội vùng: phổ biến hơn
 */

/**
 * Lấy danh sách điểm đến khả dụng dựa trên điểm đi
 * @param fromProvince - Điểm đi
 * @returns Danh sách điểm đến phù hợp
 */
export function getAvailableDestinations(fromProvince: string): Province[] {
  if (!fromProvince) return POPULAR_PROVINCES;

  const from = ALL_PROVINCES.find(p => p.name === fromProvince);
  if (!from) return POPULAR_PROVINCES;

  // Logic thực tế:
  // 1. Thành phố lớn (isPopular) có thể đi được nhiều nơi hơn
  // 2. Cùng vùng miền: cho phép tất cả các tỉnh trong vùng
  // 3. Khác vùng miền: chỉ cho phép các thành phố lớn

  if (from.isPopular) {
    // Thành phố lớn: có thể đi mọi nơi (ưu tiên cùng vùng và thành phố lớn)
    const sameRegion = ALL_PROVINCES.filter(p =>
      p.name !== fromProvince && p.region === from.region
    );
    const otherPopular = POPULAR_PROVINCES.filter(p =>
      p.name !== fromProvince && p.region !== from.region
    );
    return [...sameRegion, ...otherPopular];
  } else {
    // Tỉnh nhỏ: chỉ đi được trong vùng + một số thành phố lớn liên vùng
    const sameRegion = ALL_PROVINCES.filter(p =>
      p.name !== fromProvince && p.region === from.region
    );
    const nearbyPopular = POPULAR_PROVINCES.filter(p => {
      if (p.name === fromProvince) return false;

      // Logic lân cận:
      // - Miền Bắc có thể đi Huế, Đà Nẵng, Nghệ An (Miền Trung Bắc)
      // - Miền Trung có thể đi Hà Nội (Bắc) và TP.HCM (Nam)
      // - Miền Nam có thể đi Nha Trang, Đà Lạt, Đà Nẵng (Miền Trung Nam)

      if (from.region === "north") {
        return p.region === "central" && ["Huế", "Đà Nẵng", "Nghệ An", "Thanh Hóa"].includes(p.name);
      }
      if (from.region === "central") {
        return ["Hà Nội", "TP Hồ Chí Minh"].includes(p.name);
      }
      if (from.region === "south") {
        return p.region === "central" && ["Nha Trang", "Đà Lạt", "Đà Nẵng", "Phan Thiết"].includes(p.name);
      }
      return false;
    });

    return [...sameRegion, ...nearbyPopular];
  }
}

/**
 * Kiểm tra xem có tuyến xe giữa 2 điểm không
 */
export function isValidRoute(from: string, to: string): boolean {
  if (!from || !to || from === to) return false;
  const destinations = getAvailableDestinations(from);
  return destinations.some(p => p.name === to);
}

