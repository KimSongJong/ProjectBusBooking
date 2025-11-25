import { useState, useEffect } from "react";
import LeftTaskBar from "@/components/LeftTaskBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FaDollarSign,
  FaSearch,
  FaDownload,
  FaCreditCard,
  FaMoneyBillWave,
  FaMobileAlt,
  FaUndo
} from "react-icons/fa";
import paymentService from "@/services/payment.service";
import type { Payment, PaymentStats } from "@/types/payment.types";

function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("💰 Fetching payments...");
      const response = await paymentService.getAllPayments();
      console.log("📦 Payments response:", response);
      if (response.success && response.data) {
        console.log("✅ Payments loaded:", response.data.length);
        setPayments(response.data);
      } else {
        console.warn("⚠️ No payments data in response");
        setError("Không có dữ liệu thanh toán");
      }
    } catch (error: any) {
      console.error("❌ Error fetching payments:", error);
      const errorMsg = error?.payload?.message || error?.message || "Không thể tải danh sách thanh toán";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await paymentService.getPaymentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleRefund = async (payment: Payment) => {
    if (payment.paymentStatus !== "completed") {
      toast.error("Chỉ có thể hoàn tiền cho thanh toán đã hoàn thành");
      return;
    }

    if (!confirm(`Xác nhận hoàn tiền ${formatCurrency(payment.amount)} cho thanh toán #${payment.id}?`)) {
      return;
    }

    try {
      const response = await paymentService.processRefund(payment.id);
      if (response.success) {
        toast.success("Hoàn tiền thành công");
        fetchPayments();
        fetchStats();
      } else {
        toast.error(response.message || "Hoàn tiền thất bại");
      }
    } catch (error: any) {
      toast.error(error?.payload?.message || "Lỗi khi hoàn tiền");
    }
  };

  const handleUpdateStatus = async (payment: Payment, newStatus: string) => {
    try {
      const response = await paymentService.updatePaymentStatus(payment.id, newStatus);
      if (response.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchPayments();
        fetchStats();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      toast.error(error?.payload?.message || "Lỗi khi cập nhật");
    }
  };

  const handleExport = () => {
    // TODO: Implement export to CSV
    toast.info("Tính năng export đang phát triển");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getPaymentMethodBadge = (method: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      credit_card: { label: "Thẻ tín dụng", className: "bg-blue-100 text-blue-800", icon: FaCreditCard },
      debit_card: { label: "Thẻ ghi nợ", className: "bg-indigo-100 text-indigo-800", icon: FaCreditCard },
      cash: { label: "Tiền mặt", className: "bg-green-100 text-green-800", icon: FaMoneyBillWave },
      vnpay: { label: "VNPay", className: "bg-red-100 text-red-800", icon: FaMobileAlt },
      momo: { label: "Momo", className: "bg-pink-100 text-pink-800", icon: FaMobileAlt },
      zalopay: { label: "ZaloPay", className: "bg-cyan-100 text-cyan-800", icon: FaMobileAlt },
    };
    const badge = badges[method] || badges.cash;
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.className} flex items-center gap-1 w-fit`}>
        <Icon className="text-[10px]" />
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
      failed: { label: "Thất bại", className: "bg-red-100 text-red-800" },
      refunded: { label: "Đã hoàn tiền", className: "bg-purple-100 text-purple-800" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const filteredPayments = payments.filter((payment) => {
    try {
      const matchesSearch = (
        payment?.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment?.ticket?.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment?.ticket?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toString().includes(searchTerm)
      );

      const matchesStatus = statusFilter === "all" || payment.paymentStatus === statusFilter;
      const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    } catch (error) {
      console.error("❌ Error filtering payment:", payment, error);
      return false;
    }
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý thanh toán</h1>
          <p className="text-slate-600 mt-1">Theo dõi và quản lý các giao dịch thanh toán</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="p-8 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <FaDollarSign className="text-white text-xl" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Doanh thu hôm nay</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatCurrency(stats.todayRevenue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaDollarSign className="text-white text-xl" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Chờ xử lý</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{stats.pendingCount}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-medium">Thất bại</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{stats.failedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{stats.failedCount}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8 pt-4">
          <Card className="p-6">
            {/* Search & Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Tìm theo ID, transaction ID, khách hàng, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleExport}
                  className="bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2"
                >
                  <FaDownload /> Export
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex gap-3 items-center">
                <span className="text-sm font-medium text-slate-700">Lọc:</span>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="failed">Thất bại</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>

                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả phương thức</option>
                  <option value="credit_card">Thẻ tín dụng</option>
                  <option value="debit_card">Thẻ ghi nợ</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="vnpay">VNPay</option>
                  <option value="momo">Momo</option>
                  <option value="zalopay">ZaloPay</option>
                </select>

                {(statusFilter !== "all" || methodFilter !== "all" || searchTerm) && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setMethodFilter("all");
                      setSearchTerm("");
                    }}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                  >
                    Xóa bộ lọc
                  </button>
                )}

                <div className="ml-auto text-sm text-slate-600">
                  Tổng: <span className="font-bold">{filteredPayments.length}</span> thanh toán
                </div>
              </div>
            </div>

            {/* Table */}
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 font-medium">{error}</p>
                <Button
                  onClick={fetchPayments}
                  className="mt-4 bg-blue-950 hover:bg-blue-900"
                >
                  Thử lại
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Đang tải...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <FaDollarSign className="mx-auto text-4xl text-slate-300 mb-2" />
                <p className="text-slate-500">Không tìm thấy thanh toán nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Khách hàng</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Vé</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Số tiền</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Phương thức</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Ngày thanh toán</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">#{payment.id}</td>
                        <td className="py-3 px-4">
                          {payment.ticket ? (
                            <div>
                              <div className="font-medium">{payment.ticket.user.fullName}</div>
                              <div className="text-xs text-slate-500">{payment.ticket.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">Vé #{payment.ticketId}</div>
                            {payment.ticket && (
                              <div className="text-xs text-slate-500">
                                {payment.ticket.trip.route.fromLocation} → {payment.ticket.trip.route.toLocation}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 px-4">
                          {getPaymentMethodBadge(payment.paymentMethod)}
                        </td>
                        <td className="py-3 px-4">
                          {getPaymentStatusBadge(payment.paymentStatus)}
                        </td>
                        <td className="py-3 px-4">
                          {payment.transactionId ? (
                            <span className="text-xs font-mono text-slate-600">
                              {payment.transactionId.substring(0, 12)}...
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {formatDateTime(payment.paymentDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {payment.paymentStatus === "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefund(payment)}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                title="Hoàn tiền"
                              >
                                <FaUndo />
                              </Button>
                            )}
                            {payment.paymentStatus === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(payment, "completed")}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs px-2"
                              >
                                Xác nhận
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AdminPayments;

