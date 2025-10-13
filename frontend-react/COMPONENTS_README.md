# Components Structure

## 📁 Component Organization

```
src/
├── components/
│   ├── header.tsx     # Shared Header component
│   ├── footer.tsx     # Shared Footer component
│   └── ui/            # Shadcn UI components
└── pages/
    ├── Mainpage.tsx   # Home page (uses Header & Footer)
    └── Product.tsx    # Product listing page (uses Header & Footer)
```

## 🧩 Shared Components

### Header Component (`header.tsx`)

**Sử dụng:** Import và sử dụng trong các pages

```tsx
import Header from "@/components/header"

function YourPage() {
  return (
    <div>
      <Header />
      {/* Your page content */}
    </div>
  )
}
```

**Bao gồm:**
- ✅ Top bar với logo FUTA Bus Lines
- ✅ "Tải ứng dụng FUTA App" text
- ✅ Button "Đăng nhập/Đăng ký"
- ✅ Navigation menu (sticky):
  - TRANG CHỦ
  - LỊCH TRÌNH
  - TRA CỨU VÉ
  - TIN TỨC
  - HÓA ĐƠN
  - LIÊN HỆ
  - VỀ CHÚNG TÔI

**Features:**
- Responsive design (mobile-first)
- Sticky navigation bar
- Active state on current page
- Hover effects
- Orange gradient background matching FUTA brand

---

### Footer Component (`footer.tsx`)

**Sử dụng:** Import và sử dụng trong các pages

```tsx
import Footer from "@/components/footer"

function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <Footer />
    </div>
  )
}
```

**Bao gồm:**
- ✅ Logo và tagline FUTA
- ✅ 4 cột thông tin:
  1. **FUTA Bus Lines** - Giới thiệu
  2. **Về chúng tôi** - Links
  3. **Hỗ trợ** - Links
  4. **Liên hệ** - Hotline, Email, Address

**Footer Info:**
- 📞 Hotline: **1900 6067** (24/7)
- 📧 Email: hotro@futa.vn
- 📍 Địa chỉ: Số 01 Tô Hiến Thành, Phường 3, TP. Đà Lạt, Lâm Đồng

**Social Links:**
- Facebook
- YouTube
- Zalo

---

## 📄 Pages Using Components

### MainPage.tsx
```tsx
import Header from "@/components/header"
import Footer from "@/components/footer"

function MainPage() {
  return (
    <div>
      <Header />
      {/* Hero Banner */}
      {/* Search Form */}
      {/* Features Section */}
      {/* Popular Routes */}
      <Footer />
      {/* Floating Chat Button */}
    </div>
  )
}
```

### Product.tsx
```tsx
import Header from "@/components/header"
import Footer from "@/components/footer"

function Product() {
  return (
    <div>
      <Header />
      {/* Banner */}
      {/* Search Form */}
      {/* Available Trips List */}
      <Footer />
    </div>
  )
}
```

---

## 🎨 Design Consistency

### Header
- **Background:** `bg-gradient-to-r from-orange-500 to-orange-600`
- **Navigation:** `bg-white` with `sticky top-0`
- **Active link:** Orange underline border
- **Hover:** Orange color transition

### Footer
- **Background:** `bg-gray-900`
- **Text:** White & gray-400
- **Links hover:** Orange-400 transition
- **Icons:** Lucide React (Phone, Mail, MapPinIcon)
- **Logo icon:** React Icons (FaBus)

---

## 🔧 Customization

### Thay đổi logo
In `header.tsx`:
```tsx
<div className="bg-white rounded-lg p-2">
  <FaBus className="text-3xl text-orange-600" />
  {/* Hoặc thay bằng <img> của bạn */}
</div>
```

### Thêm menu item
In `header.tsx`:
```tsx
<li className="py-4 hover:border-b-2 hover:border-orange-300 whitespace-nowrap">
  <a href="/your-link" className="text-gray-700 hover:text-orange-600">
    YOUR MENU
  </a>
</li>
```

### Cập nhật thông tin liên hệ
In `footer.tsx`, tìm section "Liên hệ":
```tsx
<div className="text-orange-400 font-bold text-lg">1900 6067</div>
<a href="mailto:hotro@futa.vn">hotro@futa.vn</a>
<p>Số 01 Tô Hiến Thành...</p>
```

---

## 📱 Responsive Behavior

### Header
- **Mobile:** Logo + Login button stacked
- **Desktop:** Full layout with all items

### Navigation
- **Mobile:** Horizontal scrollable menu
- **Desktop:** Fixed width menu items

### Footer
- **Mobile:** Single column stack
- **Tablet:** 2 columns
- **Desktop:** 4 columns grid

---

## ✅ Benefits of Component Separation

1. **Reusability** - Dùng lại Header & Footer cho tất cả pages
2. **Maintainability** - Chỉnh sửa 1 lần, áp dụng cho tất cả
3. **Consistency** - Đồng nhất UI/UX trên toàn site
4. **Code organization** - Code sạch hơn, dễ đọc
5. **Performance** - React re-render tối ưu

---

## 🚀 Usage Example

### Tạo page mới với Header & Footer

```tsx
// src/pages/NewPage.tsx
import Header from "@/components/header"
import Footer from "@/components/footer"

function NewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">Your Page Title</h1>
        {/* Your content here */}
      </main>
      
      <Footer />
    </div>
  )
}

export default NewPage
```

### Thêm route mới

```tsx
// src/App.tsx
import NewPage from './pages/NewPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/product" element={<Product />} />
        <Route path="/new-page" element={<NewPage />} />
      </Routes>
    </Router>
  )
}
```

---

**Updated:** October 11, 2025
**Version:** 1.0
