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
import type { TripSeat } from "@/types/tripSeat.types";

interface BookingData {
  userId: number; // THÊM userId
  tripId: number;
  trip: any;
  selectedSeats: string[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalPrice: number;
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
    return Math.round(bookingData.totalPrice * 0.02);
  };

  const calculateFinalTotal = () => {
    if (!bookingData) return 0;
    return bookingData.totalPrice - calculateDiscount();
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);

    // Generate QR code (giả lập)
    if (method === "momo") {
      setQrCode(
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOMO_PAYMENT_" +
          Date.now()
      );
    } else if (method === "vnpay") {
      setQrCode(
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VNPAY_PAYMENT_" +
          Date.now()
      );
    }
    setShowQR(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!bookingData || seats.length === 0) {
      toast.error("Dữ liệu không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      // Tạo ticket cho từng ghế đã chọn
      const bookingPromises = bookingData.selectedSeats.map((seatNumber) => {
        const seat = seats.find((s) => s.seatNumber === seatNumber);

        if (!seat) {
          throw new Error(`Không tìm thấy ghế ${seatNumber}`);
        }

        return bookingService.createBooking({
          userId: bookingData.userId,
          tripId: bookingData.tripId,
          seatId: seat.id,
          price: Number(bookingData.trip.route.basePrice),
          bookingMethod:
            selectedPayment === "momo" || selectedPayment === "vnpay"
              ? "online"
              : "offline",
          status: "confirmed",
        });
      });

      await Promise.all(bookingPromises);

      toast.success("Thanh toán thành công!");
      sessionStorage.removeItem("bookingData");
      navigate("/invoice");
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Thanh toán thất bại. Vui lòng thử lại.");
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
                      <select className="w-full bg-white border rounded px-2 py-1">
                        <option>
                          BX {bookingData.trip.route.fromLocation}
                        </option>
                      </select>
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
                      <select className="w-full bg-white border rounded px-2 py-1">
                        <option>BX {bookingData.trip.route.toLocation}</option>
                      </select>
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

                <h2 className="text-xl font-bold mb-4">Thông tin lượt đi</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuyến xe</span>
                    <span className="font-semibold text-right">
                      {bookingData.trip.route.fromLocation} -{" "}
                      {bookingData.trip.route.toLocation}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian xuất bến</span>
                    <span className="font-semibold">
                      {formatTime(bookingData.trip.departureTime)}{" "}
                      {formatDate(bookingData.trip.departureTime)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng ghế</span>
                    <span className="font-semibold">
                      {bookingData.selectedSeats.length} Ghế
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Số ghế</span>
                    <span className="font-semibold text-blue-600">
                      {bookingData.selectedSeats.join(", ")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm lên xe</span>
                    <span className="font-semibold">
                      BX {bookingData.trip.route.fromLocation}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Thời gian tới điểm lên xe
                    </span>
                    <span className="font-semibold text-red-600">
                      Trước {formatTime(bookingData.trip.departureTime)}{" "}
                      {formatDate(bookingData.trip.departureTime)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm trả khách</span>
                    <span className="font-semibold">BV Y Dược</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền lượt đi</span>
                    <span className="font-bold text-orange-600">
                      {formatPrice(bookingData.totalPrice)}đ
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <h3 className="font-bold flex items-center gap-2">
                    Chi tiết giá
                    <span className="text-orange-600">ⓘ</span>
                  </h3>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá vé lượt đi</span>
                    <span className="font-semibold text-orange-600">
                      {formatPrice(bookingData.totalPrice)}đ
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí thanh toán</span>
                    <span className="font-semibold">0đ</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Ưu đãi thanh toán Online
                    </span>
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
