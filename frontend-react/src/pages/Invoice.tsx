import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ticketService from "@/services/ticket.service";
import type { Ticket } from "@/types/ticket.types";
import {
  CheckCircle2,
  Download,
  Printer,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Bus,
  Ticket as TicketIcon,
  CreditCard,
} from "lucide-react";

function Invoice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // States for both single and group mode
  const [mode, setMode] = useState<'single' | 'group'>('single');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookingGroupId, setBookingGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const ticketId = searchParams.get("ticketId");
  const groupId = searchParams.get("bookingGroupId");

  useEffect(() => {
    if (groupId) {
      // Load booking group
      fetchTicketsByGroup(groupId);
    } else if (ticketId) {
      // Load single ticket, check if part of group
      fetchTicket(Number(ticketId));
    } else {
      toast.error("Không tìm thấy thông tin vé");
      navigate("/");
    }
  }, [ticketId, groupId, navigate]);

  const fetchTicket = async (id: number) => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(id);
      if (response.success && response.data) {
        const ticketData = response.data;

        // Check if ticket is part of booking group
        if (ticketData.bookingGroupId) {
          console.log("✅ Ticket is part of group:", ticketData.bookingGroupId);
          setBookingGroupId(ticketData.bookingGroupId);
          // Fetch all tickets in group
          await fetchTicketsByGroup(ticketData.bookingGroupId);
        } else {
          // Single ticket
          setTicket(ticketData);
          setMode('single');
        }
      } else {
        toast.error("Không tìm thấy thông tin vé");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Không thể tải thông tin vé");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsByGroup = async (groupId: string) => {
    try {
      setLoading(true);
      console.log("📦 Fetching tickets for group:", groupId);
      const response = await ticketService.getTicketsByBookingGroup(groupId);

      if (response.success && response.data && response.data.length > 0) {
        setTickets(response.data);
        setBookingGroupId(groupId);
        setMode('group');
        console.log("✅ Loaded", response.data.length, "tickets in group");
      } else {
        toast.error("Không tìm thấy vé trong nhóm đặt này");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching booking group:", error);
      toast.error("Không thể tải thông tin nhóm đặt vé");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.info("Tính năng tải PDF đang được phát triển");
    // TODO: Implement PDF download
  };

  // ⭐ Helper functions for round trip
  const separateTickets = (allTickets: Ticket[]) => {
    const outbound = allTickets.filter(t => !t.isReturnTrip);
    const returnTickets = allTickets.filter(t => t.isReturnTrip);
    return { outbound, returnTickets };
  };

  const calculateRoundTripTotal = (allTickets: Ticket[]) => {
    const subtotal = allTickets.reduce((sum, t) => sum + t.price, 0);
    const discount = Math.round(subtotal * 0.1); // 10% round trip discount
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin vé...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Check if we have valid data (single or group)
  const hasData = mode === 'group' ? tickets.length > 0 : ticket !== null;

  if (!hasData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Không tìm thấy thông tin vé</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ⭐ Prepare data for round trip display
  const isRoundTrip = mode === 'group' && tickets.length > 0 && tickets[0].tripType === 'round_trip';
  const { outbound, returnTickets } = isRoundTrip ? separateTickets(tickets) : { outbound: [], returnTickets: [] };
  const roundTripTotals = isRoundTrip ? calculateRoundTripTotal(tickets) : { subtotal: 0, discount: 0, total: 0 };

  const discount = ticket.promotion
    ? ticket.promotion.discountPercentage
      ? (ticket.price * ticket.promotion.discountPercentage) / 100
      : ticket.promotion.discountAmount || 0
    : 0;

  const onlineDiscount = ticket.bookingMethod === "online" ? ticket.price * 0.02 : 0;
  const totalDiscount = discount + onlineDiscount;
  const finalPrice = ticket.price - totalDiscount;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Actions - Hide when printing */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Tải PDF
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                In hóa đơn
              </Button>
            </div>
          </div>

          {/* Invoice Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                {mode === 'group' && isRoundTrip ? "Hóa đơn vé khứ hồi" : "Hóa đơn điện tử"}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
              </p>
              {isRoundTrip && (
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  🎉 Đã áp dụng giảm giá 10% vé khứ hồi
                </div>
              )}
            </CardHeader>

            <CardContent className="p-8">
              {isRoundTrip ? (
                // ⭐ ROUND TRIP INVOICE
                <>
                  {/* Booking Group Info */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Mã đặt vé</p>
                        <p className="text-xl font-bold text-gray-800">{bookingGroupId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Số vé</p>
                        <p className="font-semibold text-gray-800">{tickets.length} vé</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="mr-2 h-5 w-5 text-blue-600" />
                      Thông tin khách hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <User className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Họ và tên</p>
                          <p className="font-medium text-gray-800">{tickets[0].customerName || tickets[0].user?.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Số điện thoại</p>
                          <p className="font-medium text-gray-800">{tickets[0].customerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-800">{tickets[0].customerEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Outbound Trip */}
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                      <Bus className="h-6 w-6" />
                      🚌 CHUYẾN ĐI
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Tuyến đường</p>
                          <p className="font-bold text-lg text-gray-800">
                            {outbound[0]?.trip.route.fromLocation} → {outbound[0]?.trip.route.toLocation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Khởi hành</p>
                          <p className="font-semibold text-gray-800">
                            {formatTime(outbound[0]?.trip.departureTime)} | {formatDate(outbound[0]?.trip.departureTime)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg space-y-2">
                        <p className="font-semibold text-gray-700">Danh sách vé:</p>
                        {outbound.map((ticket, idx) => (
                          <div key={ticket.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <TicketIcon className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium">Vé #{ticket.id} - Ghế {ticket.seat?.seatNumber}</p>
                                {ticket.pickupPoint && (
                                  <p className="text-xs text-gray-500">Đón: {ticket.pickupPoint} | Trả: {ticket.dropoffPoint}</p>
                                )}
                              </div>
                            </div>
                            <p className="font-semibold text-gray-800">{formatPrice(ticket.price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Return Trip - Only show if returnTickets exist */}
                  {returnTickets.length > 0 && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                      <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Bus className="h-6 w-6" />
                        🔄 CHUYẾN VỀ
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Tuyến đường</p>
                            <p className="font-bold text-lg text-gray-800">
                              {returnTickets[0]?.trip.route.fromLocation} → {returnTickets[0]?.trip.route.toLocation}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Khởi hành</p>
                            <p className="font-semibold text-gray-800">
                              {formatTime(returnTickets[0]?.trip.departureTime)} | {formatDate(returnTickets[0]?.trip.departureTime)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg space-y-2">
                          <p className="font-semibold text-gray-700">Danh sách vé:</p>
                          {returnTickets.map((ticket, idx) => (
                            <div key={ticket.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex items-center gap-3">
                                <TicketIcon className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">Vé #{ticket.id} - Ghế {ticket.seat?.seatNumber}</p>
                                  {ticket.pickupPoint && (
                                    <p className="text-xs text-gray-500">Đón: {ticket.pickupPoint} | Trả: {ticket.dropoffPoint}</p>
                                  )}
                                </div>
                              </div>
                              <p className="font-semibold text-gray-800">{formatPrice(ticket.price)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Round Trip Payment Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                      Chi tiết thanh toán
                    </h3>
                    <div className="space-y-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-orange-200">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700">Tạm tính ({tickets.length} vé):</span>
                        <span className="font-semibold text-gray-800">{formatPrice(roundTripTotals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>🎉 Giảm giá khứ hồi (10%):</span>
                        <span>-{formatPrice(roundTripTotals.discount)}</span>
                      </div>
                      <Separator className="bg-orange-300" />
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-gray-800">TỔNG CỘNG:</span>
                        <span className="text-blue-600">{formatPrice(roundTripTotals.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-4">
                        <span className="text-gray-600">Phương thức thanh toán</span>
                        <span className="font-medium text-gray-800 capitalize">
                          {tickets[0].bookingMethod === "online" ? "Thanh toán online" : "Thanh toán tại quầy"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trạng thái</span>
                        <span className="font-medium text-green-600">Đã xác nhận</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // ⭐ ONE-WAY INVOICE (Original)
                <>
                  {/* Ticket Info */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Mã vé</p>
                        <p className="text-xl font-bold text-gray-800">#{ticket!.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Ngày đặt</p>
                        <p className="font-semibold text-gray-800">
                          {formatDateTime(ticket!.bookedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <User className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-medium text-gray-800">{ticket.user.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">{ticket.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Trip Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Bus className="mr-2 h-5 w-5 text-blue-600" />
                  Thông tin chuyến đi
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="mr-3 h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Tuyến đường</p>
                      <p className="font-medium text-gray-800 text-lg">
                        {ticket.trip.route.fromLocation} → {ticket.trip.route.toLocation}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Ngày khởi hành</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(ticket.trip.departureTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Giờ khởi hành</p>
                        <p className="font-medium text-gray-800">
                          {formatTime(ticket.trip.departureTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <TicketIcon className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Số ghế</p>
                        <p className="font-medium text-gray-800 text-lg">
                          {ticket.seat.seatNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Bus className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Biển số xe</p>
                        <p className="font-medium text-gray-800">
                          {ticket.trip.vehicle.licensePlate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Payment Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                  Chi tiết thanh toán
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá vé gốc</span>
                    <span className="font-medium text-gray-800">
                      {formatPrice(ticket.price)}
                    </span>
                  </div>

                  {ticket.promotion && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Khuyến mãi ({ticket.promotion.code})
                      </span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  {ticket.bookingMethod === "online" && (
                    <div className="flex justify-between text-green-600">
                      <span>Ưu đãi thanh toán online (2%)</span>
                      <span className="font-medium">-{formatPrice(onlineDiscount)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Tổng tiền</span>
                    <span className="text-blue-600">{formatPrice(finalPrice)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phương thức thanh toán</span>
                    <span className="font-medium text-gray-800 capitalize">
                      {ticket.bookingMethod === "online" ? "Thanh toán online" : "Thanh toán tại quầy"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trạng thái</span>
                    <span
                      className={`font-medium capitalize ${
                        ticket.status === "confirmed"
                          ? "text-green-600"
                          : ticket.status === "cancelled"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {ticket.status === "confirmed"
                        ? "Đã xác nhận"
                        : ticket.status === "cancelled"
                        ? "Đã hủy"
                        : "Đã đặt"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Lưu ý:</strong> Vui lòng mang theo giấy tờ tùy thân và xuất trình mã vé này
                  khi lên xe. Quý khách vui lòng có mặt tại bến trước giờ khởi hành ít nhất 15 phút.
                </p>
              </div>

              {/* Company Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Bus Booking System</p>
                <p>Hotline: 1900-xxxx | Email: support@busbooking.com</p>
              </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          header, footer, .print\\:hidden {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default Invoice;
