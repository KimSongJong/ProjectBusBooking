# FUTA Bus Booking System - Frontend

## 📁 Cấu trúc dự án

```
src/
├── pages/
│   ├── Mainpage.tsx    # Trang chủ - Tìm kiếm chuyến xe
│   └── Product.tsx     # Trang danh sách chuyến xe
├── components/
│   ├── ui/             # Shadcn UI components
│   └── ShadcnDemo.tsx  # Demo các UI components
├── lib/
│   └── utils.ts        # Utility functions
├── App.tsx             # Root component với routing
└── main.tsx            # Entry point
```

## 🚀 Pages đã tạo

### 1. MainPage.tsx (Trang chủ)
**Route:** `/`

**Tính năng:**
- ✅ Header với logo FUTA và nút đăng nhập
- ✅ Navigation menu (7 mục: Trang chủ, Lịch trình, Tra cứu vé, Tin tức, Hóa đơn, Liên hệ, Về chúng tôi)
- ✅ Hero banner với thông điệp "24 năm vững tin & phát triển"
- ✅ Form tìm kiếm vé:
  - Radio buttons: Một chiều / Khứ hồi
  - Điểm đi (Select dropdown)
  - Nút đổi chiều (swap button)
  - Điểm đến (Select dropdown)
  - Ngày đi (Date picker)
  - Số vé (Select 1-10)
  - Tìm kiếm gần đây
  - Nút "Tìm chuyến xe" (Navigate to Product page)
- ✅ Section "Tại sao chọn FUTA?" (3 cards)
- ✅ Tuyến đường phổ biến (4 routes)
- ✅ Footer với thông tin liên hệ
- ✅ Floating chat button

### 2. Product.tsx (Trang kết quả tìm kiếm)
**Route:** `/product`

**Tính năng:**
- ✅ Header và Navigation giống Mainpage
- ✅ Banner "24 năm vững tin & phát triển"
- ✅ Form tìm kiếm (similar to Mainpage)
- ✅ Danh sách các chuyến xe khả dụng:
  - Icon xe bus
  - Thời gian khởi hành
  - Loại xe (Giường nằm / Limousine)
  - Thời gian di chuyển
  - Số chỗ còn trống
  - Giá vé
  - Nút "Chọn chuyến"
- ✅ Footer

## 🎨 Design Features

### Color Scheme
- Primary: Orange (FUTA brand color)
  - `orange-500`: #f97316
  - `orange-600`: #ea580c
- Background: Orange gradient (50-100)
- Text: Gray scale

### Components Used
- **Shadcn UI:**
  - Button (multiple variants)
  - Card (CardContent, CardHeader, etc.)
  - Input
  - Label
  - Select (with dropdown)
  - Badge
  - Separator

- **Icons:**
  - Lucide React: Calendar, MapPin, ArrowLeftRight, Users, Clock, Phone, Mail
  - React Icons: FaBus, FaAward, FaShieldAlt, FaClock

### Responsive Design
- Mobile-first approach
- Grid layout with breakpoints:
  - `md:` - Medium screens (768px+)
  - `lg:` - Large screens (1024px+)
  - `xl:` - Extra large screens (1280px+)

## 🛣️ Routing

```tsx
/ (MainPage)
  └─ Form tìm kiếm
     └─ Click "Tìm chuyến xe"
        └─ /product?from=xxx&to=xxx&date=xxx&passengers=xxx (Product)
```

## 📝 Sử dụng

### 1. Chạy dev server
```bash
pnpm dev
```

### 2. Truy cập
- Trang chủ: http://localhost:5173/
- Trang sản phẩm: http://localhost:5173/product

### 3. Flow người dùng
1. Vào trang chủ (/)
2. Chọn điểm đi, điểm đến, ngày đi, số vé
3. Click "Tìm chuyến xe"
4. Được chuyển đến trang Product với danh sách chuyến xe
5. Chọn chuyến xe phù hợp
6. (Tiếp tục flow đặt vé...)

## 🔧 Tùy chỉnh

### Thêm tuyến đường mới
Trong `Mainpage.tsx` và `Product.tsx`, tìm phần Select:
```tsx
<SelectContent>
  <SelectItem value="yourCity">Tên thành phố</SelectItem>
</SelectContent>
```

### Thay đổi màu chủ đạo
Trong `tailwind.config.js`, chỉnh colors:
```js
colors: {
  primary: "hsl(var(--primary))",
  // ...
}
```

### Thêm chuyến xe
Trong `Product.tsx`, tìm array của trips:
```tsx
[
  { time: "06:00", duration: "6h 30m", price: "250,000", seats: 15, type: "Giường nằm" },
  // Thêm chuyến mới...
]
```

## 📦 Dependencies

- ✅ react-router-dom: Routing
- ✅ shadcn/ui: UI components
- ✅ lucide-react: Icons
- ✅ react-icons: More icons
- ✅ tailwindcss: Styling
- ✅ @radix-ui/*: Primitives for shadcn

## 🎯 Next Steps

- [ ] Implement authentication (login/register)
- [ ] Add seat selection page
- [ ] Payment integration
- [ ] Booking confirmation
- [ ] User dashboard
- [ ] Admin panel
- [ ] Real-time seat availability
- [ ] Email notifications
- [ ] Mobile app version

## 📸 Screenshots

### Trang chủ (MainPage)
- Orange gradient background
- Search form with date picker
- Popular routes section

### Trang sản phẩm (Product)
- List of available trips
- Time, price, seats info
- Book button for each trip

---

**Developed with ❤️ using React + TypeScript + Shadcn UI**
