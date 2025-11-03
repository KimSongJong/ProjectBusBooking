# 🔐 Hướng dẫn sử dụng Bearer Token trong Postman

## Cách 1: Sử dụng Collection Variable (TỰ ĐỘNG) ✅

### Step 1: Import Collection
Import file: `Bus_Booking_Auth_API.postman_collection.json`

### Step 2: Login để lấy token
```
POST http://localhost:8080/api/auth/login
Body:
{
  "username": "customer1",
  "password": "password123"
}
```

**Token sẽ tự động được lưu vào `{{auth_token}}`**

### Step 3: Sử dụng token trong các request khác
Tất cả requests trong collection đã được cấu hình để tự động sử dụng `{{auth_token}}`

Example:
```
GET http://localhost:8080/api/auth/me
Authorization: Bearer {{auth_token}}
```

---

## Cách 2: Set Bearer Token Manually cho Collection

### Option A: Collection Level Authentication

1. Click vào Collection "Bus Booking Complete API"
2. Click tab **Authorization**
3. Type: Chọn **Bearer Token**
4. Token: Nhập `{{auth_token}}`
5. Click **Save**

→ Tất cả requests trong collection sẽ tự động có Bearer token!

### Option B: Inheritance từ Collection

1. Mở bất kỳ request nào
2. Tab **Authorization**
3. Type: Chọn **Inherit auth from parent**
4. Request sẽ tự động lấy Bearer token từ collection

---

## Cách 3: Set Bearer Token cho từng Request

### Trong Postman:

1. Mở request cần test (VD: GET /tickets)
2. Click tab **Authorization**
3. Type: Chọn **Bearer Token**
4. Token: Nhập hoặc paste token vào
5. Send request

### Hoặc dùng Headers:

1. Click tab **Headers**
2. Thêm header mới:
   - Key: `Authorization`
   - Value: `Bearer your-token-here`
3. Send request

---

## Cách 4: Environment Variables (KHUYẾN NGHỊ cho nhiều môi trường)

### Setup Environment:

1. Click biểu tượng **⚙️** (Manage Environments)
2. Click **Add**
3. Environment Name: `Bus Booking Dev`
4. Thêm variable:
   - Variable: `base_url` → Value: `http://localhost:8080/api`
   - Variable: `auth_token` → Value: (để trống, sẽ set sau khi login)
5. Click **Add/Update**
6. Select environment "Bus Booking Dev" ở dropdown

### Sử dụng trong Requests:

URL: `{{base_url}}/tickets`
Authorization: `Bearer {{auth_token}}`

### Auto-save Token khi Login:

Thêm script vào tab **Tests** của Login request:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.success && jsonData.data && jsonData.data.token) {
        pm.environment.set("auth_token", jsonData.data.token);
        console.log("Token saved to environment:", jsonData.data.token);
    }
}
```

---

## 🧪 Quick Test Flow

### 1. Register (nếu chưa có user)
```
POST {{base_url}}/auth/register
Body:
{
  "username": "testuser",
  "password": "test123",
  "email": "test@example.com",
  "role": "customer",
  "fullName": "Test User",
  "phone": "0900000000"
}
```

### 2. Login → Get Token
```
POST {{base_url}}/auth/login
Body:
{
  "username": "testuser",
  "password": "test123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIs...",
    "type": "Bearer",
    "userId": 1,
    "username": "testuser"
  }
}
```

**Token automatically saved!** ✅

### 3. Use Token in Protected Endpoints
```
GET {{base_url}}/auth/me
Authorization: Bearer {{auth_token}}
```

```
GET {{base_url}}/tickets
Authorization: Bearer {{auth_token}}
```

```
POST {{base_url}}/tickets
Authorization: Bearer {{auth_token}}
Body: {...}
```

---

## 📋 Format Bearer Token

**Correct Format:**
```
Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTY5OTAxMjgwMCwiZXhwIjoxNjk5MDk5MjAwfQ.signature
```

**Incorrect Formats:**
```
❌ eyJhbGciOiJIUzI1NiJ9...  (thiếu "Bearer ")
❌ bearer eyJhbGci...       (chữ thường)
❌ BEARER eyJhbGci...       (chữ hoa)
```

**Trong Postman:**
- Dùng Authorization tab: Chọn **Bearer Token** → Chỉ cần paste token (không cần "Bearer")
- Dùng Headers: Key `Authorization` → Value phải có `Bearer ` prefix

---

## 🎯 Test với cURL

### With Token Variable:
```bash
TOKEN="your-token-here"

curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Direct Token:
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### PowerShell:
```powershell
$token = "your-token-here"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method GET -Headers $headers
```

---

## 🔍 Debug Token Issues

### Check Token trong Console:

1. Mở Postman Console (bottom-left icon)
2. Send Login request
3. Xem log: "Token saved: eyJhbGci..."
4. Copy token từ log

### Verify Token Format:

```
POST {{base_url}}/util/verify-password
?plainText=password123
&hash=token-here
```

### Check Token Expiration:

Decode token tại: **https://jwt.io**

Paste token vào → Xem `exp` field:
```json
{
  "sub": "testuser",
  "iat": 1699012800,
  "exp": 1699099200  ← Expiration timestamp
}
```

Convert timestamp: https://www.epochconverter.com

---

## ⚠️ Common Errors

### "User not authenticated"
- ✅ Check: Token có được gửi trong header không?
- ✅ Check: Format đúng `Bearer {token}`?
- ✅ Check: Token đã hết hạn chưa? (24 hours)

### "Invalid token"
- ✅ Check: Token có bị cắt không? (phải có 3 phần ngăn cách bởi `.`)
- ✅ Check: Copy đầy đủ token, không có khoảng trắng thừa

### "403 Forbidden"
- ✅ Check: User có quyền truy cập endpoint này không?
- ✅ Check: Role của user (customer/staff/admin)

---

## 📚 Postman Collections với Bearer Token

**Files đã có sẵn:**

1. ✅ `Bus_Booking_Auth_API.postman_collection.json` 
   - Auto-save token sau login
   - Sử dụng `{{auth_token}}` variable

2. ✅ `Bus_Booking_Complete_API.postman_collection.json`
   - Tất cả CRUD endpoints
   - Cần thêm Bearer token manually hoặc inherit từ collection

3. ✅ `Bus_Booking_Utility_API.postman_collection.json`
   - Utility endpoints (không cần token)

---

## 🚀 Best Practices

1. ✅ **Sử dụng Environment Variables** cho base_url và auth_token
2. ✅ **Auto-save token** sau khi login bằng Tests script
3. ✅ **Set authentication ở Collection level** để inherit cho tất cả requests
4. ✅ **Check token expiration** trước khi test (24 hours)
5. ✅ **Logout và login lại** khi token hết hạn

---

**Bearer Token Authentication is ready! 🔐**
