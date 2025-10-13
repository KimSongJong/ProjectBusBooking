
create database bus_booking2;
Use  bus_booking2;

SET FOREIGN_KEY_CHECKS = 0;

-- Bảng users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role ENUM('customer', 'staff', 'admin') NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng drivers
CREATE TABLE drivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(50) UNIQUE,
  phone VARCHAR(20),
  experience_years INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng vehicles
CREATE TABLE vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  model VARCHAR(100),
  total_seats INT NOT NULL,
  seats_layout Text, -- Thay bằng TEXT nếu MySQL < 5.7
  vehicle_type ENUM('standard', 'vip', 'sleeper') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng seats
CREATE TABLE seats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  seat_type ENUM('standard', 'vip', 'bed') NOT NULL,
  status ENUM('available', 'booked', 'unavailable') DEFAULT 'available',
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Bảng routes
CREATE TABLE routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(10,2),
  base_price DECIMAL(15,2) NOT NULL,
  estimated_duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trips
CREATE TABLE trips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  route_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  driver_id INT NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP,
  status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES routes(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Bảng promotions
CREATE TABLE promotions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  max_uses INT,
  used_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng promotion_routes (trung gian)
CREATE TABLE promotion_routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  promotion_id INT NOT NULL,
  route_id INT NOT NULL,
  FOREIGN KEY (promotion_id) REFERENCES promotions(id),
  FOREIGN KEY (route_id) REFERENCES routes(id)
);

-- Bảng tickets
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  trip_id INT NOT NULL,
  seat_id INT NOT NULL,
  promotion_id INT,
  price DECIMAL(15,2) NOT NULL,
  booking_method ENUM('online', 'offline') NOT NULL,
  status ENUM('booked', 'confirmed', 'cancelled') DEFAULT 'booked',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  FOREIGN KEY (seat_id) REFERENCES seats(id),
  FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

-- Bảng payments
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method ENUM('VNPay', 'Momo', 'cash', 'bank_transfer') NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- Bảng invoices
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  invoice_number VARCHAR(50) UNIQUE,
  details TEXT,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Bảng notifications
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('email', 'sms', 'push') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bảng reports
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT,
  report_type ENUM('revenue', 'passenger_count', 'empty_seat_ratio') NOT NULL,
  value DECIMAL(15,2),
  report_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);


-- 1. Chèn dữ liệu vào bảng users (3 người dùng: 1 admin, 1 nhân viên, 1 khách hàng)
INSERT INTO users (username, password, email, role, full_name, phone, created_at) VALUES
('admin01', 'hashed_password1', 'admin@bus.com', 'admin', 'Nguyen Van Admin', '0901234567', '2025-10-01 08:00:00'),
('staff01', 'hashed_password2', 'staff@bus.com', 'staff', 'Tran Thi Staff', '0912345678', '2025-10-01 09:00:00'),
('customer01', 'hashed_password3', 'customer@bus.com', 'customer', 'Le Van Khach', '0923456789', '2025-10-01 10:00:00');

-- 2. Chèn dữ liệu vào bảng drivers (2 tài xế)
INSERT INTO drivers (full_name, license_number, phone, experience_years, created_at) VALUES
('Nguyen Van Tai', 'TX123456', '0931234567', 5, '2025-10-01 08:30:00'),
('Pham Van Xe', 'TX789012', '0941234567', 8, '2025-10-01 09:30:00');

-- 3. Chèn dữ liệu vào bảng vehicles (2 xe khách)
INSERT INTO vehicles (license_plate, model, total_seats, seats_layout, vehicle_type, created_at) VALUES
('51B-12345', 'Hyundai Universe', 40, '{"rows": 10, "columns": 4, "type": "standard"}', 'standard', '2025-10-01 07:00:00'),
('51B-67890', 'Thaco King Long', 30, '{"rows": 10, "columns": 3, "type": "sleeper"}', 'sleeper', '2025-10-01 07:30:00');

-- 4. Chèn dữ liệu vào bảng seats (4 ghế: 2 ghế/xe)
INSERT INTO seats (vehicle_id, seat_number, seat_type, status) VALUES
(1, 'A1', 'standard', 'available'),
(1, 'A2', 'standard', 'booked'),
(2, 'B1', 'bed', 'available'),
(2, 'B2', 'bed', 'booked');

-- 5. Chèn dữ liệu vào bảng routes (3 tuyến đường)
INSERT INTO routes (from_location, to_location, distance_km, base_price, estimated_duration, created_at) VALUES
('Hà Nội', 'Hồ Chí Minh', 1700.00, 1200000.00, 2100, '2025-10-01 06:00:00'),
('Đà Nẵng', 'Hà Nội', 770.00, 600000.00, 960, '2025-10-01 06:30:00'),
('Hồ Chí Minh', 'Đà Lạt', 300.00, 300000.00, 360, '2025-10-01 07:00:00');

