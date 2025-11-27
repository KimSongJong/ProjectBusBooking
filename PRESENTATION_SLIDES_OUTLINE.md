# 📊 POWERPOINT SLIDES OUTLINE
## Bus Booking System - 15 phút

---

## SLIDE 1: TITLE
```
🚌 BUS BOOKING SYSTEM - TPT
Hệ thống đặt vé xe khách trực tuyến

Nhóm: [Tên nhóm]
Thành viên: [Tên các thành viên]
Giảng viên: [Tên giáo viên]
Ngày: 28/11/2025
```

---

## SLIDE 2: TỔNG QUAN PROJECT
```
📋 Giới thiệu
• Clone của FUTA Phương Trang
• Hỗ trợ đặt vé một chiều & khứ hồi
• Giảm giá 10% cho vé khứ hồi
• Admin dashboard quản lý toàn diện

🎯 Mục tiêu
• Nền tảng đặt vé online hiện đại
• Tích hợp thanh toán an toàn
• Trải nghiệm người dùng tốt
```

---

## SLIDE 3: 4 TÍNH NĂNG NÂNG CAO ⭐
```
1. 🔐 XÁC THỰC OTP QUA EMAIL
   • Bảo mật cao khi đăng ký
   • Mã 6 số, expire 5 phút
   • Email template chuyên nghiệp

2. 💳 THANH TOÁN VNPAY & MOMO
   • Tích hợp 2 cổng payment
   • Signature verification
   • Transaction tracking

3. 📧 EMAIL HÓA ĐƠN TỰ ĐỘNG
   • Gửi sau khi thanh toán
   • Chi tiết đầy đủ
   • Responsive design

4. 🗺️ OPENSTREETMAP + LEAFLET
   • Quản lý trạm xe với map
   • Auto-calculate distance & price
   • Geocoding & routing
```

---

## SLIDE 4: KIẾN TRÚC TỔNG THỂ
```
┌─────────────┐      ┌──────────────┐      ┌──────────┐
│   FRONTEND  │─────▶│   BACKEND    │─────▶│ DATABASE │
│  React + TS │      │ Spring Boot  │      │  MySQL   │
└─────────────┘      └──────────────┘      └──────────┘
                              │
                    ┌─────────┼──────────┐
                    │         │          │
              ┌─────▼───┐ ┌───▼────┐ ┌──▼─────┐
              │ VNPay   │ │ MoMo   │ │  Map   │
              │   API   │ │  API   │ │  APIs  │
              └─────────┘ └────────┘ └────────┘
```

---

## SLIDE 5: CÔNG NGHỆ SỬ DỤNG
```
💻 BACKEND
• Java 21
• Spring Boot 3.3.5
• Spring Security + JWT
• JPA/Hibernate
• MySQL 8.0
• JavaMailSender
• Thymeleaf

🎨 FRONTEND
• React 18 + TypeScript
• Vite (build tool)
• TailwindCSS + Shadcn UI
• Axios
• React Leaflet
• Context API

🗺️ EXTERNAL APIs
• VNPay Payment Gateway
• MoMo Payment Gateway
• OpenStreetMap Nominatim
• OSRM (routing)
• Gmail SMTP
```

---

## SLIDE 6: FLOW ĐĂNG KÝ + OTP
```
User Registration Flow

1. User điền form đăng ký
   ↓
2. Backend generate OTP (6 số)
   ↓
3. Lưu vào DB: otp_code, otp_expires_at
   ↓
4. Gửi email qua Gmail SMTP
   ↓
5. User nhập OTP từ email
   ↓
6. Backend verify: code + expiry time
   ↓
7. Set email_verified = TRUE
   ↓
8. Redirect → Login

⏱️ OTP hết hạn sau 5 phút
🔒 Password hash bằng BCrypt
```

---

## SLIDE 7: FLOW ĐẶT VÉ KHỨ HỒI
```
Round Trip Booking Flow

1. User chọn: Nha Trang → Đà Nẵng (khứ hồi)
   ↓
2. Select dates: 29/11 (đi) & 30/11 (về)
   ↓
3. Hệ thống query 2 trips cùng lúc
   ↓
4. User chọn: Trip #377 (đi) + Trip #378 (về)
   ↓
5. Chọn ghế cho cả 2 chuyến: A02, A03
   ↓
6. Chọn điểm đón/trả từ stations
   ↓
7. Hệ thống tính:
   • Vé đi: 100,000đ
   • Vé về: 100,000đ
   • Giảm giá 10%: -20,000đ
   • TỔNG: 180,000đ
   ↓
8. Tạo 2 tickets với booking_group_id chung
```

