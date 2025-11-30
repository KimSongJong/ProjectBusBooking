# 🚌 TPT Bus Booking System

Hệ thống đặt vé xe khách trực tuyến với giao diện hiện đại, hỗ trợ thanh toán online (VNPay, MoMo) và quản trị viên.

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt & Chạy](#-cài-đặt--chạy-project)
- [Cấu Hình](#-cấu-hình)
- [API Documentation](#-api-documentation)
- [Đóng Góp](#-đóng-góp)

## ✨ Tính Năng

### Khách Hàng
- 🔍 Tìm kiếm và đặt vé xe khách
- 🪑 Chọn ghế ngồi trực quan
- 💳 Thanh toán online (VNPay, MoMo)
- 📧 Nhận email xác nhận và hóa đơn
- 👤 Quản lý tài khoản và lịch sử đặt vé
- 🔐 Quên mật khẩu và đổi mật khẩu
- 📱 Giao diện responsive (mobile-friendly)

### Quản Trị Viên
- 📊 Dashboard thống kê
- 🚍 Quản lý xe, tài xế, tuyến đường
- 🗓️ Quản lý chuyến xe và lịch trình
- 🎫 Quản lý vé và đặt chỗ
- 💰 Quản lý thanh toán và báo cáo
- 👥 Quản lý tài khoản người dùng
- 📨 Quản lý phản hồi khách hàng

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Java 21** - Programming language
- **Spring Boot 3.4.1** - Application framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database ORM
- **MySQL 8.0** - Relational database
- **JWT** - Token-based authentication
- **JavaMail** - Email service
- **JasperReports** - PDF & Excel reports

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)
- **Maven** - Backend build tool
- **PNPM** - Frontend package manager

## 📦 Yêu Cầu Hệ Thống

### Development
- **Docker Desktop** (Windows/Mac) hoặc **Docker Engine** (Linux)
- **Git**
- **8GB RAM minimum** (16GB recommended)

### Production (Optional - không dùng Docker)
- **Java 21 JDK**
- **Node.js 18+** và **PNPM**
- **MySQL 8.0**
- **Maven 3.8+**

## 🚀 Cài Đặt & Chạy Project

### Option 1: Docker (Recommended) ⭐

#### 1. Clone Repository

```bash
git clone <repository-url>
cd ProjectBusBooking
```

#### 2. Tạo File Environment

Tạo file `.env` trong thư mục root:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=root123456
MYSQL_DATABASE=bus_booking
MYSQL_USER=busbooking_user
MYSQL_PASSWORD=busbooking_pass

# Backend Configuration
SPRING_PROFILES_ACTIVE=docker
JWT_SECRET=your-secret-key-here-minimum-256-bits

# Email Configuration (Gmail)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# VNPay Configuration
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret

# MoMo Configuration
MOMO_PARTNER_CODE=your-momo-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
```

#### 3. Build và Khởi Động

```bash
# Build images và start containers
docker-compose up --build -d

# Xem logs
docker-compose logs -f

# Dừng containers
docker-compose down

# Xóa volumes (reset database)
docker-compose down -v
```

#### 4. Import Database

```bash
# Import initial data
docker exec -i bus-booking-mysql mysql -uroot -proot123456 bus_booking < bus_booking.sql
```

#### 5. Truy Cập Ứng Dụng

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **MySQL:** localhost:3307 (user: `busbooking_user`, pass: `busbooking_pass`)

#### 6. Tài Khoản Mặc Định

**Admin:**
- Username: `admin`
- Password: `admin123`
- URL: http://localhost:3000/admin/login

**Customer (test):**
- Username: `LNNT`
- Password: `password123`
- URL: http://localhost:3000/login

---

### Option 2: Local Development (Không Docker)

#### Backend

```bash
cd backend

# Cấu hình database trong application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/bus_booking

# Build và chạy
mvn clean install
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend-react

# Install dependencies
pnpm install

# Chạy development server
pnpm dev
```

## ⚙️ Cấu Hình

### Email Service (Gmail)

1. Bật **2-Factor Authentication** trong tài khoản Gmail
2. Tạo **App Password**: https://myaccount.google.com/apppasswords
3. Cập nhật vào `.env`:
   ```env
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-16-character-app-password
   ```

### Payment Gateways

#### VNPay
1. Đăng ký tài khoản VNPay Sandbox: https://sandbox.vnpayment.vn/
2. Lấy **TMN Code** và **Hash Secret**
3. Cập nhật vào `.env`

#### MoMo
1. Đăng ký MoMo Test: https://developers.momo.vn/
2. Lấy credentials
3. Cập nhật vào `.env`

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

```http
POST /auth/login
POST /auth/register
POST /auth/forgot-password
PUT  /auth/change-password
POST /auth/logout
GET  /auth/me
```

### Customer Endpoints

```http
GET  /routes              # Browse routes
GET  /trips               # Browse trips
POST /bookings            # Create booking
GET  /bookings/{id}       # Get booking details
POST /payments            # Process payment
```

### Admin Endpoints (Requires ADMIN role)

```http
GET  /admin/dashboard     # Statistics
GET  /admin/users         # User management
GET  /admin/vehicles      # Vehicle management
GET  /admin/drivers       # Driver management
GET  /admin/routes        # Route management
GET  /admin/trips         # Trip management
GET  /admin/bookings      # Booking management
GET  /admin/payments      # Payment management
GET  /admin/feedback      # Customer feedback
```

**Full API documentation:** http://localhost:8080/api/swagger-ui.html *(if Swagger is enabled)*

## 📁 Cấu Trúc Project

```
ProjectBusBooking/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/busbooking/
│   │   │   │       ├── controller/   # REST Controllers
│   │   │   │       ├── service/      # Business Logic
│   │   │   │       ├── repository/   # Data Access
│   │   │   │       ├── model/        # Entities
│   │   │   │       ├── dto/          # Data Transfer Objects
│   │   │   │       ├── security/     # JWT & Security
│   │   │   │       └── config/       # Configuration
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-docker.properties
│   │   │       └── reports/          # JasperReports templates
│   │   └── test/                     # Unit tests
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend-react/             # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── contexts/           # React contexts
│   │   ├── config/             # Configuration
│   │   └── types/              # TypeScript types
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Docker orchestration
├── bus_booking.sql             # Database schema
├── .env.example                # Environment template
└── README.md                   # This file
```

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check if MySQL container is running
docker ps

# Restart MySQL
docker-compose restart mysql

# Check logs
docker-compose logs mysql
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml
# Frontend: 3000 -> 3001
# Backend: 8080 -> 8081
# MySQL: 3307 -> 3308
```

### Build Failed

```bash
# Clean build
docker-compose down
docker system prune -a
docker-compose up --build
```

## 🔄 Git Workflow

```bash
# Clone và setup
git clone <repository-url>
cd ProjectBusBooking
cp .env.example .env  # Sửa .env với config của bạn
docker-compose up --build -d

# Development
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature

# Pull latest changes
git pull origin main
docker-compose down
docker-compose up --build -d
```

## 📝 Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Developer:** [Your Name]
- **Frontend Developer:** [Your Name]
- **DevOps:** [Your Name]

## 📞 Contact

- **Email:** your-email@example.com
- **GitHub:** [Your GitHub Profile]

---

**Made with ❤️ by TPT Bus Team**

