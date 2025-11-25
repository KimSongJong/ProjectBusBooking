import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ticketService from "@/services/ticket.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Ticket } from "@/types/ticket.types";
import {
  Search,
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  ArrowRight,
  Filter,
  Loader2,
  Receipt,
  Info,
  X,
} from "lucide-react";

function SearchTicket() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ⭐ NEW: Dialog state
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để xem vé của bạn");
      navigate("/login");
      return;
    }

    fetchUserTickets();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Filter tickets based on search and status
    let filtered = [...tickets]; // Create a copy to avoid mutation

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.id.toString().includes(searchTerm) ||
          ticket.trip.route.fromLocation
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.trip.route.toLocation
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.tripSeat?.seatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.seat?.seatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort filtered tickets
    filtered.sort((a, b) => {
      const dateA = new Date(a.bookedAt).getTime();
      const dateB = new Date(b.bookedAt).getTime();

      if (dateB !== dateA) {
        return dateB - dateA;
      }

      return b.id - a.id;
    });

    // ⭐ Group filtered tickets into bookings
    const groupedFiltered = filtered.reduce((groups: any[], ticket) => {
      const existingGroup = groups.find(group => {
        if (group.tickets[0].trip.id !== ticket.trip.id) return false;

        const time1 = new Date(group.tickets[0].bookedAt).getTime();
        const time2 = new Date(ticket.bookedAt).getTime();
        return Math.abs(time1 - time2) < 60000;
      });

      if (existingGroup) {
        existingGroup.tickets.push(ticket);
        existingGroup.seats.push(ticket.tripSeat?.seatNumber || ticket.seat?.seatNumber);
      } else {
        groups.push({
          bookingId: `BOOKING_${ticket.trip.id}_${new Date(ticket.bookedAt).getTime()}`,
          tickets: [ticket],
          seats: [ticket.tripSeat?.seatNumber || ticket.seat?.seatNumber],
          mainTicket: ticket
        });
      }

      return groups;
    }, []);

    // @ts-ignore
    setFilteredTickets(groupedFiltered);
  }, [searchTerm, statusFilter, tickets]);

  // ⭐ Helper function to detect round trip
  const isRoundTripBooking = (booking: any) => {
    const tickets = booking.tickets;
    if (tickets.length < 2) return false;

    // Check if any ticket has booking group ID
    const hasBookingGroup = tickets.some((t: any) => t.bookingGroupId);

    // Check if tickets have trip type
    const isRoundTrip = tickets.some((t: any) => t.tripType === 'round_trip');

    // Check if there are return trip tickets
    const hasReturnTrip = tickets.some((t: any) => t.isReturnTrip);

    return hasBookingGroup || isRoundTrip || hasReturnTrip;
  };

  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      // Get userId from either LoginResponse (userId) or UserResponse (id)
      const userId = 'userId' in user! ? user!.userId : user!.id;

      if (!userId) {
        toast.error("Không tìm thấy thông tin người dùng");
        navigate("/login");
        return;
      }

      const response = await ticketService.getUserTickets(userId);

      if (response.success && response.data) {
        // Log raw data for debugging
        console.log("📦 Raw tickets from API:", response.data);
        console.log("📊 Total tickets received:", response.data.length);

        // Remove duplicates based on ticket ID
        const uniqueTickets = response.data.filter(
          (ticket, index, self) =>
            index === self.findIndex((t) => t.id === ticket.id)
        );

        // Sort by booked date (newest first), then by ID (newest first)
        const sortedTickets = uniqueTickets.sort((a, b) => {
          const dateA = new Date(a.bookedAt).getTime();
          const dateB = new Date(b.bookedAt).getTime();

          // Primary sort: by booked date DESC
          if (dateB !== dateA) {
            return dateB - dateA;
          }

          // Secondary sort: by ID DESC (when timestamps are equal)
          return b.id - a.id;
        });

        console.log("✅ Unique tickets:", uniqueTickets.length);
        console.log("📅 Sorted tickets (newest first):", sortedTickets);

        // Check for duplicates
        const duplicateCount = response.data.length - uniqueTickets.length;
        if (duplicateCount > 0) {
          console.warn(`⚠️ Removed ${duplicateCount} duplicate tickets`);
        }

        // ⭐ NEW: Group tickets by booking session (same tripId + same bookedAt time within 1 minute)
        const groupedTickets = sortedTickets.reduce((groups: any[], ticket) => {
          // Find existing group with same trip and booked time (within 1 minute)
          const existingGroup = groups.find(group => {
            if (group.tickets[0].trip.id !== ticket.trip.id) return false;

            const time1 = new Date(group.tickets[0].bookedAt).getTime();
            const time2 = new Date(ticket.bookedAt).getTime();
            return Math.abs(time1 - time2) < 60000; // Within 1 minute
          });

          // ⭐ FIX: Safe access to seat number (tripSeat or seat can be undefined)
          const seatNumber = ticket.tripSeat?.seatNumber || ticket.seat?.seatNumber || 'N/A';

          if (existingGroup) {
            existingGroup.tickets.push(ticket);
            existingGroup.seats.push(seatNumber);
          } else {
            groups.push({
              bookingId: `BOOKING_${ticket.trip.id}_${new Date(ticket.bookedAt).getTime()}`,
              tickets: [ticket],
              seats: [seatNumber],
              mainTicket: ticket // Use first ticket as main ticket for display
            });
          }

          return groups;
        }, []);

        console.log("👥 Grouped tickets into bookings:", groupedTickets);

        // Store both individual and grouped tickets
        setTickets(sortedTickets);
        // @ts-ignore
        setFilteredTickets(groupedTickets); // Use grouped tickets for display
      } else {
        toast.error("Không thể tải danh sách vé");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500 hover:bg-green-600">Đã xác nhận</Badge>;
      case "booked":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Đã đặt</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleViewDetails = (booking: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    console.log("📋 Opening details for booking:", booking);
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const handleCancelTicket = async (booking: any, e: React.MouseEvent) => {
    e.stopPropagation();

    const ticketCount = booking.tickets.length;
    const seatList = booking.seats.join(", ");

    // Confirm before canceling
    if (!confirm(`Bạn có chắc chắn muốn hủy ${ticketCount} vé (ghế: ${seatList}) không?`)) {
      return;
    }

    try {
      const loadingToast = toast.loading(`Đang hủy ${ticketCount} vé...`);

      // ⭐ Cancel ALL tickets in this booking group
      const cancelPromises = booking.tickets.map((ticket: any) =>
        ticketService.updateTicketStatus(ticket.id, "cancelled")
      );

      const results = await Promise.all(cancelPromises);

      // Check if all cancellations succeeded
      const allSuccess = results.every(result => result.success);

      toast.dismiss(loadingToast);

      if (allSuccess) {
        toast.success(`Đã hủy thành công ${ticketCount} vé!`);
        // Refresh tickets list
        fetchUserTickets();
      } else {
        throw new Error("Không thể hủy một số vé");
      }
    } catch (error: any) {
      console.error("Error canceling tickets:", error);
      toast.error(error.message || "Có lỗi xảy ra khi hủy vé");
    }
  };

  const handleRetryPayment = async (booking: any, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const allTickets = booking.tickets;
      const mainTicket = booking.mainTicket;

      // ⭐ FIX: Get ALL ticket IDs and seats from booking
      const ticketIds = allTickets.map((t: any) => t.id);
      const selectedSeats = allTickets.map((t: any) =>
        t.tripSeat?.seatNumber || t.seat?.seatNumber || 'N/A'
      );
      const totalPrice = allTickets.reduce((sum: number, t: any) => sum + Number(t.price), 0);

      // Prepare payment data with ALL tickets
      const paymentData = {
        ticketIds: ticketIds,
        userId: mainTicket.user.id,
        tripId: mainTicket.trip.id,
        trip: mainTicket.trip,
        selectedSeats: selectedSeats,
        customerName: mainTicket.user.fullName,
        customerPhone: mainTicket.user.phone,
        customerEmail: mainTicket.user.email,
        totalPrice: totalPrice,
        price: totalPrice,
      };

      console.log(`🔄 Retry payment for ${allTickets.length} ticket(s):`, ticketIds);
      console.log("💺 Seats:", selectedSeats);
      console.log("💰 Total:", totalPrice);

      sessionStorage.setItem("bookingData", JSON.stringify(paymentData));

      // Navigate to payment page
      navigate("/payment");
    } catch (error: any) {
      console.error("Error retrying payment:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải danh sách vé...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Tra Cứu Vé
            </h1>
            <p className="text-gray-600">
              Quản lý và tra cứu tất cả các vé xe của bạn
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo mã vé, tuyến đường, số ghế..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="booked">Đã đặt</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Không tìm thấy vé nào
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                      : "Bạn chưa có vé nào. Hãy đặt vé ngay!"}
                  </p>
                  <Button onClick={() => navigate("/product")}>
                    Đặt vé ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((booking) => {
                const mainTicket = booking.mainTicket;
                const ticketCount = booking.tickets.length;
                const totalPrice = booking.tickets.reduce((sum: number, t: any) => sum + t.price, 0);

                return (
                <Card
                  key={booking.bookingId}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(booking)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                          <TicketIcon className="h-5 w-5 text-blue-600" />
                          {mainTicket.bookingGroupId ? (
                            <>
                              <span>Mã đặt: {mainTicket.bookingGroupId.slice(0, 15)}...</span>
                              {isRoundTripBooking(booking) && (
                                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                                  🔄 Khứ hồi
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <span>Mã vé #{mainTicket.id}</span>
                              {ticketCount > 1 && (
                                <Badge variant="secondary">
                                  +{ticketCount - 1} vé
                                </Badge>
                              )}
                            </>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Đặt ngày: {formatDateTime(mainTicket.bookedAt)}
                        </p>
                      </div>
                      {getStatusBadge(mainTicket.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Route Info */}
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600">Tuyến đường</p>
                          <p className="font-semibold text-gray-800 flex items-center gap-1 flex-wrap">
                            <span className="truncate">
                              {mainTicket.trip.route.fromLocation}
                            </span>
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {mainTicket.trip.route.toLocation}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Date & Seat Info */}
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Khởi hành</p>
                          <p className="font-semibold text-gray-800">
                            {formatDateTime(mainTicket.trip.departureTime)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Ghế: <span className="font-semibold text-blue-600">
                              {booking.seats.join(", ")}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Tổng giá vé</p>
                          <p className="text-xl font-bold text-orange-600">
                            {formatPrice(totalPrice)}
                          </p>
                          {isRoundTripBooking(booking) && (
                            <p className="text-xs text-green-600 font-semibold">
                              🎉 Đã giảm 10%
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleViewDetails(booking, e)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Xe: {mainTicket.trip.vehicle.licensePlate}</span>
                        <span className="capitalize">
                          Thanh toán: {mainTicket.bookingMethod === "online" ? "Online" : "Tại quầy"}
                        </span>
                        {ticketCount > 1 && (
                          <Badge variant="secondary">
                            {ticketCount} ghế
                          </Badge>
                        )}
                      </div>
                      {mainTicket.promotion && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          Có khuyến mãi
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons for Booked Tickets */}
                    {mainTicket.status === "booked" && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={(e) => handleCancelTicket(booking, e)}
                          className="flex-1"
                          variant="destructive"
                        >
                          Hủy {ticketCount > 1 ? `${ticketCount} vé` : 'vé'}
                        </Button>
                        <Button
                          onClick={(e) => handleRetryPayment(booking, e)}
                          className="flex-1"
                          variant="outline"
                        >
                          Thanh toán lại
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {filteredTickets.length > 0 && (
            <div className="mt-6 text-center text-gray-600">
              Hiển thị {filteredTickets.length} / {tickets.length} vé
            </div>
          )}
        </div>
      </div>

      {/* ⭐ NEW: Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedBooking.mainTicket.status === "confirmed" ? (
                    <>
                      <Receipt className="h-5 w-5 text-green-600" />
                      Hóa đơn điện tử
                    </>
                  ) : (
                    <>
                      <Info className="h-5 w-5 text-blue-600" />
                      Thông tin chi tiết vé
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Mã vé #{selectedBooking.mainTicket.id} - {selectedBooking.tickets.length} ghế
                </DialogDescription>
              </DialogHeader>

              {/* Content based on status */}
              {selectedBooking.mainTicket.status === "confirmed" ? (
                // ✅ CONFIRMED: Show Invoice
                <InvoiceContent booking={selectedBooking} />
              ) : (
                // ⏳ BOOKED or ❌ CANCELLED: Show Ticket Details
                <TicketDetailsContent booking={selectedBooking} />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}

// ✅ Invoice Content Component (for confirmed tickets)
function InvoiceContent({ booking }: { booking: any }) {
  const mainTicket = booking.mainTicket;
  const totalPrice = booking.tickets.reduce((sum: number, t: any) => sum + Number(t.price), 0);

  // ⭐ Check if round trip
  const isRoundTrip = booking.tickets.some((t: any) => t.bookingGroupId || t.tripType === 'round_trip');
  const outboundTickets = isRoundTrip ? booking.tickets.filter((t: any) => !t.isReturnTrip) : booking.tickets;
  const returnTickets = isRoundTrip ? booking.tickets.filter((t: any) => t.isReturnTrip) : [];

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {isRoundTrip ? 'HÓA ĐƠN VÉ KHỨ HỒI' : 'HÓA ĐƠN THANH TOÁN'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ngày xuất: {new Date().toLocaleDateString("vi-VN")}
            </p>
            {isRoundTrip && mainTicket.bookingGroupId && (
              <p className="text-sm text-gray-600 mt-1">
                Mã đặt: {mainTicket.bookingGroupId}
              </p>
            )}
          </div>
          <div className="text-right">
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              ĐÃ THANH TOÁN
            </Badge>
            {isRoundTrip && (
              <Badge className="mt-2 bg-gradient-to-r from-green-500 to-blue-500 text-white">
                🔄 Khứ hồi
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Thông tin khách hàng
        </h4>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Họ và tên</p>
            <p className="font-semibold">{mainTicket.user.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="font-semibold">{mainTicket.user.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{mainTicket.user.email}</p>
          </div>
        </div>
      </div>

      {/* Trip Info - Conditional for Round Trip */}
      {isRoundTrip ? (
        <>
          {/* Outbound Trip */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              🚌 CHUYẾN ĐI
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {outboundTickets[0]?.trip.route.fromLocation}
                </span>
                <ArrowRight className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-lg">
                  {outboundTickets[0]?.trip.route.toLocation}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Khởi hành</p>
                  <p className="font-semibold">
                    {new Date(outboundTickets[0]?.trip.departureTime).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số ghế</p>
                  <p className="font-semibold text-blue-600">
                    {outboundTickets.map((t: any) => t.tripSeat?.seatNumber || t.seat?.seatNumber).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Return Trip */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              🔄 CHUYẾN VỀ
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {returnTickets[0]?.trip.route.fromLocation}
                </span>
                <ArrowRight className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-lg">
                  {returnTickets[0]?.trip.route.toLocation}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Khởi hành</p>
                  <p className="font-semibold">
                    {new Date(returnTickets[0]?.trip.departureTime).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số ghế</p>
                  <p className="font-semibold text-blue-600">
                    {returnTickets.map((t: any) => t.tripSeat?.seatNumber || t.seat?.seatNumber).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* One-Way Trip */
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Thông tin chuyến đi
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">
                {mainTicket.trip.route.fromLocation}
              </span>
              <ArrowRight className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-lg">
                {mainTicket.trip.route.toLocation}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                <p className="font-semibold">
                  {new Date(mainTicket.trip.departureTime).toLocaleString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Biển số xe</p>
                <p className="font-semibold">{mainTicket.trip.vehicle.licensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số ghế</p>
                <p className="font-semibold text-blue-600">{booking.seats.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số lượng vé</p>
                <p className="font-semibold">{booking.tickets.length} vé</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Chi tiết thanh toán</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          {booking.tickets.map((ticket: any, index: number) => (
            <div key={ticket.id} className="flex justify-between text-sm">
              <span>
                Vé {index + 1} - Ghế {ticket.tripSeat?.seatNumber || ticket.seat?.seatNumber}
              </span>
              <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(ticket.price)}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-green-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 border-t pt-4">
        <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
        <p className="mt-1">Mọi thắc mắc xin liên hệ: 1900 xxxx</p>
      </div>
    </div>
  );
}

// 📋 Ticket Details Content Component (for booked/cancelled tickets)
function TicketDetailsContent({ booking }: { booking: any }) {
  const mainTicket = booking.mainTicket;
  const totalPrice = booking.tickets.reduce((sum: number, t: any) => sum + Number(t.price), 0);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`p-4 rounded-lg border ${
        mainTicket.status === "booked"
          ? "bg-yellow-50 border-yellow-200"
          : "bg-red-50 border-red-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {mainTicket.status === "booked" ? "VÉ CHƯA THANH TOÁN" : "VÉ ĐÃ HỦY"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mã đặt vé: #{mainTicket.id}
            </p>
          </div>
          <Badge className={
            mainTicket.status === "booked"
              ? "bg-yellow-500 text-white"
              : "bg-red-500 text-white"
          }>
            {mainTicket.status === "booked" ? "CHƯA THANH TOÁN" : "ĐÃ HỦY"}
          </Badge>
        </div>
      </div>

      {/* Booking Info */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Thông tin đặt vé</h4>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Ngày đặt</p>
            <p className="font-semibold">
              {new Date(mainTicket.bookedAt || mainTicket.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <p className="font-semibold">
              {mainTicket.status === "booked" ? "Chờ thanh toán" : "Đã hủy"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số lượng vé</p>
            <p className="font-semibold">{booking.tickets.length} vé</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="font-semibold text-orange-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Thông tin hành khách</h4>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Họ và tên</p>
            <p className="font-semibold">{mainTicket.user.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="font-semibold">{mainTicket.user.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{mainTicket.user.email}</p>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Chi tiết chuyến đi</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">
              {mainTicket.trip.route.fromLocation}
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-semibold">
              {mainTicket.trip.route.toLocation}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Giờ khởi hành</p>
              <p className="font-semibold">
                {new Date(mainTicket.trip.departureTime).toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giờ đến dự kiến</p>
              <p className="font-semibold">
                {new Date(mainTicket.trip.arrivalTime).toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Biển số xe</p>
              <p className="font-semibold">{mainTicket.trip.vehicle.licensePlate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loại xe</p>
              <p className="font-semibold">
                {mainTicket.trip.vehicle.vehicleType === "standard" ? "Ghế ngồi" :
                 mainTicket.trip.vehicle.vehicleType === "sleeper" ? "Giường nằm" :
                 mainTicket.trip.vehicle.vehicleType === "limousine" ? "Limousine" :
                 mainTicket.trip.vehicle.vehicleType}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Info */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Thông tin ghế</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {booking.seats.map((seat: string) => (
              <Badge key={seat} variant="outline" className="text-lg px-4 py-2">
                {seat}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Tổng: {booking.tickets.length} ghế
          </p>
        </div>
      </div>

      {/* Price Details */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Chi tiết giá vé</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          {booking.tickets.map((ticket: any, index: number) => (
            <div key={ticket.id} className="flex justify-between text-sm">
              <span>
                Vé {index + 1} - Ghế {ticket.tripSeat?.seatNumber || ticket.seat?.seatNumber}
              </span>
              <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(ticket.price)}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng tiền</span>
              <span className="text-orange-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Note */}
      {mainTicket.status === "booked" && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Lưu ý:</strong> Vui lòng thanh toán trước{" "}
            {new Date(mainTicket.trip.departureTime).toLocaleString("vi-VN")}{" "}
            để giữ chỗ. Vé chưa thanh toán sẽ bị hủy tự động.
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchTicket;