---

## SLIDE 8: PAYMENT INTEGRATION
```
VNPay & MoMo Integration

VNPAY FLOW:
• Generate vnp_SecureHash (HMAC-SHA512)
• Redirect → VNPay sandbox
• User quét QR code
• VNPay callback: /api/payment/vnpay-callback
• Verify signature
• Update payment status

MOMO FLOW:
• Generate signature (RSA)
• Redirect → MoMo sandbox
• User nhập OTP test: 123456
• MoMo callback: /api/payment/momo-callback
• Verify signature
• Update payment + trigger email

🔐 Security:
• Transaction ID tracking
• Signature verification
• Amount validation
• Idempotency (prevent double charge)
```

---

## SLIDE 9: EMAIL SYSTEM
```
Automatic Invoice Email

TRIGGER: Payment status → "completed"
         Ticket status → "confirmed"

EMAIL CONTENT:
┌─────────────────────────────────┐
│  🧾 HÓA ĐƠN THANH TOÁN          │
├─────────────────────────────────┤
│ Số hóa đơn: MOMO_TX_123456789   │
│ Phương thức: MoMo               │
│ Ngày: 28/11/2025 05:12:58       │
│ Khách: Nguyễn Demo              │
├─────────────────────────────────┤
│ 🚌 CHUYẾN ĐI (GREEN BOX)        │
│   Nha Trang → Đà Nẵng           │
│   08:00:30 29/11/2025           │
│   Ghế: A02                      │
│   Xe: 51B-12345                 │
├─────────────────────────────────┤
│ 🔄 CHUYẾN VỀ (BLUE BOX)         │
│   Đà Nẵng → Nha Trang           │
│   10:01:02 30/11/2025           │
│   Ghế: A03                      │
│   Xe: 51B-12353                 │
├─────────────────────────────────┤
│ 💰 CHI TIẾT THANH TOÁN          │
│   Vé đi: 100,000đ               │
│   Vé về: 100,000đ               │
│   Giảm giá 10%: -20,000đ        │
│   TỔNG: 180,000đ                │
└─────────────────────────────────┘

TECH:
• Thymeleaf HTML template
• JavaMailSender + Gmail SMTP
• Responsive CSS
• Async sending (non-blocking)
```

---

## SLIDE 10: MAP INTEGRATION - STATIONS
```
Admin Stations Management 🗺️

FEATURES:
• OpenStreetMap full-screen
• Search bar (Nominatim API)
• Click to select location
• Auto-fill address & coordinates

DEMO FLOW:
1. Click "Thêm trạm mới"
   ↓
2. Map opens with search bar
   ↓
3. Type "Bến xe Huế"
   ↓
4. Nominatim geocodes → lat/lng
   ↓
5. Map zooms to location
   ↓
6. Click on exact position
   ↓
7. Red marker appears
   ↓
8. Reverse geocoding fills form:
   • Name: Bến xe Huế
   • Address: Full street address
   • City: Huế (auto-detected)
   • Lat: 16.4637
   • Lng: 107.5909
   ↓
9. Save to database

TECH: React Leaflet, Nominatim API
```

---

## SLIDE 11: MAP INTEGRATION - ROUTES
```
Admin Routes Management 🗺️

AUTO-CALCULATE ROUTING:

1. Select cities:
   • From: Nha Trang
   • To: Đà Nẵng

2. Map shows 2 markers

3. Click "Tính toán tự động"
   ↓
4. Call OSRM API (Open Source Routing Machine)
   ↓
5. Calculate:
   • Distance: 612 km (theo đường thực tế)
   • Duration: 7.5 hours
   • Auto-price: distance × 1000 + 50000
   ↓
6. Draw blue route line on map

7. Admin can edit price manually

8. Save route with full details

TECH:
• OSRM API (routing engine)
• Leaflet Polyline (draw route)
• Distance-based pricing algorithm
```

---

## SLIDE 12: DATABASE SCHEMA (HIGHLIGHT)
```
Key Tables (15 total):

CORE:
• users (with OTP fields)
• tickets (booking_group_id for round-trip)
• payments (transaction_id, booking_group_id)
• trips
• routes
• stations (lat/lng coordinates)
• trip_seats

RELATIONSHIPS:
┌────────┐     ┌─────────┐     ┌─────────┐
│ USERS  │────▶│ TICKETS │────▶│ PAYMENTS│
└────────┘     └─────────┘     └─────────┘
                    │
              ┌─────┴─────┐
              │           │
          ┌───▼───┐   ┌───▼────┐
          │ TRIPS │   │ SEATS  │
          └───┬───┘   └────────┘
              │
          ┌───▼────┐
          │ ROUTES │◀──┐
          └────────┘   │
                   ┌───┴────┐
                   │STATIONS│
                   └────────┘
```

