# 🎤 SCRIPT THUYẾT TRÌNH PROJECT - 15 PHÚT
## Bus Booking System - TPT Clone

---

## ⏱️ TIMELINE (15 phút)

1. **Giới thiệu tổng quan** (2 phút)
2. **Demo Flow chính + Tính năng nâng cao** (10 phút)
3. **Kiến trúc & Công nghệ** (2 phút)
4. **Kết luận & Q&A** (1 phút)

---

## 🎯 PHẦN 1: GIỚI THIỆU (2 phút)

### Script:

> "Xin chào thầy/cô và các bạn. Hôm nay nhóm em xin phép trình bày về project **Bus Booking System - TPT**, một hệ thống đặt vé xe khách đường dài hoàn chỉnh, lấy cảm hứng từ FUTA Phương Trang.

> **Mục tiêu của project:**
> - Tạo một nền tảng đặt vé xe khách trực tuyến hiện đại
> - Hỗ trợ cả vé một chiều và **vé khứ hồi** với giảm giá 10%
> - Tích hợp thanh toán online và quản lý toàn diện

> **Điểm nổi bật - 4 tính năng nâng cao:**
> 1. 🔐 **Xác thực OTP qua Email** - Bảo mật cao khi đăng ký
> 2. 💳 **Thanh toán VNPay/MoMo** - Tích hợp 2 cổng payment
> 3. 📧 **Email hóa đơn tự động** - Gửi invoice chi tiết sau thanh toán
> 4. 🗺️ **OpenStreetMap + Leaflet** - Quản lý trạm xe và tuyến đường bằng bản đồ

> Bây giờ em xin phép demo flow hoàn chỉnh từ khi user đăng ký đến khi nhận hóa đơn."

---

## 🎬 PHẦN 2: DEMO FLOW + TÍNH NĂNG NÂNG CAO (10 phút)

### 🔐 DEMO 1: ĐĂNG KÝ + XÁC THỰC OTP (2 phút)

**Chuẩn bị:**
- Mở `http://localhost:5173/register`
- Mở Gmail sẵn trong tab khác

**Script:**

> "**Tính năng nâng cao số 1: Xác thực OTP qua Email**

> Khi user đăng ký tài khoản mới, hệ thống sẽ:

> *(Bắt đầu điền form đăng ký)*
> - Nhập username: `demo_user`
> - Email: `hieple5@gmail.com` *(dùng email thật của bạn)*
> - Password: `123456`
> - Họ tên: `Nguyễn Demo`
> - SĐT: `0901234567`

> *(Nhấn nút Đăng ký)*

> Ngay lập tức, backend sẽ:
> 1. Generate một mã OTP 6 số ngẫu nhiên
> 2. Lưu vào database với thời gian hết hạn 5 phút
> 3. Gửi email thông qua Gmail SMTP

> *(Chuyển sang tab Gmail)*

> Như các bạn thấy, email đã được gửi tức thì với:
> - Mã OTP 6 chữ số
> - Thời gian hết hạn
> - Giao diện chuyên nghiệp với HTML/CSS

> *(Quay lại trang web, nhập OTP)*

> Sau khi nhập OTP đúng, tài khoản được active và chuyển sang trang login.

> **Công nghệ:**
> - Backend: Spring Boot + JavaMailSender
> - Template: Thymeleaf HTML email
> - Security: OTP expire sau 5 phút, hash password bằng BCrypt"

---

### 🚌 DEMO 2: TÌM VÉ + ĐẶT VÉ KHỨ HỒI (2 phút)

**Chuẩn bị:**
- Login với user vừa tạo
- Mở trang chủ `http://localhost:5173/`

**Script:**

> "Bây giờ user đã đăng nhập thành công. Em sẽ demo flow đặt **vé khứ hồi**:

> *(Tại trang chủ)*
> - Chọn điểm đi: **Nha Trang**
> - Chọn điểm đến: **Đà Nẵng**
> - Ngày đi: **29/11/2025**
> - Ngày về: **30/11/2025**
> - Chọn: **Khứ hồi** ✅

> *(Nhấn Tìm chuyến)*

> Hệ thống sẽ query database tìm các chuyến xe phù hợp với cả 2 hướng.

> *(Trang kết quả hiển thị)*

> Chọn chuyến đi 8:00 và chuyến về 10:00.

> *(Nhấn Đặt vé → chuyển sang trang chọn ghế)*

> **Giao diện chọn ghế:**
> - Hiển thị sơ đồ xe real-time
> - Ghế xanh = trống, xám = đã đặt, cam = đang chọn
> - Có **2 tab**: Chuyến đi & Chuyến về
> - Chọn ghế A02 cho chuyến đi
> - Chuyển tab, chọn ghế A03 cho chuyến về

