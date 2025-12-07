# 🚌 Hệ Thống Đặt Vé Xe Khách Trực Tuyến

**Bus Booking System** - Nền tảng đặt vé xe khách trực tuyến hiện đại với thanh toán đa kênh (VNPay, MoMo)

---

## 📋 Giới Thiệu

Đây là project môn học J2EE - Hệ thống đặt vé xe khách trực tuyến được xây dựng với kiến trúc **Multi-tier Architecture**, tích hợp:
- ✅ Thanh toán trực tuyến (VNPay Sandbox + MoMo Test Gateway)
- ✅ Email tự động (OTP, hóa đơn PDF)
- ✅ Bản đồ tương tác (OpenStreetMap + Leaflet)
- ✅ Báo cáo động (JasperReports, Excel)
- ✅ Quản lý ghế realtime với khóa tạm thời

---

## 🛠️ Công Nghệ

| **Lớp**              | **Công nghệ**                          | **Mục đích**                                      |
|----------------------|----------------------------------------|--------------------------------------------------|
| **Backend**          | Spring Boot 3.4.1                      | REST API Framework                               |
| **Security**         | Spring Security + JWT                  | Xác thực, phân quyền                             |
| **Database**         | MySQL 8.0                              | Lưu trữ dữ liệu                                  |
| **ORM**              | Spring Data JPA + Hibernate            | Ánh xạ Object-Relational                         |
| **Email**            | Spring Mail + Thymeleaf                | Gửi email HTML template                          |
| **Payment**          | VNPay Sandbox + MoMo Test API          | Thanh toán trực tuyến (môi trường test)          |
| **Maps (Display)**   | OpenStreetMap + Leaflet.js             | Hiển thị bản đồ tương tác                        |
| **Maps (Distance)**  | Google Maps Distance Matrix API        | Tính khoảng cách và thời gian                    |
| **Reporting**        | JasperReports + Apache POI             | Xuất PDF và Excel                                |
| **File Storage**     | Cloudinary                             | Lưu trữ ảnh tài xế                               |
| **Frontend**         | React 18 + TypeScript                  | Giao diện người dùng SPA                         |
| **UI Library**       | Tailwind CSS + Shadcn UI               | Thiết kế responsive                              |
| **Build Tool**       | Vite + Maven                           | Build frontend/backend                           |
| **Containerization** | Docker + Docker Compose                | Deploy môi trường dev                            |

---

## 🚀 Hướng Dẫn Cài Đặt (Docker Desktop)

