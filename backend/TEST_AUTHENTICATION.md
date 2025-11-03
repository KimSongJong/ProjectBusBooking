# Test Authentication với Postman

## Cách test Login và xem Token:

### 1. Import Collection vào Postman
File: `Bus_Booking_Auth_API.postman_collection.json`

### 2. Test Register (Tạo user mới)

**Request:**
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

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

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "customer",
    "fullName": "Test User",
    "phone": "0900000000",
    "createdAt": "2025-11-03T14:30:00"
  }
}
```

### 3. Test Login (Lấy Token)

**Request:**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

Body:
{
  "username": "testuser",
  "password": "test123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTY5OTAxMjgwMCwiZXhwIjoxNjk5MDk5MjAwfQ.xxxxxxxxxxx",
    "type": "Bearer",
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "customer",
    "fullName": "Test User"
  }
}
```

**Token sẽ được tự động lưu vào Collection Variable `{{auth_token}}`**

### 4. Xem Token trong Postman

**Cách 1: Trong Response**
- Gửi Login request
- Xem tab **Body** của response
- Copy giá trị `data.token`

**Cách 2: Trong Collection Variables**
- Click vào collection "Bus Booking Authentication API"
- Click tab **Variables**
- Xem giá trị của `auth_token`

**Cách 3: Trong Console**
- Click nút **Console** ở bottom-left Postman
- Sau khi login, sẽ thấy log: `Token saved: eyJhbGci...`

### 5. Test với Token

**Request Get Current User:**
```
GET http://localhost:8080/api/auth/me
Authorization: Bearer {{auth_token}}
```

Collection đã tự động sử dụng `{{auth_token}}` variable!

---

## Quick Test với cURL (Command Line)

### Register:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "email": "test@example.com",
    "role": "customer",
    "fullName": "Test User",
    "phone": "0900000000"
  }'
```

### Login (In ra Token):
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }' | jq
```

**Windows PowerShell:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"testuser","password":"test123"}'
Write-Host "Token: $($response.data.token)"
Write-Host "User ID: $($response.data.userId)"
Write-Host "Username: $($response.data.username)"
```

### Use Token:
```bash
# Save token to variable
TOKEN="your-token-here"

# Use token
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Console Script (Added to Login Request)

Request Login đã có script tự động:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.success && jsonData.data && jsonData.data.token) {
        pm.collectionVariables.set("auth_token", jsonData.data.token);
        pm.collectionVariables.set("user_id", jsonData.data.userId);
        pm.collectionVariables.set("username", jsonData.data.username);
        console.log("Token saved: " + jsonData.data.token);
        console.log("User ID: " + jsonData.data.userId);
        console.log("Username: " + jsonData.data.username);
    }
}
```

Script này sẽ:
1. ✅ Lưu token vào `{{auth_token}}`
2. ✅ Lưu user_id vào `{{user_id}}`
3. ✅ Lưu username vào `{{username}}`
4. ✅ In ra token trong Console

---

## Example Token Format

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTY5OTAxMjgwMCwiZXhwIjoxNjk5MDk5MjAwfQ.signature_here
```

**Token có 3 phần (ngăn cách bởi dấu `.`):**
1. **Header**: `eyJhbGciOiJIUzI1NiJ9`
2. **Payload**: `eyJzdWIiOiJ0ZXN0dXNlciIs...`
3. **Signature**: `signature_here`

**Decode Payload tại:** https://jwt.io

---

## Troubleshooting

### "Username already exists"
→ Username đã tồn tại, thử username khác hoặc dùng user đã tạo để login

### "Invalid username or password"
→ Sai username hoặc password, kiểm tra lại

### "User not authenticated"
→ Token không hợp lệ hoặc đã hết hạn, login lại

### Token không hiển thị
→ Kiểm tra:
1. Backend đang chạy: http://localhost:8080/api
2. Response status = 200
3. Response có field `success: true`
4. Mở Postman Console để xem logs

---

**Ready to test! 🚀**
