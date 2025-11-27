# 🎬 DEMO QUICK REFERENCE CARD
## Dùng khi thuyết trình - In ra giấy A4

---

## 🔴 START SERVERS

```bash
# Terminal 1 - Backend (Port 8080)
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend (Port 5173)
cd frontend-react
npm run dev
```

**Check running:**
- Backend: http://localhost:8080/api/health (should return 200)
- Frontend: http://localhost:5173/ (should show homepage)

---

## 👤 LOGIN CREDENTIALS

### Admin:
```
Username: admin
Password: 123456
URL: http://localhost:5173/admin/login
```

### Customer (if needed):
```
Username: user1
Password: 123456
URL: http://localhost:5173/login
```

---

## 📧 EMAIL FOR DEMO

**Your test email:** `hieple5@gmail.com`

**Gmail login (have tab ready):**
- Keep Gmail open in separate tab
- Refresh before each demo
- Check spam folder if needed

---

## 🎯 DEMO 1: OTP REGISTRATION (2 min)

**URL:** `http://localhost:5173/register`

**Fill form:**
```
Username:   demo_user_001
Email:      hieple5@gmail.com
Password:   123456
Confirm:    123456
Full Name:  Nguyễn Văn Demo
Phone:      0901234567
```

**Steps:**
1. ✅ Fill form → Click "Đăng ký"
2. ✅ Wait 2-3 sec → Email arrives
3. ✅ Switch to Gmail tab
4. ✅ Copy OTP (6 digits)
5. ✅ Paste into verification form
6. ✅ Success → Redirects to login

**Say:** "Backend generate OTP, lưu DB, gửi email qua Gmail SMTP, expire sau 5 phút"

---

## 🎯 DEMO 2: BOOK ROUND-TRIP (2 min)

**URL:** `http://localhost:5173/`

**Search params:**
```
From:         Nha Trang
To:           Đà Nẵng
Date out:     29/11/2025
Date return:  30/11/2025
Type:         ✅ Khứ hồi
Passengers:   1
```

**Steps:**
1. ✅ Fill search form
2. ✅ Click "Tìm chuyến"
3. ✅ Select trip #377 (08:00) for outbound
4. ✅ Select trip #378 (10:00) for return
5. ✅ Click "Đặt vé"
6. ✅ Seat page: Click seat A02 (outbound)
7. ✅ Switch tab → Click seat A03 (return)
8. ✅ Select pickup/dropoff stations
9. ✅ Check summary: 180,000đ (already 10% off)
10. ✅ Click "Thanh toán"

**Say:** "Hệ thống tự tính giảm giá 10% cho vé khứ hồi, tạo 2 tickets link với booking_group_id"

---

## 🎯 DEMO 3: MOMO PAYMENT (2 min)

**URL:** Should be at `http://localhost:5173/payment`

**Steps:**
1. ✅ Select "MoMo"
2. ✅ Click "Thanh toán"
3. ✅ Redirected to MoMo sandbox
4. ✅ Amount shown: 180,000 VND
5. ✅ Transaction ID shown

**MoMo Test Credentials:**
```
Phone:  0987654321
OTP:    123456
```

6. ✅ Enter credentials
7. ✅ Confirm payment
8. ✅ Redirect back to `/payment/result`
9. ✅ See success message

**Say:** "MoMo API generate signature RSA, verify callback, update payment status, trigger email"

---

## 🎯 DEMO 4: EMAIL INVOICE (1 min)

**URL:** Switch to Gmail tab

**Steps:**
1. ✅ Refresh Gmail inbox
2. ✅ Find "Hóa đơn thanh toán - Bus Booking System"
3. ✅ Open email

**Point out:**
- ✅ Transaction ID (from MoMo)
- ✅ Payment method: "MoMo"
- ✅ Date/time of payment
- ✅ Customer info
- ✅ Trip details (outbound GREEN + return BLUE)
- ✅ Seat numbers, vehicle plates
- ✅ Pickup/dropoff points
- ✅ Price breakdown with discount
- ✅ Total: 180,000đ

**Say:** "Email tự động trigger sau payment confirm, dùng Thymeleaf template, responsive design"

---

## 🎯 DEMO 5: ADMIN MAP - STATIONS (2 min)

**URL:** `http://localhost:5173/admin/stations`

**Steps:**
1. ✅ Login admin (if not already)
2. ✅ Click "Thêm trạm mới"
3. ✅ Map opens full-screen
4. ✅ Type in search: "Bến xe Huế"
5. ✅ Map zooms to location
6. ✅ Click on exact position
7. ✅ Red marker appears
8. ✅ Form auto-fills:
   - Name: Bến xe Huế
   - Address: Full address
   - City: **Huế** (auto-detected)
   - Lat/Lng: Coordinates

9. ✅ (Optional) Click "Thêm mới" to save

**Say:** "OpenStreetMap + Nominatim geocoding API, click để chọn vị trí, reverse geocoding tự fill form"

---

## 🎯 DEMO 6: ADMIN MAP - ROUTES (2 min)

**URL:** `http://localhost:5173/admin/routes`