> **Điểm đón/trả:**
> - ComboBox load danh sách trạm từ database
> - Chọn 'Bến xe Nha Trang' → 'Bến xe Đà Nẵng'
> - Chiều về ngược lại

> *(Xem phần Tổng kết vé khứ hồi)*

> Hệ thống tự động:
> - Tính tổng tiền 2 vé
> - **Áp dụng giảm giá 10%** cho vé khứ hồi
> - Hiển thị chi tiết đầy đủ

> *(Nhấn Thanh toán)*"

---

### 💳 DEMO 3: THANH TOÁN VNPAY/MOMO (2 phút)

**Chuẩn bị:**
- Trang payment đã load
- Có thông tin test MoMo/VNPay sẵn

**Script:**

> "**Tính năng nâng cao số 2: Tích hợp VNPay & MoMo**

> *(Tại trang thanh toán)*

> Hệ thống hỗ trợ 2 cổng thanh toán:

> **Option 1: VNPay**
> - Chọn VNPay → Nhấn Thanh toán
> - Redirect sang VNPay sandbox
> - Hiển thị QR code và số tiền chính xác
> - Sau khi quét QR (hoặc test mode), VNPay callback về backend

> **Option 2: MoMo** *(Em sẽ demo cái này)*
> - Chọn MoMo → Nhấn Thanh toán
> - *(Trang MoMo sandbox mở ra)*
> - Số tiền: 180,000đ (đã giảm 10%)
> - Transaction ID tự động generate

> *(Nhập thông tin test MoMo)*
> - SĐT: `0987654321`
> - OTP: `123456` (test mode)

> *(Nhấn Xác nhận thanh toán)*

> MoMo sẽ redirect về `/payment/result` với các params:
> - `orderId`: BOOKING-xyz...
> - `transactionId`: MoMo transaction ID
> - `resultCode`: 0 (success)

> Backend xử lý:
> 1. Verify signature từ MoMo
> 2. Update payment status → `completed`
> 3. Update ticket status → `confirmed`
> 4. **Trigger gửi email hóa đơn tự động**

> **Công nghệ:**
> - VNPay SDK + HMAC-SHA512 signature
> - MoMo API + RSA signature verification
> - Transaction ID tracking
> - Retry mechanism khi callback fail"

---

### 📧 DEMO 4: EMAIL HÓA ĐƠN TỰ ĐỘNG (2 phút)

**Chuẩn bị:**
- Gmail đã mở sẵn
- Trang admin/payments mở sẵn

**Script:**

> "**Tính năng nâng cao số 3: Email hóa đơn tự động**

> Sau khi thanh toán thành công, hệ thống **TỰ ĐỘNG** gửi email hóa đơn.

> *(Chuyển sang Gmail)*

> **Email hóa đơn bao gồm:**

> *(Scroll qua email)*

> 1. **Header thông tin:**
>    - Số hóa đơn = Transaction ID từ MoMo/VNPay
>    - Phương thức: **MoMo** (đọc từ database)
>    - Ngày thanh toán: Real-time từ payment gateway
>    - Thông tin khách hàng

> 2. **Chi tiết chuyến đi - Box màu xanh lá:**
>    - Nha Trang → Đà Nẵng
>    - Giờ khởi hành: 08:00:30 29/11/2025
>    - Số ghế: A02
>    - Biển số xe: 51B-12345
>    - **Điểm đón**: Bến xe Nha Trang
>    - **Điểm trả**: Bến xe Đà Nẵng

> 3. **Chi tiết chuyến về - Box màu xanh dương:**
>    - Đà Nẵng → Nha Trang
>    - Giờ khởi hành: 10:01:02 30/11/2025
>    - Số ghế: A03
>    - Điểm đón/trả ngược lại

> 4. **Chi tiết thanh toán:**
>    - Vé chiều đi: 100,000đ
>    - Vé chiều về: 100,000đ
>    - 🎁 Giảm giá 10%: -20,000đ
>    - **TỔNG CỘNG: 180,000đ**

> **Điểm đặc biệt:**
> - Email responsive (mobile-friendly)
> - Giao diện giống trang tra cứu vé của customer
> - Tự động trigger khi admin confirm payment (vì sandbox không callback localhost)

> **Công nghệ:**
> - Thymeleaf Template Engine
> - JavaMailSender + Gmail SMTP
> - HTML/CSS inline styling
> - Template variables từ backend"

