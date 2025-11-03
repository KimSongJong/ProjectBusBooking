# 🔐 Authentication API Documentation

## Base URL
```
http://localhost:8080/api
```

---

## Authentication Endpoints

### 1. Register (Đăng ký)

Tạo tài khoản mới cho user.

**Endpoint:**
```
POST /auth/register
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

**Role values:**
- `customer` - Khách hàng
- `staff` - Nhân viên
- `admin` - Quản trị viên

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "customer1",
    "email": "customer1@example.com",
    "role": "customer",
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "createdAt": "2025-11-03T10:30:00",
    "updatedAt": null
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Username already exists",
  "data": null
}
```

---

### 2. Login (Đăng nhập)

Đăng nhập và nhận JWT token.

**Endpoint:**
```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "customer1",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "userId": 1,
    "username": "customer1",
    "email": "customer1@example.com",
    "role": "customer",
    "fullName": "Nguyen Van A"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

**Lưu token:** Lưu token từ response để sử dụng cho các request tiếp theo.

---

### 3. Logout (Đăng xuất)

Đăng xuất và xóa authentication context.

**Endpoint:**
```
POST /auth/logout
Authorization: Bearer {token}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### 4. Get Current User (Lấy thông tin user hiện tại)

Lấy thông tin của user đang đăng nhập.

**Endpoint:**
```
GET /auth/me
Authorization: Bearer {token}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User details retrieved",
  "data": {
    "id": 1,
    "username": "customer1",
    "email": "customer1@example.com",
    "role": "customer",
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "createdAt": "2025-11-03T10:30:00",
    "updatedAt": null
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "User not authenticated",
  "data": null
}
```

---

## Cách sử dụng JWT Token

### 1. Sau khi login thành công:

Lưu token từ response:
```javascript
const token = response.data.data.token;
localStorage.setItem('token', token);
```

### 2. Sử dụng token cho các request khác:

Thêm token vào header `Authorization`:
```
Authorization: Bearer {token}
```

**Ví dụ với Fetch API:**
```javascript
fetch('http://localhost:8080/api/tickets', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

**Ví dụ với Axios:**
```javascript
axios.get('http://localhost:8080/api/tickets', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Ví dụ với Postman:**
1. Chọn tab **Authorization**
2. Type: **Bearer Token**
3. Token: Paste token vào đây

---

## Security Flow

```
1. User Register
   POST /auth/register
   → Tạo user mới với password đã mã hóa (BCrypt)
   
2. User Login
   POST /auth/login
   → Xác thực username/password
   → Tạo JWT token (valid 24h)
   → Trả về token + user info
   
3. Access Protected Resources
   GET/POST/PUT/DELETE /api/{resource}
   Header: Authorization: Bearer {token}
   → Validate token
   → Check expiration
   → Extract username from token
   → Load user details
   → Allow/Deny request
   
4. User Logout
   POST /auth/logout
   → Clear security context
   → Client xóa token (localStorage/cookie)
```

---

## Token Expiration

- **Token lifetime:** 24 hours (86400000 ms)
- **After expiration:** User phải login lại
- **Check expiration:** Backend tự động validate khi nhận request

---

## Error Codes

| Status Code | Meaning | Solution |
|------------|---------|----------|
| 400 Bad Request | Invalid input data | Kiểm tra request body format |
| 401 Unauthorized | Invalid/Expired token | Login lại để lấy token mới |
| 403 Forbidden | Không có quyền truy cập | Kiểm tra role của user |
| 404 Not Found | Resource không tồn tại | Kiểm tra endpoint URL |
| 500 Internal Server Error | Lỗi server | Kiểm tra logs |

---

## Testing với Postman

### Step 1: Register User
```
POST http://localhost:8080/api/auth/register
Body (raw JSON):
{
  "username": "testuser",
  "password": "test123",
  "email": "test@example.com",
  "role": "customer",
  "fullName": "Test User",
  "phone": "0900000000"
}
```

### Step 2: Login
```
POST http://localhost:8080/api/auth/login
Body (raw JSON):
{
  "username": "testuser",
  "password": "test123"
}
```

**Copy token từ response**

### Step 3: Use Token for Other APIs
```
GET http://localhost:8080/api/tickets
Authorization: Bearer {paste_token_here}
```

### Step 4: Get Current User Info
```
GET http://localhost:8080/api/auth/me
Authorization: Bearer {paste_token_here}
```

### Step 5: Logout
```
POST http://localhost:8080/api/auth/logout
Authorization: Bearer {paste_token_here}
```

---

## Frontend Integration Example (React)

### 1. Create Auth Context
```javascript
// AuthContext.js
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (username, password) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setToken(data.data.token);
      setUser(data.data);
      localStorage.setItem('token', data.data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Login Component
```javascript
// Login.jsx
import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      alert('Login successful!');
    } else {
      alert('Login failed!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### 3. Protected API Call
```javascript
// TicketService.js
const getTickets = async (token) => {
  const response = await fetch('http://localhost:8080/api/tickets', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
};
```

---

## Security Best Practices

### ✅ DO:
- ✅ Lưu token ở localStorage hoặc httpOnly cookie
- ✅ Xóa token khi logout
- ✅ Validate token ở mỗi protected request
- ✅ Sử dụng HTTPS trong production
- ✅ Set token expiration time hợp lý
- ✅ Mã hóa password với BCrypt

### ❌ DON'T:
- ❌ Không share token với người khác
- ❌ Không lưu password plain text
- ❌ Không hardcode secret key
- ❌ Không expose token trong URL
- ❌ Không skip token validation
- ❌ Không sử dụng HTTP trong production

---

## Configuration

### application.properties
```properties
# JWT Configuration
app.jwt.secret=dGhpc0lzQVZlcnlTZWNyZXRLZXlGb3JKV1RUb2tlbkdlbmVyYXRpb25JbkJ1c0Jvb2tpbmdTeXN0ZW0xMjM0NTY3ODk=
app.jwt.expiration=86400000

# Security
spring.security.user.name=admin
spring.security.user.password=admin123
```

**⚠️ Important:** Thay đổi `app.jwt.secret` trong production!

---

## Troubleshooting

### Problem: "Invalid JWT signature"
**Solution:** Token không hợp lệ, login lại để lấy token mới

### Problem: "Expired JWT token"
**Solution:** Token đã hết hạn (24h), login lại

### Problem: "User not authenticated"
**Solution:** Chưa login hoặc token không được gửi trong header

### Problem: "Username already exists"
**Solution:** Username đã được sử dụng, chọn username khác

### Problem: "403 Forbidden"
**Solution:** User không có quyền truy cập resource này

---

## API Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/register` | POST | ❌ No | Đăng ký user mới |
| `/auth/login` | POST | ❌ No | Đăng nhập |
| `/auth/logout` | POST | ✅ Yes | Đăng xuất |
| `/auth/me` | GET | ✅ Yes | Lấy thông tin user hiện tại |

---

**🔐 Authentication system is ready to use!**
