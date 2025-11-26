import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Header from "@/components/header";
import Footer from "@/components/footer";
import bookingService from "@/services/booking.service";
import tripSeatService from "@/services/tripSeat.service";
import paymentService from "@/services/payment.service"; // ✅ ADD: Import payment service
import type { TripSeat } from "@/types/tripSeat.types";

interface BookingData {
  // Common fields
  userId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalPrice: number;

  // One-way fields
  tripId?: number;
  trip?: any;
  selectedSeats?: string[];
  ticketIds?: number[];
  pickupLocation?: string;
  dropoffLocation?: string;

  // ⭐ Round trip fields
  tripType?: 'oneWay' | 'roundTrip';
  bookingGroupId?: string;
  outboundTrip?: any;
  returnTrip?: any;
  outboundTickets?: any[];
  returnTickets?: any[];
  selectedOutboundSeats?: string[];
  selectedReturnSeats?: string[];
  discountAmount?: number;
  finalPrice?: number;

  // ⭐ Round trip pickup/dropoff
  outboundPickupLocation?: string;
  outboundDropoffLocation?: string;
  returnPickupLocation?: string;
  returnDropoffLocation?: string;
}

type PaymentMethod = "momo" | "vnpay" | null;

function Payment() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState(1200); // 20 phút = 1200 giây
  const [seats, setSeats] = useState<TripSeat[]>([]); // THÊM STATE NÀY
  const [loading, setLoading] = useState(false);

  // ⭐ NEW: Pickup/Dropoff points
  const [pickupOptions, setPickupOptions] = useState<Array<{name: string, address: string}>>([]);
  const [dropoffOptions, setDropoffOptions] = useState<Array<{name: string, address: string}>>([]);

  useEffect(() => {
    // Lấy dữ liệu booking từ sessionStorage
    const storedData = sessionStorage.getItem("bookingData");
    if (!storedData) {
      toast.error("Không tìm thấy thông tin đặt vé");
      navigate("/product");
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setBookingData(data);

      // ⭐ Parse pickup/dropoff points from route
      if (data.trip?.route) {
        const route = data.trip.route;

        // Parse pickupPoints
        if (route.pickupPoints && Array.isArray(route.pickupPoints)) {
          setPickupOptions(route.pickupPoints);
        } else if (typeof route.pickupPoints === 'string') {
          try {
            const parsed = JSON.parse(route.pickupPoints);
            setPickupOptions(Array.isArray(parsed) ? parsed : []);
          } catch {
            setPickupOptions([]);
          }
        }

        // Parse dropoffPoints
        if (route.dropoffPoints && Array.isArray(route.dropoffPoints)) {
          setDropoffOptions(route.dropoffPoints);
        } else if (typeof route.dropoffPoints === 'string') {
          try {
            const parsed = JSON.parse(route.dropoffPoints);
            setDropoffOptions(Array.isArray(parsed) ? parsed : []);
          } catch {
            setDropoffOptions([]);
          }
        }
      }

      // Load danh sách ghế của chuyến xe
      fetchSeats(data.tripId);
    } catch (error) {
      console.error("Error parsing booking data:", error);
      toast.error("Dữ liệu không hợp lệ");
      navigate("/product");
    }
  }, [navigate]);

  const fetchSeats = async (tripId: number) => {
    try {
      const response = await tripSeatService.getSeatsByTrip(tripId);
      if (response.success && response.data) {
        setSeats(response.data);
      }
    } catch (error) {
      console.error("Error fetching seats:", error);
      toast.error("Không thể tải thông tin ghế");
    }
  };

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      toast.error("Hết thời gian giữ ghế. Vui lòng đặt lại.");
      navigate("/product");
    }
  }, [countdown, navigate]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateDiscount = () => {
    // Giảm 2% khi thanh toán online
    if (!bookingData) return 0;

    if (bookingData.tripType === 'roundTrip') {
      // Round trip: Already has 10% discount, add 2% online discount on final price
      const priceAfterRoundTripDiscount = bookingData.finalPrice || bookingData.totalPrice;
      return Math.round(priceAfterRoundTripDiscount * 0.02);
    }

    // One-way: 2% online discount
    return Math.round(bookingData.totalPrice * 0.02);
  };

  const calculateFinalTotal = () => {
    if (!bookingData) return 0;

    if (bookingData.tripType === 'roundTrip') {
      // Round trip: finalPrice (after 10%) - 2% online
      const priceAfterRoundTripDiscount = bookingData.finalPrice || bookingData.totalPrice;
      return priceAfterRoundTripDiscount - calculateDiscount();
    }

    // One-way: totalPrice - 2%
    return bookingData.totalPrice - calculateDiscount();
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    // ✅ REMOVE: Fake QR code generation - will redirect to real payment gateway instead
    setShowQR(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!bookingData) {
      toast.error("Dữ liệu không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      if (selectedPayment === "vnpay") {
        // ✅ VNPay: Redirect to VNPay payment gateway
        const finalAmount = calculateFinalTotal();

        // Generate booking group ID if not exists
        const bookingGroupId = bookingData.bookingGroupId || `BOOKING_${Date.now()}_${bookingData.userId}`;

        // Calculate ticket count
        const ticketCount = bookingData.tripType === 'roundTrip'
          ? (bookingData.outboundTickets?.length || 0) + (bookingData.returnTickets?.length || 0)
          : bookingData.selectedSeats?.length || 1;

        const orderInfo = `Dat ve ${bookingData.trip?.route?.fromLocation || ''}-${bookingData.trip?.route?.toLocation || ''} ${ticketCount} ve`;

        console.log("Creating VNPay payment with data:", {
          bookingGroupId,
          ticketCount,
          amount: finalAmount,
          orderInfo: orderInfo,
        });

        const response = await paymentService.createVNPayPayment({
          bookingGroupId,
          ticketCount,
          amount: finalAmount,
          orderInfo: orderInfo,
        });

        console.log("VNPay response:", response);

        if (response && response.status === "success" && response.paymentUrl) {
          // Save booking data for later (after payment callback)
          console.log("💾 Saving booking data to pendingBookingData:", bookingData);
          console.log("💾 userId:", bookingData?.userId, "tripId:", bookingData?.tripId);
          console.log("💾 ticketIds:", bookingData?.ticketIds);
          sessionStorage.setItem("pendingBookingData", JSON.stringify(bookingData));

          toast.info("Đang chuyển đến VNPay...");
          // Redirect to VNPay
          window.location.href = response.paymentUrl;
        } else {
          throw new Error(response?.message || "Không thể tạo thanh toán VNPay");
        }
      } else if (selectedPayment === "momo") {
        // ✅ MoMo: Redirect to MoMo payment gateway
        const finalAmount = calculateFinalTotal();

        // Generate booking group ID if not exists
        const bookingGroupId = bookingData.bookingGroupId || `BOOKING_${Date.now()}_${bookingData.userId}`;

        // Calculate ticket count
        const ticketCount = bookingData.tripType === 'roundTrip'
          ? (bookingData.outboundTickets?.length || 0) + (bookingData.returnTickets?.length || 0)
          : bookingData.selectedSeats?.length || 1;

        const orderInfo = `Dat ve ${bookingData.trip?.route?.fromLocation || ''}-${bookingData.trip?.route?.toLocation || ''} ${ticketCount} ve`;

        console.log("Creating MoMo payment with data:", {
          bookingGroupId,
          ticketCount,
          amount: finalAmount,
          orderInfo: orderInfo,
        });

        const response = await paymentService.createMoMoPayment({
          bookingGroupId,
          ticketCount,
          amount: finalAmount,
          orderInfo: orderInfo,
        });

        console.log("MoMo response:", response);

        if (response && response.status === "success" && response.paymentUrl) {
          // Save booking data for later
          console.log("💾 Saving booking data to pendingBookingData (MoMo):", bookingData);
          console.log("💾 ticketIds:", bookingData?.ticketIds);
          sessionStorage.setItem("pendingBookingData", JSON.stringify(bookingData));

          toast.info("Đang chuyển đến MoMo...");
          // Redirect to MoMo
          window.location.href = response.paymentUrl;
        } else {
          throw new Error(response?.message || "Không thể tạo thanh toán MoMo");
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Không thể tạo thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("bookingData");
    navigate("/product");
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Chọn phương thức thanh toán</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phương thức thanh toán - Bên trái */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chọn phương thức */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  Chọn phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* MoMo */}
                  <div
                    onClick={() => handlePaymentSelect("momo")}
                    className={`
                      flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedPayment === "momo"
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      checked={selectedPayment === "momo"}
                      onChange={() => handlePaymentSelect("momo")}
                      className="w-5 h-5"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <div>
                        <p className="font-semibold">MoMo</p>
                        <p className="text-sm text-gray-500">Ví điện tử MoMo</p>
                      </div>
                    </div>
                  </div>

                  {/* VNPay */}
                  <div
                    onClick={() => handlePaymentSelect("vnpay")}
                    className={`
                      flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedPayment === "vnpay"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      checked={selectedPayment === "vnpay"}
                      onChange={() => handlePaymentSelect("vnpay")}
                      className="w-5 h-5"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        VN
                      </div>
                      <div>
                        <p className="font-semibold">VNPay</p>
                        <p className="text-sm text-gray-500">
                          Cổng thanh toán VNPay
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            {showQR && selectedPayment && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-center">
                    {selectedPayment === "momo"
                      ? "Thanh toán qua MoMo"
                      : "Thanh toán qua VNPay"}
                  </h2>

                  <div className="flex flex-col items-center">
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold text-red-600 mb-2">
                        {formatPrice(calculateFinalTotal())}đ
                      </p>
                      <p className="text-sm text-gray-600">
                        Thời gian giữ chỗ còn lại:{" "}
                        <span className="font-bold text-red-600">
                          {formatCountdown(countdown)}
                        </span>
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                      <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                    </div>

                    <div className="text-center space-y-2 text-sm text-gray-600">
                      <p className="font-semibold">
                        Hướng dẫn thanh toán bằng{" "}
                        {selectedPayment === "momo" ? "MoMo" : "VNPay"}
                      </p>
                      <ol className="text-left space-y-1 list-decimal list-inside">
                        <li>
                          Mở ứng dụng{" "}
                          {selectedPayment === "momo" ? "MoMo" : "VNPay"} trên
                          điện thoại
                        </li>
                        <li>Dùng biểu tượng 📷 để quét mã QR</li>
                        <li>Quét mã ở trang này và thanh toán</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Thông tin đón trả */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  Thông tin đón trả
                  <span className="text-orange-600">ⓘ</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Điểm đón */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">
                      ĐIỂM ĐÓN
                    </Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pickup"
                          defaultChecked
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Bến xe/VP</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="pickup" className="w-4 h-4" />
                        <span className="text-sm">Trung chuyển</span>
                      </label>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      {pickupOptions.length > 0 ? (
                        <select className="w-full bg-white border rounded px-3 py-2">
                          {pickupOptions.map((point, index) => (
                            <option key={index} value={point.name}>
                              {point.name} - {point.address}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select className="w-full bg-white border rounded px-3 py-2">
                          <option>BX {bookingData.trip.route.fromLocation}</option>
                        </select>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        Quý khách vui lòng có mặt tại Bến xe/Văn Phòng{" "}
                        <span className="font-semibold text-red-600">
                          Trước {formatTime(bookingData.trip.departureTime)}{" "}
                          {formatDate(bookingData.trip.departureTime)}
                        </span>{" "}
                        để được trung chuyển hoặc kiểm tra thông tin trước khi
                        lên xe.
                      </p>
                    </div>
                  </div>

                  {/* Điểm trả */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">
                      ĐIỂM TRẢ
                    </Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="dropoff"
                          defaultChecked
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Bến xe/VP</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="dropoff"
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Trung chuyển</span>
                      </label>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      {dropoffOptions.length > 0 ? (
                        <select className="w-full bg-white border rounded px-3 py-2">
                          {dropoffOptions.map((point, index) => (
                            <option key={index} value={point.name}>
                              {point.name} - {point.address}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select className="w-full bg-white border rounded px-3 py-2">
                          <option>BX {bookingData.trip.route.toLocation}</option>
                        </select>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Chúng tôi không đón/trung chuyển tại những điểm xe trung chuyển không thể tới được
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 py-6 text-lg"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={!selectedPayment || loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Thanh toán"}
              </Button>
            </div>
          </div>

          {/* Thông tin hành khách - Bên phải */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Thông tin hành khách</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Họ và tên</span>
                    <span className="font-semibold">
                      {bookingData.customerName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại</span>
                    <span className="font-semibold">
                      {bookingData.customerPhone}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold text-xs break-all">
                      {bookingData.customerEmail}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* ⭐ ROUND TRIP: Show both trips */}
                {bookingData.tripType === 'roundTrip' ? (
                  <>
                    {/* Outbound Trip */}
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                        <span>🚌</span>
                        <span>CHUYẾN ĐI</span>
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tuyến xe</span>
                          <span className="font-semibold text-right">
                            {bookingData.outboundTrip?.route.fromLocation} → {bookingData.outboundTrip?.route.toLocation}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian</span>
                          <span className="font-semibold">
                            {formatTime(bookingData.outboundTrip?.departureTime)} {formatDate(bookingData.outboundTrip?.departureTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số ghế</span>
                          <span className="font-semibold text-blue-600">
                            {bookingData.selectedOutboundSeats?.join(", ")}
                          </span>
                        </div>
                        {bookingData.outboundPickupLocation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Điểm đón</span>
                            <span className="font-semibold text-right">
                              {bookingData.outboundPickupLocation}
                            </span>
                          </div>
                        )}
                        {bookingData.outboundDropoffLocation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Điểm trả</span>
                            <span className="font-semibold text-right">
                              {bookingData.outboundDropoffLocation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Return Trip */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <span>🔄</span>
                        <span>CHUYẾN VỀ</span>
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tuyến xe</span>
                          <span className="font-semibold text-right">
                            {bookingData.returnTrip?.route.fromLocation} → {bookingData.returnTrip?.route.toLocation}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian</span>
                          <span className="font-semibold">
                            {formatTime(bookingData.returnTrip?.departureTime)} {formatDate(bookingData.returnTrip?.departureTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số ghế</span>
                          <span className="font-semibold text-blue-600">
                            {bookingData.selectedReturnSeats?.join(", ")}
                          </span>
                        </div>
                        {bookingData.returnPickupLocation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Điểm đón</span>
                            <span className="font-semibold text-right">
                              {bookingData.returnPickupLocation}
                            </span>
                          </div>
                        )}
                        {bookingData.returnDropoffLocation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Điểm trả</span>
                            <span className="font-semibold text-right">
                              {bookingData.returnDropoffLocation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* ONE-WAY: Original display */
                  <>
                    <h2 className="text-xl font-bold mb-4">Thông tin lượt đi</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tuyến xe</span>
                        <span className="font-semibold text-right">
                          {bookingData.trip?.route.fromLocation} - {bookingData.trip?.route.toLocation}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian xuất bến</span>
                        <span className="font-semibold">
                          {formatTime(bookingData.trip?.departureTime)} {formatDate(bookingData.trip?.departureTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số ghế</span>
                        <span className="font-semibold text-blue-600">
                          {bookingData.selectedSeats?.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền lượt đi</span>
                        <span className="font-bold text-orange-600">
                          {formatPrice(bookingData.totalPrice)}đ
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <h3 className="font-bold flex items-center gap-2">
                    Chi tiết giá
                    <span className="text-orange-600">ⓘ</span>
                  </h3>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {bookingData.tripType === 'roundTrip' ? 'Tạm tính (2 vé)' : 'Giá vé lượt đi'}
                    </span>
                    <span className="font-semibold text-orange-600">
                      {formatPrice(bookingData.totalPrice)}đ
                    </span>
                  </div>

                  {/* ⭐ Round trip discount */}
                  {bookingData.tripType === 'roundTrip' && bookingData.discountAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">🎉 Giảm giá khứ hồi (10%)</span>
                      <span className="font-semibold text-green-600">
                        -{formatPrice(bookingData.discountAmount)}đ
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí thanh toán</span>
                    <span className="font-semibold">0đ</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Ưu đãi thanh toán Online</span>
                    <span className="font-semibold text-green-600">
                      (2%) -{formatPrice(calculateDiscount())}đ
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-base">
                    <span className="font-bold">Tổng tiền</span>
                    <span className="font-bold text-orange-600 text-xl">
                      {formatPrice(calculateFinalTotal())}đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Payment;
