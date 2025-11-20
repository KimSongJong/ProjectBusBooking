import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/contexts/AuthContext";
import tripService from "@/services/trip.service";
import tripSeatService from "@/services/tripSeat.service";
import type { Trip } from "@/types/trip.types";
import type { TripSeat } from "@/types/tripSeat.types";

function BookingSeat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get("tripId");

  const [trip, setTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<TripSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Thông tin khách hàng
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Bến xe/VP");
  const [dropoffLocation, setDropoffLocation] = useState("Bến xe/VP");

  useEffect(() => {
    if (!tripId) {
      toast.error("Không tìm thấy thông tin chuyến xe");
      navigate("/product");
      return;
    }
    fetchTripAndSeats();
  }, [tripId]);

  const fetchTripAndSeats = async () => {
    try {
      setLoading(true);

      // Lấy thông tin trip
      const tripResponse = await tripService.getTripById(Number(tripId));
      if (tripResponse.success && tripResponse.data) {
        setTrip(tripResponse.data);
      }

      // Lấy danh sách ghế
      const seatsResponse = await tripSeatService.getSeatsByTrip(
        Number(tripId)
      );
      if (seatsResponse.success && seatsResponse.data) {
        setSeats(seatsResponse.data);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Không thể tải thông tin chuyến xe");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: TripSeat) => {
    if (seat.status !== "available") {
      toast.error("Ghế này đã được đặt hoặc đang được giữ chỗ");
      return;
    }

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  const getSeatStatus = (seat: TripSeat) => {
    if (selectedSeats.includes(seat.seatNumber)) return "selected";
    return seat.status;
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-gray-200 hover:bg-blue-100 cursor-pointer";
      case "selected":
        return "bg-orange-500 text-white cursor-pointer";
      case "booked":
        return "bg-gray-400 text-gray-600 cursor-not-allowed";
      case "locked":
        return "bg-yellow-200 text-gray-600 cursor-not-allowed";
      default:
        return "bg-gray-200";
    }
  };

  const calculateTotal = () => {
    if (!trip) return 0;
    return selectedSeats.length * Number(trip.route.basePrice);
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

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế");
      return;
    }

    if (!customerName || !customerPhone || !customerEmail) {
      toast.error("Vui lòng điền đầy đủ thông tin khách hàng");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      toast.error("Số điện thoại phải có 10 chữ số");
      return;
    }

    // Chuyển sang trang thanh toán với thông tin booking
    const bookingData = {
      tripId: Number(tripId),
      trip: trip,
      selectedSeats: selectedSeats,
      customerName,
      customerPhone,
      customerEmail,
      pickupLocation,
      dropoffLocation,
      totalPrice: calculateTotal(),
    };

    // Lưu vào sessionStorage để truyền sang trang payment
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    navigate("/payment");
  };

  // Tách ghế thành tầng dưới và tầng trên
  const lowerSeats = seats.filter((seat) => seat.seatNumber.startsWith("A"));
  const upperSeats = seats.filter((seat) => seat.seatNumber.startsWith("B"));

  if (loading) {
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy thông tin chuyến xe</p>
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
          <h1 className="text-2xl font-bold">Chọn ghế</h1>
          <p className="text-sm mt-1 opacity-90">
            <a href="/product" className="hover:underline">
              Thông tin xe
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sơ đồ ghế - Bên trái */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Chọn ghế</h2>

                {/* Chú thích */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-400 rounded"></div>
                    <span>Đã bán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded border border-gray-300"></div>
                    <span>Còn trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded"></div>
                    <span>Đang chọn</span>
                  </div>
                </div>

                {/* Tầng dưới */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-3">Tầng dưới</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {lowerSeats.map((seat) => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status !== "available"}
                        className={`
                          h-12 rounded-lg font-semibold text-sm transition-all
                          ${getSeatColor(getSeatStatus(seat))}
                          ${
                            seat.status === "available" ? "hover:scale-105" : ""
                          }
                        `}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tầng trên */}
                <div>
                  <h3 className="font-semibold mb-3">Tầng trên</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {upperSeats.map((seat) => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status !== "available"}
                        className={`
                          h-12 rounded-lg font-semibold text-sm transition-all
                          ${getSeatColor(getSeatStatus(seat))}
                          ${
                            seat.status === "available" ? "hover:scale-105" : ""
                          }
                        `}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thông tin khách hàng */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Thông tin khách hàng</h2>
                  <p className="text-sm text-red-600 font-semibold">
                    ĐIỀU KHOẢN & LƯU Ý
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      maxLength={10}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Nhập email"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Điều khoản */}
                <div className="mt-6 p-4 bg-red-50 rounded-lg text-sm text-gray-700">
                  <p className="font-semibold text-red-600 mb-2">
                    Quý khách vui lòng Đăng ký/Đăng nhập tài khoản để nhận
                    chương trình khuyến mãi.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      Quý khách vui lòng có mặt tại bến xuất phát trước ít nhất
                      30 phút để hoàn tất thủ tục.
                    </li>
                    <li>
                      Liên hệ tổng đài{" "}
                      <span className="text-red-600 font-semibold">
                        1900 6067
                      </span>{" "}
                      để được hỗ trợ.
                    </li>
                    <li>Không mang hành lý quá quy định tại bến xe.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Thông tin lượt đi - Bên phải */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Thông tin lượt đi</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuyến xe</span>
                    <span className="font-semibold text-right">
                      {trip.route.fromLocation} - {trip.route.toLocation}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian xuất bến</span>
                    <span className="font-semibold">
                      {formatTime(trip.departureTime)}{" "}
                      {formatDate(trip.departureTime)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng ghế</span>
                    <span className="font-semibold">
                      {selectedSeats.length} Ghế
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Số ghế</span>
                    <span className="font-semibold text-blue-600">
                      {selectedSeats.length > 0
                        ? selectedSeats.join(", ")
                        : "---"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm trả khách</span>
                    <span className="font-semibold">---</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền lượt đi</span>
                    <span className="font-bold text-orange-600 text-lg">
                      {formatPrice(calculateTotal())}đ
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
                      {formatPrice(calculateTotal())}đ
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí thanh toán</span>
                    <span className="font-semibold">0đ</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-base">
                    <span className="font-bold">Tổng tiền</span>
                    <span className="font-bold text-orange-600 text-xl">
                      {formatPrice(calculateTotal())}đ
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={
                    selectedSeats.length === 0 ||
                    !customerName ||
                    !customerPhone ||
                    !customerEmail
                  }
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                >
                  Thanh toán
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookingSeat;
