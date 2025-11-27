# 🚌 TPT Bus Booking System

> **Clone của FUTA Phương Trang Bus** - Hệ thống đặt vé xe khách trực tuyến  
> **Tech Stack:** Spring Boot 3.4.1 + React 19 + MySQL 8.0 + VNPay/MoMo  
> **Last Updated:** 26/11/2025

---

## 🚀 QUICK START

### Khởi động nhanh (3 bước)

```bash
# Bước 1: Mở XAMPP, start MySQL
# Bước 2: Import database current_dtb.sql vào database "bus_booking"
# Bước 3: Chạy batch file
START_FRONTEND.bat
```

**Lưu ý:** Backend phải start thủ công bằng IDE (IntelliJ IDEA hoặc Eclipse)

### 📍 Truy cập sau khi start

| Service | URL | Tài khoản |
|---------|-----|-----------|
| **Customer** | http://localhost:5173 | **user1** / **123456** |
| **Admin Dashboard** | http://localhost:5173/admin/login | **admin** / **123456** |
| **Backend API** | http://localhost:8080/api | - |
| **Database** | localhost:3306/bus_booking | root / (no password) |

> **🔐 Lưu ý:** Admin và Customer có auth riêng biệt - có thể login đồng thời trên cùng browser!

---

## 📚 DOCUMENTATION

### 📖 Đọc tài liệu chi tiết

- **[INTERNAL_README.md](./INTERNAL_README.md)** ← 📌 **ĐỌC FILE NÀY** cho tài liệu đầy đủ
  - Kiến trúc hệ thống
  - API Endpoints
  - Database Schema
  - Troubleshooting
  - Development workflow

### 📂 Các file quan trọng

```
ProjectBusBooking/
├── README.md                  # File này - Quick start
├── INTERNAL_README.md         # 📌 Tài liệu đầy đủ cho team
├── current_dtb.sql           # Database chính
├── bus_booking.sql           # Backup database
├── START_ALL.bat             # Start backend + frontend
├── backend/                  # Spring Boot API
└── frontend-react/           # React + Vite
```

---

## 🛠️ TECH STACK

**Backend:**
- ☕ Java 25.0.1
- 🍃 Spring Boot 3.4.1
- 🔐 Spring Security + JWT
- 🗄️ MySQL 8.0
- 📦 Maven 3.9.11

**Frontend:**
- ⚛️ React 19.2.0
- ⚡ Vite 7.1.9
- 🎨 TypeScript 5.7.3
- 💅 Tailwind CSS + Shadcn/ui
- 📦 pnpm 10.19.0

---

## ✨ TÍNH NĂNG CHÍNH

### ✅ Đã hoàn thành

#### Customer Features
- ✅ Tìm kiếm chuyến xe theo tuyến đường và ngày
- ✅ **Đặt vé 1 chiều**
- ✅ **Đặt vé khứ hồi** (giảm 10%)
- ✅ Chọn ghế ngồi interactive
- ✅ Chọn điểm đón/trả khách
- ✅ In vé PDF
- ✅ Xem lịch sử đặt vé
- ✅ Thanh toán online (VNPay - đã có code)

#### Admin Features
- ✅ **Dashboard** - Tổng quan hệ thống
- ✅ **Quản lý Trạm xe** - CRUD với OpenStreetMap
- ✅ **Quản lý Tuyến đường** - Auto calculate khoảng cách, giá vé
- ✅ **Quản lý Vé** - CRUD, delete vé khứ hồi
- ✅ **Quản lý Chuyến xe** - Thêm/sửa/xóa chuyến
- ✅ **Quản lý Ghế** - Bộ lọc, tìm kiếm
- ✅ **Quản lý Xe** - CRUD vehicles
- ✅ **Quản lý Tài xế** - CRUD drivers
- ✅ **Quản lý Khuyến mãi** - CRUD promotions

### 🎯 Điểm nổi bật

#### 🎫 Round Trip Booking System
- Chọn 2 chuyến (đi + về) cùng lúc
- Tự động link vé đi ↔ vé về
- Auto apply 10% discount
- Delete smart: xóa 1 vé → auto xóa vé liên quan

