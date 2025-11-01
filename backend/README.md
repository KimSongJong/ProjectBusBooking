# Bus Booking System Backend

Backend API cho hệ thống đặt vé xe khách, được xây dựng với Spring Boot và JDK 25.

## Công nghệ sử dụng

- **Java**: JDK 21+ (tương thích JDK 25)
- **Spring Boot**: 3.4.1
- **Spring Data JPA**: Quản lý database
- **Spring Security**: Bảo mật và authentication
- **MySQL**: Database
- **Lombok**: Giảm boilerplate code
- **JWT**: Token authentication

## Cấu trúc dự án (MVC Pattern)

```
backend/
├── src/main/java/com/busbooking/
│   ├── BusBookingApplication.java          # Main application
│   ├── config/                             # Cấu hình
│   │   ├── CorsConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/                         # Controllers (REST API)
│   │   ├── RouteController.java
│   │   ├── TripController.java
│   │   └── TicketController.java
│   ├── model/                              # Entities (Model)
│   │   ├── User.java
│   │   ├── Route.java
│   │   ├── Vehicle.java
│   │   ├── Driver.java
│   │   ├── Trip.java
│   │   ├── Seat.java
│   │   ├── Ticket.java
│   │   └── Promotion.java
│   ├── repository/                         # Data Access Layer
│   │   ├── UserRepository.java
│   │   ├── RouteRepository.java
│   │   ├── TripRepository.java
│   │   └── TicketRepository.java
│   ├── service/                            # Business Logic Layer
│   │   ├── RouteService.java
│   │   ├── TripService.java
│   │   └── TicketService.java
│   ├── dto/                                # Data Transfer Objects
│   └── exception/                          # Exception handling
│       ├── ResourceNotFoundException.java
│       └── GlobalExceptionHandler.java
└── src/main/resources/
    └── application.properties              # Cấu hình ứng dụng
```

## Cài đặt

### Yêu cầu

- JDK 21 trở lên
- Maven 3.6+
- MySQL 8.0+

### Bước 1: Cấu hình Database

1. Tạo database:
```sql
CREATE DATABASE bus_booking;
```

2. Chạy file SQL để tạo bảng và insert dữ liệu mẫu:
```bash
mysql -u root -p bus_booking < bus_booking.sql
```

### Bước 2: Cấu hình application.properties

Chỉnh sửa `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bus_booking
spring.datasource.username=root
spring.datasource.password=your_password
```

### Bước 3: Build và chạy

```bash
# Di chuyển vào thư mục backend
cd backend

# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Hoặc chạy trực tiếp từ IDE (IntelliJ IDEA, Eclipse, VS Code).

## API Endpoints

### Routes (Tuyến đường)

- `GET /api/routes` - Lấy tất cả tuyến đường
- `GET /api/routes/{id}` - Lấy tuyến đường theo ID
- `GET /api/routes/search?from=...&to=...` - Tìm kiếm tuyến
- `POST /api/routes` - Tạo tuyến mới
- `PUT /api/routes/{id}` - Cập nhật tuyến
- `DELETE /api/routes/{id}` - Xóa tuyến

### Trips (Chuyến xe)

- `GET /api/trips` - Lấy tất cả chuyến xe
- `GET /api/trips/{id}` - Lấy chuyến xe theo ID
- `GET /api/trips/route/{routeId}` - Lấy chuyến theo tuyến
- `GET /api/trips/status/{status}` - Lấy chuyến theo trạng thái
- `GET /api/trips/search?start=...&end=...` - Tìm kiếm theo ngày
- `POST /api/trips` - Tạo chuyến mới
- `PUT /api/trips/{id}` - Cập nhật chuyến
- `DELETE /api/trips/{id}` - Xóa chuyến

### Tickets (Vé)

- `GET /api/tickets` - Lấy tất cả vé
- `GET /api/tickets/{id}` - Lấy vé theo ID
- `GET /api/tickets/user/{userId}` - Lấy vé của user
- `GET /api/tickets/trip/{tripId}` - Lấy vé của chuyến
- `POST /api/tickets` - Đặt vé mới
- `PATCH /api/tickets/{id}/status?status=...` - Cập nhật trạng thái vé
- `DELETE /api/tickets/{id}` - Hủy vé

## Testing

Bạn có thể test API bằng:

1. **Postman/Insomnia**: Import collection và test endpoints
2. **cURL**: 
```bash
curl http://localhost:8080/api/routes
```
3. **Browser**: Truy cập trực tiếp cho GET requests

## Các tính năng chính

- ✅ RESTful API
- ✅ JPA/Hibernate ORM
- ✅ Exception handling
- ✅ CORS configuration
- ✅ Spring Security
- ✅ JWT Authentication (đã cấu hình)
- ✅ MySQL Database
- ✅ Mô hình MVC

## Database Schema

Database được thiết kế với các bảng chính:
- `users` - Quản lý người dùng
- `routes` - Tuyến đường
- `vehicles` - Xe khách
- `drivers` - Tài xế
- `trips` - Chuyến xe
- `seats` - Ghế ngồi
- `tickets` - Vé đặt
- `promotions` - Khuyến mãi
- `payments` - Thanh toán
- `invoices` - Hóa đơn

## Troubleshooting

### Lỗi kết nối MySQL
```
Kiểm tra MySQL đang chạy
Kiểm tra username/password trong application.properties
Kiểm tra database đã tạo chưa
```

### Port 8080 đã được sử dụng
Đổi port trong `application.properties`:
```properties
server.port=8081
```

## Phát triển tiếp

Để thêm chức năng mới, tạo theo thứ tự:
1. **Model** (Entity) - Define database table
2. **Repository** - Data access methods
3. **Service** - Business logic
4. **Controller** - REST endpoints

## License

MIT License