---

### 🗺️ DEMO 5: ADMIN - MAP INTEGRATION (2 phút)

**Chuẩn bị:**
- Login admin: `admin` / `123456`
- Mở `http://localhost:5173/admin/stations`

**Script:**

> "**Tính năng nâng cao số 4: OpenStreetMap Integration**

> Admin dashboard có 2 tính năng map nâng cao:

> **1. Quản lý Trạm xe (`/admin/stations`)**

> *(Nhấn nút 'Thêm trạm mới')*

> - Hiển thị **bản đồ OpenStreetMap** full-screen
> - Tích hợp **Leaflet.js** cho interactive map
> - Search bar với **Nominatim geocoding API**

> *(Gõ 'Bến xe Huế' vào search)*

> - Tự động tìm kiếm và zoom đến vị trí
> - Click trên map để chọn vị trí chính xác
> - Hiển thị marker đỏ tại điểm đã chọn
> - **Reverse geocoding**: Tự động điền địa chỉ và tọa độ

> *(Các field tự động điền)*
> - Tên: Bến xe Huế
> - Địa chỉ: Full address từ OpenStreetMap
> - Thành phố: **Huế** (tự động detect)
> - Tọa độ: Latitude + Longitude

> *(Nhấn Thêm mới)*

> Dữ liệu lưu vào database với địa chỉ và tọa độ chính xác.

> **2. Quản lý Tuyến đường (`/admin/routes`)**

> *(Chuyển sang tab Routes)*

> *(Nhấn 'Thêm tuyến mới')*

> - Chọn thành phố đi: **Nha Trang**
> - Chọn thành phố đến: **Đà Nẵng**
> - Bản đồ hiển thị **2 markers** cho 2 thành phố

> *(Nhấn nút 'Tính toán tự động')*

> **Tính năng tự động:**
> 1. Gọi **OSRM API** (Open Source Routing Machine)
> 2. Tính khoảng cách theo **đường đi thực tế** (không phải đường chim bay)
> 3. Tính thời gian dự kiến
> 4. **Auto-generate giá vé** dựa trên:
>    - Khoảng cách (km)
>    - Công thức: `basePrice = distance × 1000 + 50000`

> *(Hiển thị đường đi trên map)*
> - Đường màu xanh dương từ Nha Trang → Đà Nẵng
> - Hiển thị khoảng cách: **612 km**
> - Thời gian: **7.5 giờ**
> - Giá tự động: **595,000đ**

> Admin có thể:
> - Chỉnh sửa giá thủ công nếu cần
> - Lưu tuyến với thông tin chi tiết

> **Công nghệ:**
> - OpenStreetMap + Leaflet.js
> - Nominatim Geocoding API (search địa chỉ)
> - OSRM API (routing & distance calculation)
> - React Hooks cho state management
> - Real-time map interaction"

---

## 🏗️ PHẦN 3: KIẾN TRÚC & CÔNG NGHỆ (2 phút)

**Script:**

> "Về kiến trúc tổng thể:

> **Backend - Spring Boot:**
> - Java 21
> - Spring Security + JWT Authentication
> - JPA/Hibernate + MySQL
> - Email: JavaMailSender + Thymeleaf
> - Payment: VNPay/MoMo SDK integration
> - Map APIs: OSRM, Nominatim

> **Frontend - React:**
> - React 18 + TypeScript
> - Vite (build tool)
> - TailwindCSS + Shadcn UI
> - Axios cho API calls
> - React Leaflet cho maps
> - Context API cho authentication state

> **Database - MySQL:**
> - 15 tables chính
> - Foreign keys đầy đủ
> - Indexes cho performance
> - Support cả one-way và round-trip tickets

> **Advanced Features Implementation:**

> 1. **OTP System:**
>    - `users` table: `otp_code`, `otp_expires_at`, `email_verified`
>    - Random 6-digit generation
>    - Expire after 5 minutes
>    - Email template with Thymeleaf

> 2. **Payment Integration:**
>    - `payments` table: `transaction_id`, `payment_method`, `booking_group_id`
>    - Signature verification (HMAC-SHA512 for VNPay, RSA for MoMo)
>    - Callback handling with retry mechanism
>    - Transaction logging

> 3. **Email System:**
>    - Gmail SMTP configuration
>    - Thymeleaf templates (ticket + invoice)
>    - Async sending (non-blocking)
>    - HTML email with inline CSS
>    - Trigger on payment confirmation

> 4. **Map Integration:**
>    - `stations` table: `latitude`, `longitude`, `city`
>    - Leaflet React components
>    - Geocoding service layer
>    - OSRM routing service
>    - Distance-based pricing algorithm"

