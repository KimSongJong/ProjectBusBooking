# Bus Booking API Endpoints

## Base URL
```
http://localhost:8080/api
```

---

## 1. Users API (`/users`)

### 1.1 Get All Users
```
GET /users
```

### 1.2 Get User By ID
```
GET /users/{id}
```
**Example:** `GET /users/1`

### 1.3 Create User
```
POST /users
Content-Type: application/json
```
**Request Body:**
```json
{
  "username": "customer1",
  "password": "password123",
  "email": "customer1@example.com",
  "role": "customer",
  "fullName": "Nguyen Van A",
  "phone": "0901234567" 
}
```

**Role values:** `customer`, `admin`, `driver`

### 1.4 Update User
```
PUT /users/{id}
Content-Type: application/json
```
**Request Body:**
```json
{
  "username": "customer1",
  "password": "newpass123",
  "email": "customer1@example.com",
  "role": "customer",
  "fullName": "Nguyen Van A Updated",
  "phone": "0907654321"
}
```

### 1.5 Delete User
```
DELETE /users/{id}
```

---

## 2. Vehicles API (`/vehicles`)

### 2.1 Get All Vehicles
```
GET /vehicles
```

### 2.2 Get Vehicle By ID
```
GET /vehicles/{id}
```

### 2.3 Create Vehicle
```
POST /vehicles
Content-Type: application/json
```
**Request Body:**
```json
{
  "licensePlate": "29A-12345",
  "model": "Hyundai Universe",
  "totalSeats": 45,
  "seatsLayout": "2-2",
  "vehicleType": "standard"
}
```

**Vehicle Type values:** `standard`, `vip`, `sleeper`

### 2.4 Update Vehicle
```
PUT /vehicles/{id}
Content-Type: application/json
```
**Request Body:**
```json
{
  "licensePlate": "29A-12345",
  "model": "Hyundai Universe Luxury",
  "totalSeats": 40,
  "seatsLayout": "2-1",
  "vehicleType": "vip"
}
```

### 2.5 Delete Vehicle
```
DELETE /vehicles/{id}
```

---

## 3. Drivers API (`/drivers`)

### 3.1 Get All Drivers
```
GET /drivers
```

### 3.2 Get Driver By ID
```
GET /drivers/{id}
```

### 3.3 Create Driver
```
POST /drivers
Content-Type: application/json
```
**Request Body:**
```json
{
  "fullName": "Tran Van B",
  "licenseNumber": "B123456789",
  "phone": "0912345678",
  "experienceYears": 10
}
```

### 3.4 Update Driver
```
PUT /drivers/{id}
Content-Type: application/json
```
**Request Body:**
```json
{
  "fullName": "Tran Van B",
  "licenseNumber": "B123456789",
  "phone": "0912345678",
  "experienceYears": 12
}
```

### 3.5 Delete Driver
```
DELETE /drivers/{id}
```

---

## 4. Seats API (`/seats`)

### 4.1 Get All Seats
```
GET /seats
```

### 4.2 Get Seat By ID
```
GET /seats/{id}
```

### 4.3 Create Seat
```
POST /seats
Content-Type: application/json
```
**Request Body:**
```json
{
  "vehicleId": 1,
  "seatNumber": "A1",
  "seatType": "standard",
  "status": "available"
}
```

**Seat Type values:** `standard`, `vip`, `sleeper`
**Status values:** `available`, `booked`, `unavailable`

⚠️ **Note:** Requires existing Vehicle ID

### 4.4 Update Seat
```
PUT /seats/{id}
Content-Type: application/json
```
**Request Body:**
```json
{
  "vehicleId": 1,
  "seatNumber": "A1",
  "seatType": "vip",
  "status": "available"
}
```

### 4.5 Delete Seat
```
DELETE /seats/{id}
```

---

## 5. Promotions API (`/promotions`)

### 5.1 Get All Promotions
```
GET /promotions
```

### 5.2 Get Promotion By ID
```
GET /promotions/{id}
```

### 5.3 Create Promotion
```
POST /promotions
Content-Type: application/json
```
**Request Body (Percentage Discount):**
```json
{
  "code": "SUMMER2025",
  "discountPercentage": 15,
  "discountAmount": null,
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "maxUses": 1000
}
```

**Request Body (Fixed Amount Discount):**
```json
{
  "code": "FIXED100K",
  "discountPercentage": null,
  "discountAmount": 100000,
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "maxUses": 500
}
```