### ✅ Yêu Cầu
- **Docker Desktop** đã cài đặt và chạy ([Download tại đây](https://www.docker.com/products/docker-desktop/))
- **RAM:** Tối thiểu 4GB
- **Disk:** 5GB trống
- **Port:** 3306 (MySQL), 5173 (Frontend), 8080 (Backend), 8081 (phpMyAdmin)

---

### 📦 Bước 1: Chuẩn Bị File

Đảm bảo bạn có các file sau trong thư mục gốc:

```
ProjectBusBooking/
├── docker-compose.yml       # File cấu hình Docker
├── .env.example             # File mẫu cấu hình môi trường
├── bus_booking.sql          # File database khởi tạo
├── backend/                 # Source code backend
├── frontend-react/          # Source code frontend
└── README.md                # File này
```

---

### 🔧 Bước 2: Cấu Hình Environment

**Tạo file `.env`** từ `.env.example`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

**Chỉnh sửa file `.env`** với thông tin thực tế của bạn:

```properties
# ============================================
# DATABASE CONFIGURATION
# ============================================
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=bus_booking
MYSQL_USER=busbooking_user
MYSQL_PASSWORD=busbooking_pass

# ============================================
# SPRING DATASOURCE
# ============================================
SPRING_DATASOURCE_URL=jdbc:mysql://bus-booking-db:3306/bus_booking
SPRING_DATASOURCE_USERNAME=busbooking_user
SPRING_DATASOURCE_PASSWORD=busbooking_pass

# ============================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ============================================
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# ============================================
# VNPAY SANDBOX (Test Environment)
# ============================================
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/result

# ============================================
# MOMO TEST GATEWAY (Test Environment)
# ============================================
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5173/payment/result
MOMO_NOTIFY_URL=http://localhost:8080/api/payment/momo/callback

# ============================================
# CLOUDINARY (Image Storage for Driver Photos)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# GOOGLE MAPS API (Distance Calculation)
# ============================================
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

> **⚠️ Lưu ý:** File `.env` chứa thông tin nhạy cảm. **KHÔNG** commit file này lên Git.

---

### ▶️ Bước 3: Chạy Docker Compose

**1. Mở Docker Desktop** → Đảm bảo Docker đang chạy

**2. Mở Terminal/PowerShell** tại thư mục gốc project

**3. Khởi động hệ thống:**

```bash
docker-compose up -d
```

**4. Kiểm tra trạng thái:**

```bash
docker-compose ps
```

Kết quả mong đợi:

```
NAME                        STATUS          PORTS
bus-booking-db              Up              0.0.0.0:3306->3306/tcp
bus-booking-backend         Up              0.0.0.0:8080->8080/tcp
bus-booking-frontend        Up              0.0.0.0:5173->5173/tcp
bus-booking-phpmyadmin      Up              0.0.0.0:8081->80/tcp
```

**5. Đợi các service khởi động hoàn tất** (khoảng 2-3 phút):

```bash
# Xem logs để kiểm tra
docker-compose logs -f
```

Tìm các dòng sau để biết service đã sẵn sàng:

- **Database:** `mysqld: ready for connections`
- **Backend:** `Started BusBookingApplication in X seconds`
- **Frontend:** `Local: http://localhost:5173/`

---

### 🌐 Bước 4: Truy Cập Hệ Thống

| **Dịch vụ**       | **URL**                           | **Thông tin đăng nhập**              |
|-------------------|-----------------------------------|--------------------------------------|
| **Frontend**      | http://localhost:5173             | -                                    |
| **Backend API**   | http://localhost:8080/api         | -                                    |
| **phpMyAdmin**    | http://localhost:8081             | User: `root`, Pass: `root_password`  |
| **Admin Panel**   | http://localhost:5173/admin/login | User: `admin`, Pass: `admin123`      |

---

### 🧪 Tài Khoản Test

#### Admin
- **Username:** `admin`
- **Password:** `admin123`

#### User (Khách hàng)
- **Username:** `user1`
- **Password:** `password123`

#### VNPay Sandbox (Thẻ test)
- **Số thẻ:** `9704198526191432198`
- **Tên:** `NGUYEN VAN A`
- **Ngày hết hạn:** `07/15`
- **Mã OTP:** `123456`

#### MoMo Test
- **Số điện thoại:** `0963181714`
- **OTP:** `111111`

---

## 🛑 Quản Lý Docker Containers

### Dừng hệ thống (giữ data)
```bash
docker-compose stop
```

### Khởi động lại
```bash
docker-compose start
```

### Dừng và xóa containers (giữ data trong volumes)
```bash
docker-compose down
```

### Xóa hoàn toàn (bao gồm cả data)
```bash
docker-compose down -v
```

### Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Rebuild containers (sau khi sửa code)
```bash
docker-compose up -d --build
```

---

## 🐛 Xử Lý Sự Cố

### ❌ Lỗi: Port đã được sử dụng

**Triệu chứng:**
```
Error starting userland proxy: listen tcp 0.0.0.0:3306: bind: address already in use
```

**Giải pháp:**

**Option 1:** Tắt MySQL/XAMPP đang chạy

**Option 2:** Đổi port trong `docker-compose.yml`:
```yaml
database:
  ports:
    - "3307:3306"  # Đổi 3306 → 3307
```

Sau đó cập nhật `.env`:
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://bus-booking-db:3307/bus_booking
```

---

### ❌ Lỗi: Database không kết nối được

**Triệu chứng:** Backend báo lỗi `CommunicationsException`

**Giải pháp:**

```bash
# 1. Kiểm tra database logs
docker-compose logs database | tail -50

# 2. Restart database
docker-compose restart database

# 3. Đợi 30s rồi restart backend
docker-compose restart backend
```

---

### ❌ Lỗi: Frontend không build được

**Triệu chứng:** `npm install failed` hoặc `ENOENT`

**Giải pháp:**

```bash
# Xóa node_modules và rebuild
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose restart frontend
```

---

### ❌ Lỗi: Backend không start

**Triệu chứng:** `Application run failed`

**Kiểm tra:**

1. **Database đã sẵn sàng chưa?**
   ```bash
   docker-compose logs database | grep "ready for connections"
   ```

2. **File `.env` đã đúng chưa?**
    - Kiểm tra `SPRING_DATASOURCE_URL` có đúng hostname `bus-booking-db`
    - Kiểm tra username/password khớp với `MYSQL_USER`/`MYSQL_PASSWORD`

3. **Xem logs chi tiết:**
   ```bash
   docker-compose logs backend | tail -100
   ```

---

## 📖 Tài Liệu Tham Khảo

1. [Spring Boot Documentation](https://spring.io/projects/spring-boot)
2. [React Documentation](https://react.dev/)
3. [VNPay Sandbox Guide](https://sandbox.vnpayment.vn/apis/)
4. [MoMo Developers](https://developers.momo.vn/v3/vi/docs/payment/onboarding/overall/)
5. [Cloudinary Documentation](https://cloudinary.com/)
6. [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix)
7. [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 👥 Nhóm Phát Triển

| **STT** | **Họ tên**              | **Đánh giá (%)** |
|---------|-------------------------|------------------|
| 1       | Lê Nguyễn Nhật Tâm      | 33%              |
| 2       | Đoàn Tuấn Tài           | 33%              |
| 3       | Lưu Hồng Phúc           | 33%              |

---



## 📧 Liên Hệ

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ qua email: **lnntam04@gmail.com**

---

**🎉 Chúc bạn triển khai thành công!**

