# 🚌 Bus Booking System

Hệ thống đặt vé xe khách trực tuyến được xây dựng với Spring Boot (Backend) và React + Vite (Frontend).

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Tính năng](#tính-năng)

---

## 🎯 Tổng quan

Bus Booking System là một ứng dụng web full-stack cho phép người dùng:
- Tìm kiếm và đặt vé xe khách trực tuyến
- Quản lý thông tin người dùng, xe, tài xế, tuyến đường
- Quản lý chuyến đi và ghế ngồi
- Áp dụng mã khuyến mãi khi đặt vé
- Theo dõi lịch sử đặt vé

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Java** 25.0.1
- **Spring Boot** 3.4.1
- **Spring Data JPA** - ORM và database operations
- **Hibernate** 6.6.4 - JPA implementation
- **MySQL** 8.0 - Database
- **Lombok** (edge-SNAPSHOT) - Reduce boilerplate code
- **Maven** 3.9.11 - Build tool
- **Jakarta Bean Validation** - Request validation

### Frontend
- **React** 19.2.0
- **Vite** 7.1.9 - Build tool và dev server
- **TypeScript** 5.7.3
- **Tailwind CSS** 3.4.17 - Styling
- **Shadcn/ui** - UI component library
- **React Router DOM** - Routing
- **pnpm** 10.19.0 - Package manager

### Database
- **MySQL** 8.0 (XAMPP)
- **Port:** 3307
- **Database:** bus_booking

---

## 🏗️ Kiến trúc hệ thống

### Backend Architecture (MVC Pattern)

```
backend/
├── controller/     # REST API endpoints (@RestController)
├── service/        # Business logic (@Service)
├── repository/     # Data access layer (JPA Repository)
├── model/          # Entity classes (JPA @Entity)
├── dto/           
│   ├── request/    # Request DTOs với validation
│   └── response/   # Response DTOs
├── mapper/         # Entity ↔ DTO converters (@Component)
├── exception/      # Custom exceptions
└── config/         # Spring configuration (Security, CORS)
```

### Frontend Architecture

```
frontend-react/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components (routes)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities
│   └── assets/       # Static assets
```

### Design Patterns
- **MVC (Model-View-Controller)** - Backend structure
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

### 3. Cấu hình Backend

#### 3.1. Cập nhật `backend/src/main/resources/application.properties`

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

### 4. Cấu hình Frontend

#### 4.1. Cài đặt dependencies

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