-- 6. Chèn dữ liệu vào bảng trips (3 chuyến xe)
INSERT INTO trips (route_id, vehicle_id, driver_id, departure_time, arrival_time, status, created_at) VALUES
(1, 1, 1, '2025-10-15 08:00:00', '2025-10-16 20:00:00', 'scheduled', '2025-10-02 09:00:00'),
(2, 2, 2, '2025-10-16 07:00:00', '2025-10-16 23:00:00', 'scheduled', '2025-10-02 10:00:00'),
(3, 1, 1, '2025-10-17 06:00:00', '2025-10-17 12:00:00', 'scheduled', '2025-10-02 11:00:00');

-- 7. Chèn dữ liệu vào bảng promotions (2 khuyến mãi)
INSERT INTO promotions (code, discount_percentage, discount_amount, start_date, end_date, max_uses, used_count, created_at) VALUES
('DISCOUNT10', 10.00, NULL, '2025-10-01', '2025-10-31', 100, 5, '2025-10-01 08:00:00'),
('SALE200K', NULL, 200000.00, '2025-10-01', '2025-10-15', 50, 2, '2025-10-01 09:00:00');

-- 8. Chèn dữ liệu vào bảng promotion_routes (liên kết khuyến mãi với tuyến đường)
INSERT INTO promotion_routes (promotion_id, route_id) VALUES
(1, 1), -- DISCOUNT10 áp dụng cho tuyến Hà Nội - Hồ Chí Minh
(1, 2), -- DISCOUNT10 áp dụng cho tuyến Đà Nẵng - Hà Nội
(2, 3); -- SALE200K áp dụng cho tuyến Hồ Chí Minh - Đà Lạt

-- 9. Chèn dữ liệu vào bảng tickets (3 vé)
INSERT INTO tickets (user_id, trip_id, seat_id, promotion_id, price, booking_method, status, booked_at, cancelled_at) VALUES
(3, 1, 2, 1, 1080000.00, 'online', 'confirmed', '2025-10-03 10:00:00', NULL), -- Áp dụng DISCOUNT10 (10% off)
(3, 2, 4, NULL, 600000.00, 'offline', 'booked', '2025-10-03 11:00:00', NULL),
(3, 3, 1, 2, 100000.00, 'online', 'confirmed', '2025-10-03 12:00:00', NULL); -- Áp dụng SALE200K (giảm 200K)

-- 10. Chèn dữ liệu vào bảng payments (3 thanh toán)
INSERT INTO payments (ticket_id, amount, method, status, transaction_id, paid_at) VALUES
(1, 1080000.00, 'VNPay', 'completed', 'VNPAY123456', '2025-10-03 10:05:00'),
(2, 600000.00, 'cash', 'pending', NULL, NULL),
(3, 100000.00, 'Momo', 'completed', 'MOMO789012', '2025-10-03 12:05:00');

-- 11. Chèn dữ liệu vào bảng invoices (2 hóa đơn)
INSERT INTO invoices (payment_id, invoice_number, details, issued_at) VALUES
(1, 'INV001', 'Hóa đơn vé Hà Nội - Hồ Chí Minh, ghế A2', '2025-10-03 10:10:00'),
(3, 'INV002', 'Hóa đơn vé Hồ Chí Minh - Đà Lạt, ghế A1', '2025-10-03 12:10:00');

-- 12. Chèn dữ liệu vào bảng notifications (3 thông báo)
INSERT INTO notifications (user_id, message, type, sent_at, status) VALUES
(3, 'Vé của bạn (Hà Nội - Hồ Chí Minh) đã được xác nhận!', 'email', '2025-10-03 10:15:00', 'sent'),
(3, 'Thanh toán vé Hồ Chí Minh - Đà Lạt thành công.', 'sms', '2025-10-03 12:15:00', 'sent'),
(3, 'Chuyến xe Đà Nẵng - Hà Nội đã được đặt, vui lòng thanh toán!', 'push', '2025-10-03 11:15:00', 'sent');

-- 13. Chèn dữ liệu vào bảng reports (3 báo cáo)
INSERT INTO reports (trip_id, report_type, value, report_date, created_at) VALUES
(1, 'revenue', 1080000.00, '2025-10-15', '2025-10-03 15:00:00'),
(1, 'passenger_count', 1, '2025-10-15', '2025-10-03 15:00:00'),
(1, 'empty_seat_ratio', 97.50, '2025-10-15', '2025-10-03 15:00:00'); -- 1/40 ghế được đặt

SET FOREIGN_KEY_CHECKS = 1;