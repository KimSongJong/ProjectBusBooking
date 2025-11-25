# 🚌 TPT Bus Booking System - Internal Documentation

> **📅 Last Updated:** 26/11/2025  
> **👥 Team:** LNNT + 2 thành viên  
> **🎯 Project:** Clone FUTA Phương Trang Bus booking system

---

## 📋 MỤC LỤC

- [1. QUICK START](#1-quick-start)
- [2. KIẾN TRÚC HỆ THỐNG](#2-kiến-trúc-hệ-thống)
- [3. DATABASE](#3-database)
- [4. BACKEND SETUP](#4-backend-setup)
- [5. FRONTEND SETUP](#5-frontend-setup)
- [6. TÍNH NĂNG CHÍNH](#6-tính-năng-chính)
- [7. API ENDPOINTS](#7-api-endpoints)
- [8. TROUBLESHOOTING](#8-troubleshooting)
- [9. GHI CHÚ QUAN TRỌNG](#9-ghi-chú-quan-trọng)

---

## 1. QUICK START

### 🚀 Khởi động nhanh (3 bước)

```bash
# Bước 1: Start MySQL (XAMPP)
# Bước 2: Import database current_dtb.sql
# Bước 3: Chạy batch file
START_ALL.bat
```

### 📍 URLs sau khi start

| Service | URL | Note |
|---------|-----|------|
| Frontend (Customer) | http://localhost:5173 | Trang đặt vé |
| Admin Dashboard | http://localhost:5173/admin/login | Quản lý hệ thống |
| Backend API | http://localhost:8080/api | REST API |
| Database | localhost:3306 | MySQL |

### 👤 Accounts mẫu

**Admin:**
```
Username: admin
Password: admin123
```

**Customer:**
```
Username: LNNT
Password: 123456
Email: 12345levan@gmail.com
```

---

## 2. KIẾN TRÚC HỆ THỐNG

### 🏗️ Tech Stack

**Backend:**
- ☕ Java 25.0.1
- 🍃 Spring Boot 3.4.1
- 🗄️ MySQL 8.0
- 🔐 Spring Security + JWT
- 📦 Maven 3.9.11

**Frontend:**
- ⚛️ React 19.2.0
- ⚡ Vite 7.1.9
- 🎨 TypeScript 5.7.3
- 💅 Tailwind CSS + Shadcn/ui
- 📦 pnpm 10.19.0

### 📂 Cấu trúc Backend

```
backend/
├── controller/          # REST API endpoints
│   ├── StationController.java     # ✅ Fixed: /api/stations
│   ├── RouteController.java       # ✅ Fixed: /api/routes/calculate
│   ├── TicketController.java      # ✅ Fixed: CRUD + Round Trip
│   └── ...
├── service/             # Business logic
│   ├── TicketService.java         # ✅ Round trip booking
│   ├── StationService.java        # ✅ Station CRUD
│   ├── RouteService.java          # ✅ OpenStreetMap integration
│   └── ...
├── repository/          # Data access (JPA)
├── model/              # Entity classes
│   ├── Ticket.java              # ✅ Round trip fields
│   ├── Station.java             # ✅ Coordinates
│   └── ...
├── dto/                # Request/Response DTOs
├── config/
│   ├── SecurityConfig.java      # ✅ Fixed: CORS + permitAll
│   └── CorsConfig.java          # ✅ Global CORS
└── exception/          # Custom exceptions
```

### 📂 Cấu trúc Frontend

```
frontend-react/src/
├── pages/
│   ├── Home.tsx                # Trang chủ
│   ├── BookingSeat.tsx         # ✅ Chọn ghế (1 chiều + khứ hồi)
│   ├── Invoice.tsx             # ✅ In vé
│   └── Adminpage/
│       ├── AdminStations.tsx   # ✅ Quản lý trạm xe
│       ├── AdminRoutes.tsx     # ✅ Quản lý tuyến + Auto calculate
│       ├── AdminTickets.tsx    # ✅ Quản lý vé
│       └── ...
├── services/
│   ├── ticket.service.ts       # ✅ Round trip API
│   ├── station.service.ts
│   └── route.service.ts
└── config/
    ├── axios.ts               # API client với auth
    └── constants.ts           # API_BASE_URL
```

---

## 3. DATABASE

### 📊 Database: `bus_booking`

**File SQL chính:** `current_dtb.sql`

### 🔑 Các bảng quan trọng

#### Stations (Trạm xe)
```sql
CREATE TABLE stations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  station_name VARCHAR(255),
  city VARCHAR(100),
  province VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),      -- ✅ Tọa độ GPS
  longitude DECIMAL(11, 8),     -- ✅ Tọa độ GPS
  phone VARCHAR(20),
  station_type ENUM('departure', 'arrival', 'both'),
  is_active TINYINT(1) DEFAULT 1
);
```

#### Tickets (Vé xe) - ✅ Hỗ trợ khứ hồi
```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  trip_id INT,
  seat_id INT,
  trip_seat_id INT,
  promotion_id INT,
  price DECIMAL(10,2),
  status ENUM('booked', 'confirmed', 'cancelled'),
  
  -- ✅ Round trip fields
  trip_type ENUM('one_way', 'round_trip') DEFAULT 'one_way',
  is_return_trip TINYINT(1) DEFAULT 0,
  linked_ticket_id INT,                  -- Link vé đi ↔ vé về
  booking_group_id VARCHAR(50),          -- Group tickets together
  
  -- Customer info
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  pickup_point VARCHAR(255),             -- ✅ Điểm đón
  dropoff_point VARCHAR(255),            -- ✅ Điểm trả
  notes TEXT,
  
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  
  FOREIGN KEY (linked_ticket_id) REFERENCES tickets(id)
);
```

#### Routes (Tuyến đường) - ✅ Auto calculate
```sql
CREATE TABLE routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from_location VARCHAR(255),
  to_location VARCHAR(255),
  distance_km INT,                      -- ✅ Auto từ OpenStreetMap
  estimated_duration INT,               -- ✅ Auto (phút)
  base_price DECIMAL(10,2),            -- ✅ Auto calculate
  pickup_points TEXT,                   -- JSON array
  dropoff_points TEXT,                  -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🔄 Import Database

```bash
# Option 1: Import qua phpMyAdmin
1. Mở http://localhost/phpmyadmin
2. Create database: bus_booking
3. Import file: current_dtb.sql

# Option 2: Import qua command line
mysql -u root -p bus_booking < current_dtb.sql
```

---

## 4. BACKEND SETUP

### ⚙️ Configuration

**File:** `backend/src/main/resources/application.properties`

```properties
# Server Config
server.port=8080
server.servlet.context-path=/api    # ✅ All endpoints có prefix /api

# Database Config
spring.datasource.url=jdbc:mysql://localhost:3306/bus_booking
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Config
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true

# JWT Config
app.jwt.secret=<your-secret-key>
app.jwt.expiration=86400000

# Google Maps API (Deprecated - Đã chuyển sang OpenStreetMap)
# google.maps.api.key=<not-used>
```

### 🔧 Backend Endpoints (Important!)

**⚠️ LƯU Ý:** Backend có `context-path=/api` nên tất cả endpoints đều có prefix `/api`

#### Controller Mapping vs Actual Endpoint

| Controller | @RequestMapping | Actual Endpoint |
|------------|----------------|-----------------|
| StationController | `/stations` | `/api/stations` ✅ |
| RouteController | `/routes` | `/api/routes` ✅ |
| TicketController | `/tickets` | `/api/tickets` ✅ |

**❌ SAI:**
```java
@RestController
@RequestMapping("/api/stations")  // ❌ Wrong! → /api/api/stations
```

**✅ ĐÚNG:**
```java
@RestController
@RequestMapping("/stations")       // ✅ Correct! → /api/stations
```

### 🚀 Start Backend

```bash
# Option 1: Batch file
START_BACKEND.bat

# Option 2: Maven command
cd backend
mvn spring-boot:run

# Option 3: Run compiled JAR
java -jar target/bus-booking-backend-1.0.0.jar
```

### ✅ Verify Backend đang chạy

```bash
# Test endpoint
curl http://localhost:8080/api/stations
```

---

## 5. FRONTEND SETUP

### 📦 Install Dependencies

```bash
cd frontend-react
pnpm install
```

### ⚙️ Configuration

**File:** `frontend-react/src/config/constants.ts`

```typescript
export const API_BASE_URL = "http://localhost:8080/api"  // ✅ Include /api prefix
```

### 🚀 Start Frontend

```bash
# Development mode
pnpm run dev

# Production build
pnpm run build
pnpm run preview
```

### 📱 Pages

**Customer Pages:**
- `/` - Home page (Tìm kiếm chuyến)
- `/booking-seat?tripId=X` - Chọn ghế 1 chiều
- `/booking-seat?outboundTripId=X&returnTripId=Y&tripType=roundTrip` - Chọn ghế khứ hồi ✅
- `/invoice?bookingGroupId=X` - In vé ✅
- `/my-tickets` - Lịch sử đặt vé

**Admin Pages:**
- `/admin/login` - Login admin
- `/admin/dashboard` - Tổng quan
- `/admin/stations` - ✅ Quản lý trạm xe
- `/admin/routes` - ✅ Quản lý tuyến + Auto calculate
- `/admin/tickets` - ✅ Quản lý vé (CRUD + Delete round trip)
- `/admin/trips` - Quản lý chuyến xe
- `/admin/seats` - Quản lý ghế

---

## 6. TÍNH NĂNG CHÍNH

### ✅ Đã hoàn thành

#### 🎫 **Round Trip Booking (Vé khứ hồi)**
- ✅ Chọn 2 chuyến (đi + về) cùng lúc
- ✅ Áp dụng giảm giá 10% cho vé khứ hồi
- ✅ Link vé đi ↔ vé về (`linked_ticket_id`)
- ✅ Group tickets với `booking_group_id`
- ✅ Delete cả 2 vé khi xóa vé khứ hồi
- ✅ In vé khứ hồi (Invoice page)

**Backend:**
```java
// POST /api/tickets/round-trip
RoundTripBookingResponse createRoundTripBooking(RoundTripBookingRequest request)

// DELETE /api/tickets/{id}
void deleteTicket(Integer id)  // ✅ Auto delete linked ticket
```

**Frontend:**
```typescript
// Round trip booking flow
BookingSeat.tsx -> Select seats for both trips -> Create booking
```

#### 🗺️ **Station Management (Quản lý trạm xe)**
- ✅ CRUD trạm xe
- ✅ Lưu tọa độ GPS (latitude, longitude)
- ✅ OpenStreetMap autocomplete cho địa chỉ
- ✅ Lọc theo thành phố, trạng thái
- ✅ Tìm kiếm trạm

**Endpoint:** `/api/stations`

#### 🛣️ **Route Management + Auto Calculate**
- ✅ CRUD tuyến đường
- ✅ **Tự động tính toán:**
  - Khoảng cách (km) - OpenStreetMap API
  - Thời gian ước tính (giờ, phút)
  - Giá vé (dựa trên khoảng cách)
- ✅ Chọn trạm đi/đến từ dropdown
- ✅ Click "Tự động tính toán" → Auto fill form

**Endpoint:** `/api/routes/calculate?fromStation=X&toStation=Y`

**Example response:**
```json
{
  "distance": 414.85,
  "duration": 293,
  "price": 437000,
  "routeInfo": "Bến xe Miền Đông (TP Hồ Chí Minh) → Bến xe Nha Trang (Nha Trang)"
}
```

#### 🎟️ **Ticket Management**
- ✅ CRUD tickets
- ✅ Update status (booked → confirmed → cancelled)
- ✅ Delete vé 1 chiều
- ✅ Delete vé khứ hồi (auto delete cả 2 vé)
- ✅ View by booking group
- ✅ Filter by status, date

### 🚧 Chưa hoàn thành / Cần cải thiện

- ⏳ **SMS API:** Gửi SMS xác nhận vé (để sau)
- ⏳ **Partial Cancel:** Chỉ hủy vé đi HOẶC vé về (chưa implement UI)
- ⏳ **Refund Calculation:** Tính tiền hoàn theo policy
- ⏳ **Real-time Seat Updates:** WebSocket cho ghế
- ⏳ **Payment Gateway:** Tích hợp VNPay/MoMo (đã có code mẫu)

---

## 7. API ENDPOINTS

### 🔐 Authentication

**Public endpoints (no auth):**
```
POST /api/auth/login
POST /api/auth/register
```

**Protected endpoints:** Cần JWT token trong header
```
Authorization: Bearer <token>
```

### 📍 Stations API

```http
# Get all stations
GET /api/stations

# Get by ID
GET /api/stations/{id}

# Create station (ADMIN)
POST /api/stations
Content-Type: application/json
{
  "stationName": "Bến xe Miền Đông",
  "city": "TP Hồ Chí Minh",
  "province": "TP Hồ Chí Minh",
  "address": "292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh",
  "latitude": 10.8142,
  "longitude": 106.7089,
  "phone": "028 3829 3232",
  "stationType": "both"
}

# Update station (ADMIN)
PUT /api/stations/{id}

# Delete station (ADMIN)
DELETE /api/stations/{id}
```

### 🛣️ Routes API

```http
# Get all routes
GET /api/routes

# Auto calculate route
GET /api/routes/calculate?fromStation=2&toStation=4

# Create route (ADMIN)
POST /api/routes
{
  "fromLocation": "TP Hồ Chí Minh",
  "toLocation": "Nha Trang",
  "distanceKm": 414,
  "estimatedDuration": 293,
  "basePrice": 437000
}
```

### 🎫 Tickets API

```http
# Get all tickets
GET /api/tickets

# Create round trip booking
POST /api/tickets/round-trip
{
  "userId": 2,
  "tripType": "round_trip",
  "outboundTripId": 19,
  "outboundSeats": ["A1", "A2"],
  "returnTripId": 154,
  "returnSeats": ["A1", "A2"],
  "customerName": "Lê Nguyễn Nhất Tâm",
  "customerPhone": "0868253404",
  "customerEmail": "12345levan@gmail.com",
  "outboundPickupLocation": "Bến xe Miền Đông",
  "outboundDropoffLocation": "Bến xe Nha Trang",
  "returnPickupLocation": "Bến xe Nha Trang",
  "returnDropoffLocation": "Bến xe Miền Đông"
}

# Get tickets by booking group
GET /api/tickets/booking-group/{groupId}

# Update ticket (ADMIN)
PUT /api/tickets/{id}
{
  "status": "confirmed"
}

# Delete ticket (ADMIN) - Auto delete linked ticket
DELETE /api/tickets/{id}
```

---

## 8. TROUBLESHOOTING

### ❌ Common Errors & Solutions

#### 1. **CORS Error: "No 'Access-Control-Allow-Origin' header"**

**Nguyên nhân:** Duplicate CORS headers

**Fix:**
- ✅ Đã fix trong `SecurityConfig.java`
- Xóa `@CrossOrigin` từ controllers
- Chỉ dùng `CorsConfig.java` global configuration

#### 2. **404 Not Found: `/api/api/stations`**

**Nguyên nhân:** Sai mapping trong controller

**Fix:**
```java
// ❌ Wrong
@RequestMapping("/api/stations")

// ✅ Correct (context-path đã có /api)
@RequestMapping("/stations")
```

#### 3. **500 Error khi delete vé khứ hồi**

**Nguyên nhân:** Circular reference với `linked_ticket_id`

**Fix:** ✅ Đã fix trong `TicketService.deleteTicket()`
- Break link trước khi delete
- Delete cả linked ticket

#### 4. **400 Bad Request khi update ticket**

**Nguyên nhân:** `@Valid` annotation yêu cầu all required fields

**Fix:** ✅ Đã xóa `@Valid` từ `@PutMapping`

#### 5. **Backend không start: Port 8080 already in use**

**Solution:**
```bash
# Kill Java process
Get-Process java | Stop-Process -Force

# Hoặc restart backend
RESTART_BACKEND.bat
```

#### 6. **Frontend không connect được backend**

**Check list:**
- ✅ Backend đang chạy? (`http://localhost:8080/api`)
- ✅ `API_BASE_URL` đúng không? (`constants.ts`)
- ✅ CORS config đúng không?

---

## 9. GHI CHÚ QUAN TRỌNG

### ⚠️ Quan trọng khi develop

#### 🔴 **Context Path = `/api`**

**Backend có `server.servlet.context-path=/api`**

Điều này có nghĩa:
- ✅ Controller mapping: `/stations` → Actual endpoint: `/api/stations`
- ✅ Controller mapping: `/routes` → Actual endpoint: `/api/routes`
- ❌ **KHÔNG BAO GIỜ** thêm `/api` vào `@RequestMapping`!

#### 🔴 **CORS Configuration**

**Chỉ dùng 1 nơi để config CORS:**
- ✅ `CorsConfig.java` - Global configuration
- ❌ **KHÔNG dùng** `@CrossOrigin` trên controllers (gây duplicate headers)
- ❌ **KHÔNG thêm** manual CORS headers trong response

#### 🔴 **Round Trip Delete**

Khi xóa vé khứ hồi:
- ✅ Backend tự động xóa cả linked ticket
- ✅ Backend unlink tickets trước khi delete
- ⚠️ **KHÔNG xóa manual** từ database (sẽ gây lỗi foreign key)

#### 🔴 **Database Changes**

Khi thay đổi database:
- ✅ Update file `current_dtb.sql`
- ✅ Test import lại từ SQL file
- ✅ Update INTERNAL_README.md (file này)
- ❌ **KHÔNG commit** database dump cũ

### 📝 Development Workflow

```bash
# 1. Pull latest code
git pull origin main

# 2. Import database nếu có thay đổi
mysql -u root bus_booking < current_dtb.sql

# 3. Start backend
cd backend
mvn spring-boot:run

# 4. Start frontend (terminal khác)
cd frontend-react
pnpm run dev

# 5. Test features
# 6. Commit changes
git add .
git commit -m "feat: implement feature X"
git push origin main
```

### 🔧 Useful Commands

```bash
# Backend
mvn clean compile          # Clean build
mvn spring-boot:run        # Start server
mvn test                   # Run tests

# Frontend
pnpm install              # Install dependencies
pnpm run dev              # Dev mode
pnpm run build            # Production build
pnpm run lint             # Check linting

# Database
mysql -u root -p          # Login to MySQL
SHOW DATABASES;           # List databases
USE bus_booking;          # Switch database
SHOW TABLES;              # List tables
```

---

## 🎯 Checklist trước khi demo/nộp

- [ ] Database import thành công từ `current_dtb.sql`
- [ ] Backend start không lỗi
- [ ] Frontend start không lỗi
- [ ] Login admin thành công
- [ ] Đặt vé 1 chiều thành công
- [ ] Đặt vé khứ hồi thành công
- [ ] In vé thành công
- [ ] Admin CRUD stations hoạt động
- [ ] Admin auto calculate route hoạt động
- [ ] Admin delete vé khứ hồi hoạt động
- [ ] Không có CORS errors trong console
- [ ] Không có 404/500 errors

---

## 📞 Contact Team

**Nếu gặp vấn đề:**
1. Check TROUBLESHOOTING section
2. Check console logs (backend + frontend)
3. Check database (phpMyAdmin)
4. Contact team members

---

**🎉 Good luck với project!**