### 5.4 Update Promotion
```
PUT /promotions/{id}
Content-Type: application/json
```
**Request Body:**
```json
{
  "code": "SUMMER2025",
  "discountPercentage": 20,
  "discountAmount": null,
  "startDate": "2025-06-01",
  "endDate": "2025-09-30",
  "maxUses": 1500
}
```

### 5.5 Delete Promotion
```
DELETE /promotions/{id}
```

---

## 6. Routes API (`/routes`)

### 6.1 Get All Routes
```
GET /routes
```

### 6.2 Get Route By ID
```
GET /routes/{id}
```

### 6.3 Search Routes
```
GET /routes/search?from={fromLocation}&to={toLocation}
```
**Example:** `GET /routes/search?from=Hà Nội&to=Đà Nẵng`

### 6.4 Create Route
```
POST /routes
Content-Type: application/json
```
**Request Body:**
```json
{
  "fromLocation": "Hà Nội",
  "toLocation": "Đà Nẵng",
  "distanceKm": 770,
  "basePrice": 500000,
  "estimatedDuration": 960
}
```

**Note:** 
- `distanceKm`: Distance in kilometers
- `basePrice`: Price in VND
- `estimatedDuration`: Duration in minutes

### 6.5 Update Route
```
PUT /routes/{id}
Content-Type: application/json
```
**Request Body:**
```json
{
  "fromLocation": "Hà Nội",
  "toLocation": "Đà Nẵng",
  "distanceKm": 770,
  "basePrice": 550000,
  "estimatedDuration": 960
}
```

### 6.6 Delete Route
```
DELETE /routes/{id}
```

---

## 7. Trips API (`/trips`)

### 7.1 Get All Trips
```
GET /trips
```

### 7.2 Get Trip By ID
```
GET /trips/{id}
```

### 7.3 Get Trips By Route
```
GET /trips/route/{routeId}
```
**Example:** `GET /trips/route/1`

### 7.4 Get Trips By Status
```
GET /trips/status/{status}
```
**Example:** `GET /trips/status/scheduled`

**Status values:** `scheduled`, `ongoing`, `completed`, `cancelled`

### 7.5 Search Trips By Date Range
```
GET /trips/search?start={startDateTime}&end={endDateTime}
```
**Example:** `GET /trips/search?start=2025-11-01T00:00:00&end=2025-11-30T23:59:59`

**Date Format:** ISO 8601 (`YYYY-MM-DDTHH:mm:ss`)

### 7.6 Create Trip
```
POST /trips
Content-Type: application/json
```
**Request Body:**
```json
{
  "routeId": 1,
  "vehicleId": 1,
  "driverId": 1,
  "departureTime": "2025-11-01T08:00:00",
  "arrivalTime": "2025-11-01T20:00:00",
  "status": "scheduled"
}
```

⚠️ **Note:** Requires existing Route, Vehicle, and Driver IDs

### 7.7 Update Trip
```
PUT /trips/{id}
Content-Type: application/json
```
**Request Body:**
```json
{
  "routeId": 1,
  "vehicleId": 1,
  "driverId": 1,
  "departureTime": "2025-11-01T08:00:00",
  "arrivalTime": "2025-11-01T20:00:00",
  "status": "ongoing"
}
```

### 7.8 Delete Trip
```
DELETE /trips/{id}
```

---

## 8. Tickets API (`/tickets`)

### 8.1 Get All Tickets
```
GET /tickets
```

### 8.2 Get Ticket By ID
```
GET /tickets/{id}
```

### 8.3 Get Tickets By User
```
GET /tickets/user/{userId}
```
**Example:** `GET /tickets/user/1`

### 8.4 Get Tickets By Trip
```
GET /tickets/trip/{tripId}
```
**Example:** `GET /tickets/trip/1`

### 8.5 Create Ticket
```
POST /tickets
Content-Type: application/json
```
**Request Body (Without Promotion):**
```json
{
  "userId": 1,
  "tripId": 1,
  "seatId": 1,
  "promotionId": null,
  "price": 500000,
  "bookingMethod": "online",
  "status": "booked"
}
```

**Request Body (With Promotion):**
```json
{
  "userId": 1,
  "tripId": 1,
  "seatId": 1,
  "promotionId": 1,
  "price": 425000,
  "bookingMethod": "online",
  "status": "booked"
}
```

**Booking Method values:** `online`, `counter`
**Status values:** `booked`, `confirmed`, `cancelled`, `completed`

⚠️ **Note:** Requires existing User, Trip, and Seat IDs