#### 🗺️ Smart Route Calculation
- Tích hợp **OpenStreetMap API**
- Auto calculate:
  - Khoảng cách thực tế (km)
  - Thời gian di chuyển (giờ, phút)
  - Giá vé dựa trên khoảng cách
- Example: HCM → Nha Trang = 414km, 4h53m, 437,000đ

#### 🏢 Station Management
- Lưu tọa độ GPS chính xác
- Autocomplete địa chỉ với OpenStreetMap
- Hỗ trợ 3 loại trạm: Đi / Đến / Cả 2
- Filter theo thành phố, trạng thái

---

## 🔧 DEVELOPMENT

### Start riêng lẻ

```bash
# Backend only
START_BACKEND.bat

# Frontend only
START_FRONTEND.bat

# Restart backend (nếu crash)
RESTART_BACKEND.bat
```

### Cấu trúc Project

```
backend/
├── controller/          # REST API endpoints
├── service/            # Business logic
├── repository/         # JPA repositories
├── model/             # Entity classes
├── dto/               # Request/Response DTOs
└── config/            # Security, CORS config

frontend-react/
├── src/
│   ├── pages/              # Page components
│   │   ├── BookingSeat.tsx    # ✅ Round trip booking
│   │   ├── Invoice.tsx        # ✅ Print tickets
│   │   └── Adminpage/         # ✅ Admin dashboard
│   ├── services/           # API clients
│   ├── components/         # Reusable components
│   └── config/            # API base URL
```

---

## ⚠️ QUAN TRỌNG

### 🔴 Backend Context Path = `/api`

**Tất cả API endpoints đều có prefix `/api`**

```
Controller mapping: /stations   →  Actual endpoint: /api/stations ✅
Controller mapping: /routes     →  Actual endpoint: /api/routes ✅
Controller mapping: /tickets    →  Actual endpoint: /api/tickets ✅
```

**❌ KHÔNG THÊM `/api` vào `@RequestMapping`!**

### 🔴 CORS Configuration

- ✅ Chỉ config CORS ở `CorsConfig.java`
- ❌ **KHÔNG dùng** `@CrossOrigin` trên controllers
- ❌ **KHÔNG thêm** manual CORS headers

### 🔴 Database

- **File chính:** `current_dtb.sql` (luôn update file này)
- **Backup:** `bus_booking.sql`
- Import vào database: `bus_booking`

---

## 🐛 TROUBLESHOOTING

### Backend không start

```bash
# Kill Java process và restart
RESTART_BACKEND.bat
```

### Frontend lỗi CORS

- Check `API_BASE_URL` trong `frontend-react/src/config/constants.ts`
- Phải là: `http://localhost:8080/api`

### Database lỗi

```bash
# Re-import database
mysql -u root bus_booking < current_dtb.sql
```

### Xem logs chi tiết