---

## SLIDE 13: THÁCH THỨC & GIẢI PHÁP
```
🚧 Challenges Encountered:

1. ❌ Payment Callback to Localhost
   ✅ Solution: Admin manual confirm
                Check payment status polling

2. ❌ Map API Rate Limits
   ✅ Solution: Debounce search input
                Cache geocoding results
                Batch requests

3. ❌ Email Delivery Issues
   ✅ Solution: Gmail SMTP with App Password
                Retry mechanism
                Error logging

4. ❌ Concurrent Seat Booking
   ✅ Solution: Seat locking (5 min expire)
                Transaction isolation
                Optimistic locking

5. ❌ Round-trip Discount Logic
   ✅ Solution: booking_group_id linking
                Calculate in backend
                Validate in frontend
```

---

## SLIDE 14: DEMO SCREENSHOTS
```
[4 ảnh chụp màn hình]

1. OTP Email
   ├─ Email inbox with OTP code
   └─ Verification form

2. Payment QR
   ├─ MoMo sandbox screen
   └─ Transaction success

3. Invoice Email
   ├─ Full invoice HTML
   └─ Mobile view

4. Map Interface
   ├─ Stations map with markers
   └─ Route calculation with path
```

---

## SLIDE 15: KẾT QUẢ ĐẠT ĐƯỢC
```
✅ Completed Features:

BASIC:
☑ User Registration & Login
☑ Search Trips (One-way & Round-trip)
☑ Seat Selection with Real-time Status
☑ Booking Management
☑ Admin Dashboard (Full CRUD)

ADVANCED:
☑ 🔐 OTP Email Verification
☑ 💳 VNPay & MoMo Payment
☑ 📧 Automatic Invoice Email
☑ 🗺️ Map Integration (Geocoding + Routing)

STATISTICS:
• 15 database tables
• 138 backend files compiled
• 50+ API endpoints
• 30+ React components
• 2 payment gateways
• 3 external APIs integrated
```

---

## SLIDE 16: Q&A
```
❓ QUESTIONS & ANSWERS

Sẵn sàng trả lời các câu hỏi về:
• Implementation details
• Architecture decisions
• Code structure
• Testing approach
• Deployment strategy

📧 Contact:
Email: [your-email]
GitHub: [repo-link]

🙏 Cảm ơn thầy/cô và các bạn đã lắng nghe!
```

---

## 🎨 DESIGN TIPS CHO SLIDES

### Colors:
- **Primary**: `#2196F3` (Blue)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FF9800` (Orange)
- **Danger**: `#F44336` (Red)

### Fonts:
- **Title**: Montserrat Bold, 36pt
- **Headers**: Montserrat SemiBold, 24pt
- **Body**: Open Sans Regular, 18pt
- **Code**: Courier New, 14pt

### Icons:
- Use emoji cho dễ nhìn: 🚌 🔐 💳 📧 🗺️
- Hoặc download icons từ flaticon.com

### Layout:
- Ít text, nhiều hình ảnh/diagram
- Max 5-7 bullet points per slide
- Use white space
- Consistent alignment

---

## 📸 SCREENSHOTS CẦN CHỤP

1. **Homepage** - Search form
2. **Product page** - Trip results
3. **Booking seat** - Seat layout
4. **Payment page** - MoMo/VNPay options
5. **Email OTP** - Gmail inbox
6. **Email Invoice** - Full invoice
7. **Admin Stations** - Map interface
8. **Admin Routes** - Route calculation
9. **Admin Dashboard** - Stats overview
10. **Database diagram** - ER diagram

---

## ⏰ TIMING REMINDERS

- **Slide 1-2** (Intro): 2 min → Keep brief
- **Slide 3-5** (Overview): 1 min → Read fast
- **LIVE DEMO**: 10 min → Main focus
- **Slide 6-12** (Details): Backup slides if asked
- **Slide 13-15** (Conclusion): 2 min → Highlight achievements
- **Slide 16** (Q&A): Remaining time

**Total**: 15 minutes max

---

## 🎯 FINAL CHECKLIST

Before presentation:
- [ ] Test full demo flow 3 times
- [ ] Print slides as PDF backup
- [ ] Charge laptop (100%)
- [ ] Test projector connection
- [ ] Clear desktop (professional look)
- [ ] Close unnecessary apps
- [ ] Disable notifications
- [ ] Have water ready
- [ ] Deep breath & smile 😊

**You got this! 🚀**