---

## 🎓 PHẦN 4: KẾT LUẬN (1 phút)

**Script:**

> "Tóm lại, project của nhóm em đã hoàn thành:

> **Chức năng cơ bản:**
> ✅ Đăng ký/Đăng nhập user
> ✅ Tìm kiếm và đặt vé (1 chiều + khứ hồi)
> ✅ Chọn ghế, điểm đón/trả
> ✅ Admin dashboard quản lý toàn bộ

> **4 Tính năng nâng cao đã demo:**
> ✅ 🔐 OTP Authentication qua Email
> ✅ 💳 VNPay & MoMo Payment Integration
> ✅ 📧 Automatic Invoice Email System
> ✅ 🗺️ OpenStreetMap với Geocoding & Routing

> **Thách thức đã vượt qua:**
> - Tích hợp 2 payment gateway khác nhau
> - Xử lý sandbox callback không hoạt động với localhost
> - Tính toán giá động dựa trên bản đồ
> - Template email responsive và đẹp

> **Kết quả:**
> - Hệ thống hoạt động end-to-end hoàn chỉnh
> - Code clean, có documentation
> - Database normalized
> - UI/UX thân thiện

> Em xin cảm ơn thầy/cô và các bạn đã lắng nghe. Nhóm em sẵn sàng trả lời câu hỏi ạ!"

---

## 📋 CHECKLIST TRƯỚC KHI THUYẾT TRÌNH

### Backend (Port 8080):
- [ ] Backend đang chạy: `mvn spring-boot:run`
- [ ] Database import xong `current_dtb.sql`
- [ ] Gmail SMTP configured trong `application.properties`
- [ ] Check log không có error

### Frontend (Port 5173):
- [ ] Frontend đang chạy: `npm run dev`
- [ ] Clear browser cache + localStorage
- [ ] Test login admin: `admin` / `123456`

### Demo Data:
- [ ] Có ít nhất 2 tuyến xe: Nha Trang ↔ Đà Nẵng
- [ ] Trips available cho ngày demo
- [ ] Stations có tọa độ đầy đủ

### Email:
- [ ] Gmail inbox sạch (delete old test emails)
- [ ] Gmail mở sẵn trong tab khác
- [ ] Test gửi 1 email trước khi trình bày

### Payment:
- [ ] MoMo test credentials ready
- [ ] VNPay test credentials ready
- [ ] Admin payments page test confirm được

### Map:
- [ ] `/admin/stations` map load đúng
- [ ] `/admin/routes` routing calculation works
- [ ] Internet connection stable (cần cho map APIs)

---

## 🎯 TIPS THUYẾT TRÌNH

1. **Nói chậm, rõ ràng** - Giáo viên cần hiểu tech
2. **Nhấn mạnh "tính năng nâng cao"** mỗi khi demo
3. **Show code snippet** nếu giáo viên hỏi implementation
4. **Chuẩn bị trước các tab:**
   - Tab 1: Homepage (login sẵn)
   - Tab 2: Gmail
   - Tab 3: Admin dashboard (login sẵn)
   - Tab 4: Code editor (show 1 file quan trọng)

5. **Nếu có lỗi:**
   - Giải thích lý do (VD: sandbox callback issue)
   - Show workaround (VD: admin manual confirm)
   - Vẫn demo được tính năng

6. **Câu hỏi có thể gặp:**

   **Q: "Tại sao dùng OTP qua email thay vì SMS?"**
   > A: "Em chọn email vì: 1) Free (SMS tốn phí), 2) Dễ test và debug, 3) User có thể lưu lại OTP trong inbox. Production thực tế có thể tích hợp SMS qua Twilio hoặc VNPT."

   **Q: "Payment sandbox có callback về localhost không?"**
   > A: "Không ạ, vì localhost không có public IP. Workaround của em là admin xác nhận thủ công sau khi thấy user đã thanh toán. Production thực tế cần deploy lên server với domain public."

   **Q: "Map API có giới hạn request không?"**
   > A: "OpenStreetMap Nominatim có rate limit 1 request/giây. Em đã implement debounce trong search và cache results để tránh vượt limit."

   **Q: "Database có handle concurrent booking không?"**
   > A: "Có ạ, em dùng transaction isolation level và lock seat khi user đang chọn. Seat status có 3 states: available, locked (5 phút), booked."

---

## 🚀 GOOD LUCK!

**Remember:** 
- Confidence > Perfection
- Demo > Theory
- Show code khi cần
- Smile & enjoy! 🎉

