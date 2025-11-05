-- ========================================
-- MIGRATION SCRIPT: Trip Seats Management
-- Quản lý ghế ngồi cho từng chuyến xe
-- ========================================

USE bus_booking;

-- Bước 1: Tạo bảng trip_seats (ghế cho từng chuyến xe)
CREATE TABLE IF NOT EXISTS trip_seats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  seat_type ENUM('standard', 'vip', 'bed') NOT NULL,
  status ENUM('available', 'booked', 'locked') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE KEY unique_trip_seat (trip_id, seat_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bước 2: Thêm index để tối ưu query
CREATE INDEX idx_trip_seats_trip_id ON trip_seats(trip_id);
CREATE INDEX idx_trip_seats_status ON trip_seats(status);

-- Bước 3: Cập nhật bảng tickets để liên kết với trip_seats
-- Backup dữ liệu cũ trước
CREATE TABLE IF NOT EXISTS tickets_backup AS SELECT * FROM tickets;

-- Thêm cột trip_seat_id vào bảng tickets
ALTER TABLE tickets ADD COLUMN trip_seat_id INT AFTER seat_id;
ALTER TABLE tickets ADD FOREIGN KEY (trip_seat_id) REFERENCES trip_seats(id);

-- Bước 4: Tạo stored procedure để tự động tạo ghế cho trip mới
DELIMITER //

CREATE PROCEDURE create_trip_seats(IN p_trip_id INT, IN p_vehicle_id INT)
BEGIN
    -- Copy tất cả ghế từ vehicle vào trip_seats
    INSERT INTO trip_seats (trip_id, seat_number, seat_type, status)
    SELECT 
        p_trip_id,
        seat_number,
        seat_type,
        'available'
    FROM seats
    WHERE vehicle_id = p_vehicle_id;
END //

DELIMITER ;

-- Bước 5: Tạo trigger tự động tạo ghế khi insert trip mới
DELIMITER //

CREATE TRIGGER after_trip_insert
AFTER INSERT ON trips
FOR EACH ROW
BEGIN
    -- Tự động tạo ghế cho trip mới
    INSERT INTO trip_seats (trip_id, seat_number, seat_type, status)
    SELECT 
        NEW.id,
        seat_number,
        seat_type,
        'available'
    FROM seats
    WHERE vehicle_id = NEW.vehicle_id;
END //

DELIMITER ;

-- Bước 6: Migrate dữ liệu cũ (nếu có trips đã tồn tại)
-- Tạo trip_seats cho các trips hiện có
INSERT INTO trip_seats (trip_id, seat_number, seat_type, status)
SELECT 
    t.id as trip_id,
    s.seat_number,
    s.seat_type,
    'available' as status
FROM trips t
INNER JOIN seats s ON s.vehicle_id = t.vehicle_id
WHERE NOT EXISTS (
    SELECT 1 FROM trip_seats ts 
    WHERE ts.trip_id = t.id AND ts.seat_number = s.seat_number
);

-- Bước 7: Tạo view để dễ query thông tin ghế
CREATE OR REPLACE VIEW v_trip_seats_info AS
SELECT 
    ts.id as trip_seat_id,
    ts.trip_id,
    t.departure_time,
    t.arrival_time,
    t.status as trip_status,
    r.from_location,
    r.to_location,
    v.license_plate,
    v.vehicle_type,
    ts.seat_number,
    ts.seat_type,
    ts.status as seat_status,
    ts.created_at
FROM trip_seats ts
INNER JOIN trips t ON ts.trip_id = t.id
INNER JOIN routes r ON t.route_id = r.id
INNER JOIN vehicles v ON t.vehicle_id = v.id;

-- Bước 8: Tạo stored procedure để lấy ghế trống của một chuyến
DELIMITER //

CREATE PROCEDURE get_available_seats(IN p_trip_id INT)
BEGIN
    SELECT 
        id,
        seat_number,
        seat_type,
        status
    FROM trip_seats
    WHERE trip_id = p_trip_id 
    AND status = 'available'
    ORDER BY seat_number;
END //

DELIMITER ;

-- Bước 9: Tạo stored procedure để đặt ghế
DELIMITER //

CREATE PROCEDURE book_seat(
    IN p_trip_seat_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE seat_status VARCHAR(20);
    
    -- Kiểm tra trạng thái ghế hiện tại
    SELECT status INTO seat_status 
    FROM trip_seats 
    WHERE id = p_trip_seat_id;
    
    IF seat_status IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'Ghế không tồn tại';
    ELSEIF seat_status != 'available' THEN
        SET p_success = FALSE;
        SET p_message = 'Ghế đã được đặt hoặc bị khóa';
    ELSE
        -- Cập nhật trạng thái ghế thành booked
        UPDATE trip_seats 
        SET status = 'booked' 
        WHERE id = p_trip_seat_id;
        
        SET p_success = TRUE;
        SET p_message = 'Đặt ghế thành công';
    END IF;
END //

DELIMITER ;

-- Bước 10: Tạo function để đếm số ghế trống
DELIMITER //

CREATE FUNCTION count_available_seats(p_trip_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE seat_count INT;
    
    SELECT COUNT(*) INTO seat_count
    FROM trip_seats
    WHERE trip_id = p_trip_id 
    AND status = 'available';
    
    RETURN seat_count;
END //

DELIMITER ;

-- ========================================
-- TEST QUERIES
-- ========================================

-- 1. Kiểm tra số ghế của mỗi chuyến
SELECT 
    t.id as trip_id,
    r.from_location,
    r.to_location,
    t.departure_time,
    COUNT(ts.id) as total_seats,
    SUM(CASE WHEN ts.status = 'available' THEN 1 ELSE 0 END) as available_seats,
    SUM(CASE WHEN ts.status = 'booked' THEN 1 ELSE 0 END) as booked_seats
FROM trips t
INNER JOIN routes r ON t.route_id = r.id
LEFT JOIN trip_seats ts ON t.id = ts.trip_id
GROUP BY t.id, r.from_location, r.to_location, t.departure_time;

-- 2. Lấy danh sách ghế trống của chuyến xe số 1
SELECT * FROM trip_seats 
WHERE trip_id = 1 
AND status = 'available'
ORDER BY seat_number;

-- 3. Sử dụng function đếm ghế trống
SELECT 
    id as trip_id,
    count_available_seats(id) as available_seats
FROM trips;

-- 4. Sử dụng view
SELECT * FROM v_trip_seats_info 
WHERE trip_id = 1;

-- ========================================
-- ROLLBACK SCRIPT (Nếu cần)
-- ========================================
/*
DROP TRIGGER IF EXISTS after_trip_insert;
DROP PROCEDURE IF EXISTS create_trip_seats;
DROP PROCEDURE IF EXISTS get_available_seats;
DROP PROCEDURE IF EXISTS book_seat;
DROP FUNCTION IF EXISTS count_available_seats;
DROP VIEW IF EXISTS v_trip_seats_info;
ALTER TABLE tickets DROP FOREIGN KEY tickets_ibfk_3;
ALTER TABLE tickets DROP COLUMN trip_seat_id;
DROP TABLE IF EXISTS trip_seats;
DROP TABLE IF EXISTS tickets_backup;
*/
