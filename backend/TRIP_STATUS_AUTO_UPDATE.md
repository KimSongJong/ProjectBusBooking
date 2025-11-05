# Logic Tự Động Cập Nhật Trạng Thái Chuyến Xe

## 📋 Tổng Quan

Hệ thống tự động cập nhật trạng thái chuyến xe dựa trên thời gian thực tế.

## 🔄 Quy Trình Tự Động

### 1. Khi Tạo Chuyến Mới
- **Trạng thái mặc định**: `scheduled` (Đã lên lịch)
- **Giới hạn thời gian**: Chỉ được đặt trong vòng 24 giờ kể từ bây giờ
- **Validation**:
  - Thời gian khởi hành >= thời gian hiện tại
  - Thời gian khởi hành <= thời gian hiện tại + 24 giờ
  - Thời gian đến > thời gian khởi hành
  - Tài xế phải rảnh (không có chuyến scheduled/ongoing)
  - Xe phải rảnh (không có chuyến scheduled/ongoing)

### 2. Chuyển Sang "Đang Chạy"
**Điều kiện**: Khi `thời gian hiện tại >= thời gian khởi hành`

```
scheduled → ongoing
```

**Tự động**: Hệ thống kiểm tra mỗi 1 phút và tự động chuyển trạng thái.

### 3. Chuyển Sang "Hoàn Thành"
**Điều kiện**: Khi `thời gian hiện tại >= thời gian đến (dự kiến)`

```
ongoing → completed
```

**Tự động**: Hệ thống kiểm tra mỗi 1 phút và tự động chuyển trạng thái.

### 4. Sau Khi "Hoàn Thành"
- Tài xế trở thành **rảnh**, có thể nhận chuyến mới
- Xe trở thành **rảnh**, có thể chạy tuyến mới

## 🔐 Ràng Buộc

### Tài Xế
- ❌ Tài xế có chuyến `scheduled` hoặc `ongoing` → KHÔNG thể lái xe khác
- ✅ Tài xế có chuyến `completed` hoặc `cancelled` → Có thể nhận chuyến mới

### Xe
- ❌ Xe có chuyến `scheduled` hoặc `ongoing` → KHÔNG thể chạy tuyến khác  
- ✅ Xe có chuyến `completed` hoặc `cancelled` → Có thể chạy tuyến mới

## 🛠️ Implementation

### Backend
- **File**: `TripStatusScheduler.java`
- **Frequency**: Chạy mỗi 60 giây (1 phút)
- **Method**: `@Scheduled(fixedRate = 60000)`

### Frontend
- **Validation**: Client-side validation trước khi gửi request
- **Dropdown Filter**: Chỉ hiển thị tài xế/xe rảnh
- **Time Constraints**: Input có `min` và `max` attributes

## 📊 Sơ Đồ Trạng Thái

```
[Tạo mới] 
    ↓
scheduled (Đã lên lịch)
    ↓ (Tự động khi đến giờ khởi hành)
ongoing (Đang chạy)
    ↓ (Tự động khi đến giờ dự kiến)
completed (Hoàn thành)

             OR
             
scheduled → cancelled (Thủ công)
ongoing → cancelled (Thủ công)
```

## ⚠️ Lưu Ý

1. **Không thể tạo chuyến quá 24 giờ**: Để đảm bảo tính khả thi và tránh lên lịch quá xa
2. **Tự động chuyển trạng thái**: Admin không cần can thiệp thủ công
3. **Thời gian đến là BẮT BUỘC**: Để hệ thống biết khi nào chuyển sang "hoàn thành"
4. **Chỉ cancelled thủ công**: Admin có thể hủy chuyến bất kỳ lúc nào

## 🧪 Test Cases

1. **Test 1**: Tạo chuyến khởi hành sau 5 phút → Sau 5 phút check xem có tự động chuyển sang "ongoing"
2. **Test 2**: Tạo chuyến với thời gian đến sau 10 phút → Sau 10 phút check xem có tự động chuyển sang "completed"
3. **Test 3**: Tài xế có chuyến "ongoing" → Không thể tạo chuyến mới với tài xế này
4. **Test 4**: Sau khi chuyến "completed" → Tài xế xuất hiện lại trong dropdown

## 🚀 How to Restart Backend

```bash
# Stop current backend
cd D:\ProjectBusBooking\backend
# Ctrl+C to stop

# Start backend
mvn spring-boot:run
```

Khi khởi động sẽ thấy:
```
Auto-update trip status: ENABLED
```