**Steps:**
1. ✅ Click "Thêm tuyến mới"
2. ✅ Select From: **Nha Trang**
3. ✅ Select To: **Đà Nẵng**
4. ✅ Map shows 2 markers
5. ✅ Click "Tính toán tự động"
6. ✅ Wait 2-3 sec for OSRM API
7. ✅ Results auto-fill:
   - Distance: **612 km**
   - Duration: **7.5 hours**
   - Base Price: **595,000 VND**

8. ✅ Blue route line drawn on map
9. ✅ (Optional) Adjust price manually
10. ✅ (Optional) Save route

**Say:** "OSRM API tính đường đi thực tế không phải đường chim bay, auto-generate giá dựa trên khoảng cách"

---

## 🆘 EMERGENCY BACKUP

### If Backend crashed:
1. Restart: `mvn spring-boot:run`
2. Wait 10-15 sec for startup
3. Check logs for errors
4. Continue from where you left off

### If Frontend crashed:
1. Refresh browser: F5
2. Clear localStorage: `localStorage.clear()` in console
3. Re-login if needed

### If Email not arriving:
1. Check spam folder
2. Show old test email as example
3. Explain: "Gmail có thể delay vài giây"

### If Map not loading:
1. Check internet connection
2. Refresh page
3. Show screenshot backup

### If Payment callback fails:
1. Explain: "Sandbox không callback localhost"
2. Go to `http://localhost:5173/admin/payments`
3. Manual confirm payment
4. Email still triggers correctly

---

## 🗣️ KEY PHRASES TO SAY

### For OTP:
> "Hệ thống generate mã OTP ngẫu nhiên 6 số, lưu vào database với thời gian expire 5 phút, gửi email qua Gmail SMTP sử dụng Thymeleaf template"

### For Payment:
> "Em tích hợp 2 cổng thanh toán là VNPay và MoMo. Mỗi gateway có cơ chế signature verification riêng: VNPay dùng HMAC-SHA512, MoMo dùng RSA. Transaction ID được track đầy đủ trong database."

### For Email:
> "Email hóa đơn được trigger tự động sau khi payment status chuyển sang completed. Backend sử dụng JavaMailSender với Thymeleaf template engine để render HTML email responsive có đầy đủ thông tin chuyến đi, giá vé, và chi tiết thanh toán."

### For Map:
> "Phần map em dùng OpenStreetMap làm base layer, Nominatim API cho geocoding search, và OSRM API cho route calculation. Khoảng cách được tính theo đường đi thực tế, không phải đường chim bay, để generate giá vé chính xác."

---

## 📱 TAB ORGANIZATION

**Before starting, arrange tabs:**

```
[1] Homepage (logged in)
[2] Gmail (logged in)
[3] Admin Dashboard (logged in)
[4] Backup: /admin/stations
[5] Backup: /admin/routes
[6] Backup: Code editor (show important file if asked)
```

**Desktop:** Clean, professional
**Browser:** Fullscreen mode (F11)
**Volume:** Muted (no notification sounds)

---

## ⏰ TIME MANAGEMENT

If running over time, **SKIP**:
- Map Routes demo (keep Stations only)
- Detailed code explanation (unless asked)
- Old test data demo

If running under time, **ADD**:
- Show database structure
- Quick code walkthrough
- More admin features

**Always reserve 2 min for Q&A!**

---

## 💡 CONFIDENCE BOOSTERS

✅ **You built this!** You know it better than anyone
✅ **It works!** (You tested it)
✅ **You prepared!** (This card proves it)
✅ **Breathe** → Speak slowly → Smile
✅ **If stuck:** "Đây là demo, production sẽ optimize hơn"

---

## 🎓 COMMON QUESTIONS - QUICK ANSWERS

**Q: Tại sao dùng email thay vì SMS?**
> A: Email free và dễ test. Production có thể tích hợp Twilio SMS.

**Q: Payment callback localhost không work?**
> A: Đúng, nên em implement admin confirm. Deploy production cần domain public.

**Q: Database có normalize không?**
> A: Có ạ, 3NF, có foreign keys đầy đủ, indexes cho performance.

**Q: Có handle concurrent booking không?**
> A: Có, seat locking 5 phút, transaction isolation, optimistic locking.

**Q: Map API có giới hạn?**
> A: Nominatim 1 req/sec. Em implement debounce và cache.

**Q: Có viết test không?**
> A: Có unit test cho payment logic và booking service (nếu có).

**Q: Deploy như thế nào?**
> A: Backend → Docker + AWS EC2, Frontend → Vercel/Netlify, DB → AWS RDS.

---

## 🎯 END GOAL

**Make teacher say:**
> "Wow, project này có nhiều tính năng nâng cao đấy! 
> OTP, payment gateway, email automation, map integration...
> Các em làm tốt lắm!"

**Your response:**
> "Em cảm ơn thầy/cô ạ! 🙏"

---

## 📞 LAST-MINUTE CONTACTS

**If stuck, message:**
- Teammate 1: [Phone]
- Teammate 2: [Phone]
- Teammate 3: [Phone]

**GitHub repo (if need to pull code):**
- [Link to repo]

---

# 🚀 YOU GOT THIS! GO ROCK THAT PRESENTATION! 🎉

