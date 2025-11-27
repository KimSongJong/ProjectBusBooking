import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/header";
import Footer from "@/components/footer";
import bookingService from "@/services/booking.service";
import tripSeatService from "@/services/tripSeat.service";
import paymentService from "@/services/payment.service";
import ticketService from "@/services/ticket.service";

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [transactionInfo, setTransactionInfo] = useState<any>(null);

  useEffect(() => {
    processPaymentCallback();
  }, []);

  const processPaymentCallback = async () => {
    try {
      setLoading(true);

      // ⭐ IMPORTANT: Check if user is still authenticated
      const token = localStorage.getItem("access_token");
      console.log("🔐 Token check:", token ? "Token exists" : "No token");

      if (!token) {
        console.error("❌ No token found - redirecting to login");
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        sessionStorage.setItem("redirect_after_login", window.location.href);
        navigate("/login");
        return;
      }

      console.log("✅ Token verified, proceeding with payment callback");

      // Get payment response code
      const responseCode = searchParams.get("vnp_ResponseCode") || searchParams.get("resultCode");
      const txnRef = searchParams.get("vnp_TxnRef") || searchParams.get("orderId");
      const amount = searchParams.get("vnp_Amount") || searchParams.get("amount");
      const payDate = searchParams.get("vnp_PayDate") || searchParams.get("transId");

      // Check if payment was successful
      if (responseCode === "00" || responseCode === "0") {
        // Payment successful
        setSuccess(true);
        setMessage("Thanh toán thành công!");

        // ⭐ NEW FLOW: Get pendingBookingData which contains ticketIds
        const paymentDataStr = sessionStorage.getItem("pendingBookingData");
        if (!paymentDataStr) {
          throw new Error("Không tìm thấy thông tin thanh toán");
        }

        const paymentData = JSON.parse(paymentDataStr);
        console.log("📦 Payment data from sessionStorage:", paymentData);

        // ⭐ STEP 1: UPDATE PAYMENT STATUS (FIX: Callback might fail in sandbox)
        console.log("💳 Updating payment status to 'completed'...");
        console.log("💳 Transaction ID:", txnRef);

        try {
          // Find payment by transactionId and update to completed
          const paymentsResponse = await paymentService.getAllPayments();
          if (paymentsResponse.success && paymentsResponse.data) {
            const payment = paymentsResponse.data.find((p: any) => p.transactionId === txnRef);

            if (payment) {
              console.log("✅ Found payment record:", payment.id);
              await paymentService.updatePaymentStatus(payment.id, "completed");
              console.log("✅ Payment status updated to 'completed'");
              toast.success("Đã xác nhận thanh toán!");
            } else {
              console.warn("⚠️ Payment record not found with transactionId:", txnRef);
              toast.warning("Không tìm thấy payment record, nhưng vé đã được cập nhật");
            }
          }
        } catch (error) {
          console.error("❌ Failed to update payment status:", error);
          // Don't throw - continue with ticket update
          toast.warning("Lỗi cập nhật payment status, vui lòng liên hệ admin");
        }

        // ⭐ STEP 2: Extract ticket IDs based on trip type
        // ...existing code...
        // Extract ticket IDs based on trip type
        let ticketIdsToUpdate: number[] = [];

        if (paymentData.tripType === 'roundTrip') {
          // Round trip: Extract IDs from outboundTickets and returnTickets
          console.log("🔄 Round trip detected - extracting ticket IDs from ticket objects");

          const outboundIds = (paymentData.outboundTickets || []).map((t: any) => t.id);
          const returnIds = (paymentData.returnTickets || []).map((t: any) => t.id);

          ticketIdsToUpdate = [...outboundIds, ...returnIds];

          console.log("✅ Extracted outbound ticket IDs:", outboundIds);
          console.log("✅ Extracted return ticket IDs:", returnIds);
          console.log("✅ Total ticket IDs to update:", ticketIdsToUpdate);
        } else {
          // One-way: Use ticketIds directly
          console.log("➡️ One-way trip detected - using ticketIds directly");
          ticketIdsToUpdate = paymentData.ticketIds || [];
        }

        if (!ticketIdsToUpdate || ticketIdsToUpdate.length === 0) {
          console.error("❌ No ticket IDs found!");
          console.error("❌ Payment data structure:", JSON.stringify(paymentData, null, 2));
          throw new Error("Không tìm thấy thông tin vé cần cập nhật");
        }

        console.log(`🔄 Updating ${ticketIdsToUpdate.length} ticket(s) to 'confirmed'...`);

        // ⭐ UPDATE ticket status from 'booked' to 'confirmed'
        const updatePromises = ticketIdsToUpdate.map(async (ticketId: number) => {
          try {
            const result = await ticketService.updateTicketStatus(ticketId, "confirmed");
            console.log(`✅ Ticket ${ticketId} updated to 'confirmed'`);
            return result;
          } catch (error) {
            console.error(`❌ Failed to update ticket ${ticketId}:`, error);
            throw error;
          }
        });

        await Promise.all(updatePromises);

        console.log("✅ All tickets updated successfully");
        toast.success(`Đã xác nhận ${ticketIdsToUpdate.length} vé!`);

        // Clear payment data
        sessionStorage.removeItem("pendingBookingData");
        sessionStorage.removeItem("bookingData");

        // Set transaction info for display
        let routeInfo = '';
        let seatsInfo = '';

        if (paymentData.tripType === 'roundTrip') {
          // Round trip: Show both routes
          const outboundRoute = `${paymentData.outboundTrip?.route?.fromLocation} → ${paymentData.outboundTrip?.route?.toLocation}`;
          const returnRoute = `${paymentData.returnTrip?.route?.fromLocation} → ${paymentData.returnTrip?.route?.toLocation}`;
          routeInfo = `🔄 Khứ hồi: ${outboundRoute} | ${returnRoute}`;

          const outboundSeats = paymentData.selectedOutboundSeats?.join(", ") || '';
          const returnSeats = paymentData.selectedReturnSeats?.join(", ") || '';
          seatsInfo = `Đi: ${outboundSeats} | Về: ${returnSeats}`;
        } else {
          // One-way: Show single route
          routeInfo = `${paymentData.trip?.route?.fromLocation} → ${paymentData.trip?.route?.toLocation}`;
          seatsInfo = paymentData.selectedSeats?.join(", ") || '';
        }

        setTransactionInfo({
          transactionId: txnRef,
          amount: amount,
          payDate: payDate,
          route: routeInfo,
          seats: seatsInfo,
          customerName: paymentData.customerName,
          ticketIds: ticketIdsToUpdate,
          isRoundTrip: paymentData.tripType === 'roundTrip',
        });

        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/search-ticket");
        }, 3000);
      } else {
        // Payment failed or cancelled
        setSuccess(false);

        // Determine error message based on response code
        let errorMessage = "Thanh toán thất bại!";
        if (responseCode === "24") {
          errorMessage = "Giao dịch bị hủy bởi người dùng";
        } else if (responseCode === "07") {
          errorMessage = "Trừ tiền thành công nhưng giao dịch nghi vấn";
        } else if (responseCode === "09") {
          errorMessage = "Giao dịch không thành công do: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking";
        } else if (responseCode === "10") {
          errorMessage = "Xác thực thông tin không đúng quá 3 lần";
        } else if (responseCode === "11") {
          errorMessage = "Đã hết hạn chờ thanh toán";
        } else if (responseCode === "12") {
          errorMessage = "Thẻ/Tài khoản bị khóa";
        } else if (responseCode === "13") {
          errorMessage = "Mật khẩu xác thực OTP không đúng";
        } else if (responseCode === "51") {
          errorMessage = "Tài khoản không đủ số dư để thực hiện giao dịch";
        } else if (responseCode === "65") {
          errorMessage = "Tài khoản đã vượt quá hạn mức giao dịch trong ngày";
        } else if (responseCode === "75") {
          errorMessage = "Ngân hàng thanh toán đang bảo trì";
        } else if (responseCode === "79") {
          errorMessage = "Giao dịch vượt quá số lần nhập sai mật khẩu";
        }

        setMessage(errorMessage);

        console.log("❌ Payment failed with code:", responseCode);

        // Get pendingBookingData to show ticket info
        const paymentDataStr = sessionStorage.getItem("pendingBookingData");
        if (paymentDataStr) {
          const paymentData = JSON.parse(paymentDataStr);
          toast.warning(`Vé đã được tạo với trạng thái 'Đã đặt'. Bạn có thể thanh toán lại sau.`);

          // Extract ticket IDs for failed payment too
          let failedTicketIds: number[] = [];
          if (paymentData.tripType === 'roundTrip') {
            const outboundIds = (paymentData.outboundTickets || []).map((t: any) => t.id);
            const returnIds = (paymentData.returnTickets || []).map((t: any) => t.id);
            failedTicketIds = [...outboundIds, ...returnIds];
          } else {
            failedTicketIds = paymentData.ticketIds || [];
          }

          let routeInfo = '';
          let seatsInfo = '';

          if (paymentData.tripType === 'roundTrip') {
            const outboundRoute = `${paymentData.outboundTrip?.route?.fromLocation} → ${paymentData.outboundTrip?.route?.toLocation}`;
            const returnRoute = `${paymentData.returnTrip?.route?.fromLocation} → ${paymentData.returnTrip?.route?.toLocation}`;
            routeInfo = `🔄 Khứ hồi: ${outboundRoute} | ${returnRoute}`;

            const outboundSeats = paymentData.selectedOutboundSeats?.join(", ") || '';
            const returnSeats = paymentData.selectedReturnSeats?.join(", ") || '';
            seatsInfo = `Đi: ${outboundSeats} | Về: ${returnSeats}`;
          } else {
            routeInfo = `${paymentData.trip?.route?.fromLocation} → ${paymentData.trip?.route?.toLocation}`;
            seatsInfo = paymentData.selectedSeats?.join(", ") || '';
          }

          setTransactionInfo({
            transactionId: txnRef,
            ticketIds: failedTicketIds,
            route: routeInfo,
            seats: seatsInfo,
            isRoundTrip: paymentData.tripType === 'roundTrip',
          });
        }
      }
    } catch (error: any) {
      console.error("❌ Payment callback error:", error);
      setSuccess(false);
      setMessage(error.message || "Có lỗi xảy ra trong quá trình xử lý thanh toán");
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleViewTickets = () => {
    navigate("/invoice");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
          <p className="text-lg text-gray-600">Đang xử lý kết quả thanh toán...</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng không tắt trang này</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              {success ? (
                <>
                  <div className="mb-6">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                  </div>
                  <h1 className="text-3xl font-bold text-green-600 mb-4">
                    {message}
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Vé của bạn đã được đặt thành công. Thông tin chi tiết đã được gửi qua email.
                  </p>

                  {transactionInfo && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                      <h3 className="font-bold text-lg mb-4">Thông tin giao dịch</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã giao dịch:</span>
                          <span className="font-semibold">{transactionInfo.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số tiền:</span>
                          <span className="font-semibold text-orange-600">{transactionInfo.amount}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tuyến xe:</span>
                          <span className="font-semibold">{transactionInfo.route}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số ghế:</span>
                          <span className="font-semibold text-blue-600">{transactionInfo.seats}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tên khách hàng:</span>
                          <span className="font-semibold">{transactionInfo.customerName}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {transactionInfo?.ticketIds && transactionInfo.ticketIds.length > 0 && (
                      <Button
                        onClick={() => navigate(`/invoice?ticketId=${transactionInfo.ticketIds[0]}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6"
                      >
                        Xem hóa đơn
                      </Button>
                    )}
                    <Button
                      onClick={handleBackToHome}
                      variant="outline"
                      className="flex-1 py-6"
                    >
                      Về trang chủ
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                  </div>
                  <h1 className="text-3xl font-bold text-red-600 mb-4">
                    Thanh toán thất bại
                  </h1>
                  <p className="text-gray-600 mb-8">
                    {message}
                  </p>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => navigate("/product")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6"
                    >
                      Thử lại
                    </Button>
                    <Button
                      onClick={handleBackToHome}
                      variant="outline"
                      className="flex-1 py-6"
                    >
                      Về trang chủ
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Tips */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3">💡 Lưu ý</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Vui lòng kiểm tra email để xem thông tin vé chi tiết</li>
              <li>• Mang theo CMND/CCCD khi lên xe</li>
              <li>• Có mặt tại bến xe trước giờ xuất phát 15-30 phút</li>
              <li>• Liên hệ hotline nếu cần hỗ trợ: 1900 xxxx</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default PaymentResult;