- **Backend logs:** Terminal chạy backend
- **Frontend logs:** Browser DevTools Console
- **Database:** phpMyAdmin (http://localhost/phpmyadmin)

---

## 📞 TEAM & SUPPORT

**Nếu gặp vấn đề:**
1. ✅ Đọc [INTERNAL_README.md](./INTERNAL_README.md) section TROUBLESHOOTING
2. ✅ Check console logs (backend + frontend)
3. ✅ Check database qua phpMyAdmin
4. ✅ Hỏi team members

---

## 📝 CHECKLIST TRƯỚC KHI DEMO

- [ ] Import `current_dtb.sql` thành công
- [ ] Backend start không lỗi (`http://localhost:8080/api`)
- [ ] Frontend start không lỗi (`http://localhost:5173`)
- [ ] Login admin thành công
- [ ] Đặt vé 1 chiều OK
- [ ] Đặt vé khứ hồi OK (discount 10%)
- [ ] In vé OK
- [ ] Admin CRUD stations OK
- [ ] Admin auto calculate route OK
- [ ] Admin delete round trip ticket OK
- [ ] Không có CORS errors
- [ ] Không có 404/500 errors

---

**📚 Xem thêm:** [INTERNAL_README.md](./INTERNAL_README.md) - Tài liệu đầy đủ

**🎉 Chúc các bạn thành công với project!**
- **Repository Pattern** - Data access abstraction
- **DTO Pattern** - Request/Response separation
- **Mapper Pattern** - Entity-DTO conversion
- **Component-based Architecture** - Frontend structure

---

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- **Java JDK** 25.0.1 hoặc cao hơn
- **Maven** 3.9.11 hoặc cao hơn
- **Node.js** 18+ và **pnpm** 10.19.0
- **MySQL** 8.0
- **Git**

### 1. Clone repository

```bash
git clone https://github.com/KimSongJong/ProjectBusBooking.git
cd ProjectBusBooking
```

### 2. Cài đặt Database

#### 2.1. Khởi động MySQL (XAMPP hoặc standalone)

```bash
# Đảm bảo MySQL đang chạy trên port 3307
```

#### 2.2. Tạo database

```bash
mysql -u root -P 3307 -p
```

```sql
CREATE DATABASE bus_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bus_booking;
```

#### 2.3. Import schema

```bash
mysql -u root -P 3307 -p bus_booking < bus_booking.sql
```

### 3. Cách nhanh nhất - Chạy tất cả

**🚀 Chạy 1 lệnh duy nhất:**

```bash
# Windows
START_ALL.bat
```

Script này sẽ:
1. ✅ Kiểm tra MySQL đã chạy chưa
2. ✅ Khởi động Backend (Spring Boot) - port 8080
3. ✅ Khởi động Frontend (React + Vite) - port 5173

---

### 4. Cấu hình Backend (nếu chạy riêng lẻ)

#### 4.1. Cập nhật `backend/src/main/resources/application.properties`

```properties
spring.application.name=BusBooking

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3307/bus_booking
spring.datasource.username=root
spring.datasource.password=

# JPA Configuration
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
server.servlet.context-path=/api
```

#### 3.2. Build và chạy Backend

```bash
cd backend

# Build project
mvn clean install

# Hoặc chỉ compile
mvn compile

# Chạy application
mvn spring-boot:run
```

**Backend sẽ chạy tại:** `http://localhost:8080/api`

### 5. Cấu hình Frontend (nếu chạy riêng lẻ)

#### 5.1. Cài đặt dependencies

```bash
cd frontend-react
pnpm install
```

#### 4.2. Chạy development server

```bash
pnpm run dev
```

**Frontend sẽ chạy tại:** `http://localhost:5173`

---

## 📁 Cấu trúc thư mục

```
ProjectBusBooking/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/busbooking/
│   │   │   │   ├── BusBookingApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   └── CorsConfig.java
│   │   │   │   ├── controller/       # 8 REST Controllers
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   ├── VehicleController.java
│   │   │   │   │   ├── DriverController.java
│   │   │   │   │   ├── SeatController.java
│   │   │   │   │   ├── RouteController.java
│   │   │   │   │   ├── TripController.java
│   │   │   │   │   ├── TicketController.java
│   │   │   │   │   └── PromotionController.java
│   │   │   │   ├── service/          # 8 Service classes
│   │   │   │   ├── repository/       # 8 JPA Repositories
│   │   │   │   ├── model/            # 8 Entity models
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Vehicle.java
│   │   │   │   │   ├── Driver.java
│   │   │   │   │   ├── Seat.java
│   │   │   │   │   ├── Route.java
│   │   │   │   │   ├── Trip.java
│   │   │   │   │   ├── Ticket.java
│   │   │   │   │   └── Promotion.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── request/      # 8 Request DTOs
│   │   │   │   │   └── response/     # 9 Response DTOs
│   │   │   │   ├── mapper/           # 8 Mapper classes
│   │   │   │   └── exception/
│   │   │   │       └── ResourceNotFoundException.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── API_ENDPOINTS.md              # API Documentation
│   └── Bus_Booking_Complete_API.postman_collection.json
│
├── frontend-react/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── layout/
│   │   │   └── ui/                   # Shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Mainpage.tsx
│   │   │   ├── SearchTicket.tsx
│   │   │   ├── Schedule.tsx
│   │   │   ├── Product.tsx
│   │   │   ├── News.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── Invoice.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── bus_booking.sql                   # Database schema
└── README.md                         # Tài liệu này
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### API Resources (41 Endpoints)

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| **Users** | 5 endpoints | Quản lý người dùng (CRUD) |
| **Vehicles** | 5 endpoints | Quản lý xe khách (CRUD) |
| **Drivers** | 5 endpoints | Quản lý tài xế (CRUD) |
| **Seats** | 5 endpoints | Quản lý ghế ngồi (CRUD) |
| **Promotions** | 5 endpoints | Quản lý khuyến mãi (CRUD) |
| **Routes** | 6 endpoints | Quản lý tuyến đường + tìm kiếm |
| **Trips** | 8 endpoints | Quản lý chuyến đi + filter |
| **Tickets** | 7 endpoints | Quản lý vé + cập nhật trạng thái |

### Chi tiết API Endpoints

Xem file **[API_ENDPOINTS.md](backend/API_ENDPOINTS.md)** để biết đầy đủ thông tin về:
- Request/Response format
- URL parameters
- Query parameters
- Request body examples
- Enum values
- Testing order

### Postman Collection

Import file `backend/Bus_Booking_Complete_API.postman_collection.json` vào Postman để test API.

**Bao gồm:**
- 8 folders theo resource
- 41 pre-configured requests
- Sample request bodies
- Proper headers

---

## 🗄️ Database Schema

### Entities (8 tables)

#### 1. **users** - Thông tin người dùng
```sql
- id (PK)
- username
- password
- email
- role (enum: customer, admin, driver)
- full_name
- phone
- created_at
- updated_at
```

#### 2. **vehicles** - Thông tin xe khách
```sql
- id (PK)
- license_plate
- model
- total_seats
- seats_layout
- vehicle_type (enum: standard, vip, sleeper)
- created_at
```

#### 3. **drivers** - Thông tin tài xế
```sql
- id (PK)
- full_name
- license_number
- phone
- experience_years
- created_at
```

#### 4. **routes** - Tuyến đường
```sql
- id (PK)
- from_location
- to_location
- distance_km
- base_price
- estimated_duration
- created_at
```

#### 5. **trips** - Chuyến đi
```sql
- id (PK)
- route_id (FK)
- vehicle_id (FK)
- driver_id (FK)
- departure_time
- arrival_time
- status (enum: scheduled, ongoing, completed, cancelled)
- created_at
```

#### 6. **seats** - Ghế ngồi
```sql
- id (PK)
- vehicle_id (FK)
- seat_number
- seat_type (enum: standard, vip, sleeper)
- status (enum: available, booked, unavailable)
```

#### 7. **promotions** - Khuyến mãi
```sql
- id (PK)
- code
- discount_percentage
- discount_amount
- start_date
- end_date
- max_uses
- current_uses
- created_at
```

#### 8. **tickets** - Vé đặt chỗ
```sql
- id (PK)
- user_id (FK)
- trip_id (FK)
- seat_id (FK)
- promotion_id (FK, nullable)
- price
- booking_method (enum: online, counter)
- status (enum: booked, confirmed, cancelled, completed)
- booking_time
```

### Entity Relationships

```
users (1) -----> (N) tickets
vehicles (1) --> (N) trips
vehicles (1) --> (N) seats
drivers (1) ---> (N) trips
routes (1) ----> (N) trips
trips (1) -----> (N) tickets
seats (1) -----> (N) tickets
promotions (1) -> (N) tickets
```

---

## ✨ Tính năng

### Cho khách hàng (Customer)
- ✅ Tìm kiếm chuyến xe theo tuyến đường
- ✅ Xem lịch trình và giá vé
- ✅ Chọn ghế ngồi
- ✅ Đặt vé trực tuyến
- ✅ Áp dụng mã khuyến mãi
- ✅ Xem lịch sử đặt vé
- ✅ Hủy vé (nếu cho phép)

### Cho quản trị viên (Admin)
- ✅ Quản lý người dùng
- ✅ Quản lý xe khách (thêm, sửa, xóa)
- ✅ Quản lý tài xế
- ✅ Quản lý tuyến đường
- ✅ Quản lý chuyến đi
- ✅ Quản lý ghế ngồi
- ✅ Tạo và quản lý mã khuyến mãi
- ✅ Xem thống kê đặt vé

### Tính năng kỹ thuật
- ✅ RESTful API design
- ✅ Request validation với Jakarta Bean Validation
- ✅ Exception handling tập trung
- ✅ CORS configuration cho frontend
- ✅ JPA/Hibernate ORM
- ✅ DTO pattern cho separation of concerns
- ✅ Mapper pattern cho entity-dto conversion
- ✅ Responsive UI với Tailwind CSS
- ✅ Component-based architecture (React)
- ✅ Type-safe với TypeScript

---

## 🔐 Security Configuration

**Lưu ý:** Hiện tại security được cấu hình `permitAll()` cho development.

```java
// SecurityConfig.java
http.authorizeHttpRequests(auth -> auth
    .anyRequest().permitAll()
);
```

**Trong production cần:**
- Implement JWT authentication
- Role-based authorization (CUSTOMER, ADMIN, DRIVER)
- Password encryption (BCrypt)
- HTTPS
- Rate limiting
- Input sanitization

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
mvn test
```

### Frontend Testing

```bash
cd frontend-react
pnpm test
```

### API Testing với Postman

1. Import collection: `backend/Bus_Booking_Complete_API.postman_collection.json`
2. Đảm bảo backend đang chạy
3. Test theo thứ tự trong [API_ENDPOINTS.md](backend/API_ENDPOINTS.md)

---

## 🐛 Troubleshooting

### Backend không khởi động được

**Problem:** Lỗi Lombok với Java 25
```
Solution: Đảm bảo sử dụng Lombok edge-SNAPSHOT version trong pom.xml
```

**Problem:** Không kết nối được MySQL
```
Solution: Kiểm tra MySQL đang chạy trên port 3307
        Kiểm tra username/password trong application.properties
```

### Frontend không chạy được

**Problem:** Module not found
```
Solution: Chạy pnpm install lại
        Xóa node_modules và pnpm-lock.yaml, sau đó pnpm install
```

**Problem:** CORS error khi gọi API
```
Solution: Đảm bảo CorsConfig cho phép localhost:5173
        Kiểm tra backend đang chạy
```

### Database issues

**Problem:** Foreign key constraint errors
```
Solution: Tạo dữ liệu theo đúng thứ tự (xem Testing Order trong API_ENDPOINTS.md)
        Xóa dữ liệu phụ thuộc trước khi xóa parent records
```

---

## 📝 Development Guidelines

### Code Style

**Backend (Java):**
- Follow Java naming conventions
- Use Lombok annotations (@Data, @Builder, etc.)
- Add Jakarta validation annotations on DTOs
- Document complex business logic

**Frontend (TypeScript/React):**
- Use TypeScript strict mode
- Follow React hooks best practices
- Use functional components
- Implement proper error handling

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 🚀 Deployment

### Backend Deployment

**Tạo JAR file:**
```bash
cd backend
mvn clean package
```

**Chạy JAR file:**
```bash
java -jar target/bus-booking-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment

**Build production:**
```bash
cd frontend-react
pnpm run build
```

**Deploy folder `dist/` lên:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

---

## 📄 License

This project is developed for educational purposes.

---

## 👥 Contributors

- **KimSongJong** - Full Stack Developer
- GitHub: [@KimSongJong](https://github.com/KimSongJong)

---

## 📧 Contact

Nếu có câu hỏi hoặc đề xuất, vui lòng tạo issue trên GitHub repository.

---

## 🙏 Acknowledgments

- Spring Boot Documentation
- React Documentation
- Tailwind CSS
- Shadcn/ui
- Hibernate Documentation

---

**Enjoy coding! 🚌💨**