### 8.6 Update Ticket Status
```
PATCH /tickets/{id}/status?status={newStatus}
```
**Example:** `PATCH /tickets/1/status?status=confirmed`

### 8.7 Delete Ticket
```
DELETE /tickets/{id}
```

---

## Testing Order

Để test API một cách tuần tự, hãy tạo dữ liệu theo thứ tự sau:

### Step 1: Tạo dữ liệu cơ bản (không phụ thuộc)
1. ✅ **Create User** - POST `/users`
2. ✅ **Create Vehicle** - POST `/vehicles`
3. ✅ **Create Driver** - POST `/drivers`
4. ✅ **Create Route** - POST `/routes`
5. ✅ **Create Promotion** (optional) - POST `/promotions`

### Step 2: Tạo dữ liệu phụ thuộc Vehicle
6. ✅ **Create Seats** - POST `/seats` (requires vehicleId)

### Step 3: Tạo dữ liệu phụ thuộc Route, Vehicle, Driver
7. ✅ **Create Trip** - POST `/trips` (requires routeId, vehicleId, driverId)

### Step 4: Tạo dữ liệu phụ thuộc tất cả
8. ✅ **Create Ticket** - POST `/tickets` (requires userId, tripId, seatId)

---

## Response Format

Tất cả API endpoints trả về response theo format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {
    // Response data object
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

---

## Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Resource deleted successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Sample Test Data

### User Examples
```json
// Customer
{
  "username": "customer1",
  "password": "pass123",
  "email": "customer1@example.com",
  "role": "customer",
  "fullName": "Nguyen Van A",
  "phone": "0901234567"
}

// Admin
{
  "username": "admin1",
  "password": "admin123",
  "email": "admin@busbooking.com",
  "role": "admin",
  "fullName": "Tran Thi B",
  "phone": "0902345678"
}
```

### Vehicle Examples
```json
// Standard Bus
{
  "licensePlate": "29A-12345",
  "model": "Hyundai Universe",
  "totalSeats": 45,
  "seatsLayout": "2-2",
  "vehicleType": "standard"
}

// VIP Bus
{
  "licensePlate": "30B-67890",
  "model": "Thaco Luxury",
  "totalSeats": 30,
  "seatsLayout": "2-1",
  "vehicleType": "vip"
}

// Sleeper Bus
{
  "licensePlate": "51C-11111",
  "model": "Samco Primas",
  "totalSeats": 40,
  "seatsLayout": "2-1",
  "vehicleType": "sleeper"
}
```

### Route Examples
```json
// Hanoi to Da Nang
{
  "fromLocation": "Hà Nội",
  "toLocation": "Đà Nẵng",
  "distanceKm": 770,
  "basePrice": 500000,
  "estimatedDuration": 960
}

// Ho Chi Minh to Nha Trang
{
  "fromLocation": "Hồ Chí Minh",
  "toLocation": "Nha Trang",
  "distanceKm": 450,
  "basePrice": 300000,
  "estimatedDuration": 540
}

// Hanoi to Hai Phong
{
  "fromLocation": "Hà Nội",
  "toLocation": "Hải Phòng",
  "distanceKm": 120,
  "basePrice": 150000,
  "estimatedDuration": 120
}
```

### Driver Examples
```json
{
  "fullName": "Tran Van B",
  "licenseNumber": "B123456789",
  "phone": "0912345678",
  "experienceYears": 10
}

{
  "fullName": "Le Van C",
  "licenseNumber": "C987654321",
  "phone": "0923456789",
  "experienceYears": 5
}
```

---

## Import to Postman

File Postman Collection đã được tạo sẵn:
```
backend/Bus_Booking_Complete_API.postman_collection.json
```

**Cách import:**
1. Mở Postman
2. Click **Import** button
3. Chọn file `Bus_Booking_Complete_API.postman_collection.json`
4. Click **Import**
5. Collection sẽ xuất hiện trong Postman với 8 folders và 41 requests

---

## Notes

- ⚠️ Tất cả endpoints đã được cấu hình `permitAll()` cho development
- ⚠️ Trong production cần implement authentication/authorization
- ⚠️ DELETE operations có thể fail nếu có foreign key constraints
- ⚠️ Enum values phải match chính xác (case-sensitive)
- ⚠️ Date format phải theo ISO 8601: `YYYY-MM-DDTHH:mm:ss`

---

## Backend Status

✅ Backend đang chạy tại: `http://localhost:8080/api`

Kiểm tra backend:
```bash
cd backend
mvn spring-boot:run
```
