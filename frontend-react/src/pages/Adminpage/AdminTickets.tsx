import { useState, useEffect } from "react";
import LeftTaskBar from "@/components/LeftTaskBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { FaTicketAlt, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import ticketService from "@/services/ticket.service";
import type { Ticket, UpdateTicketRequest } from "@/types/ticket.types";

function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ⭐ Round trip filters
  const [tripTypeFilter, setTripTypeFilter] = useState<"all" | "one_way" | "round_trip">("all");
  const [directionFilter, setDirectionFilter] = useState<"all" | "outbound" | "return">("all");

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Form state for editing status only
  const [editStatus, setEditStatus] = useState<"booked" | "confirmed" | "cancelled">("booked");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🎫 Fetching tickets...");
      const response = await ticketService.getAllTickets();
      console.log("📦 Tickets response:", response);
      if (response.success && response.data) {
        console.log("✅ Tickets loaded:", response.data.length);
        setTickets(response.data);
      } else {
        console.warn("⚠️ No tickets data in response");
        setError("Không có dữ liệu vé");
      }
    } catch (error: any) {
      console.error("❌ Error fetching tickets:", error);
      const errorMsg = error?.payload?.message || error?.message || "Không thể tải danh sách vé";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setShowEditDialog(true);
  };

  const handleDelete = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDeleteDialog(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket) return;

    try {
      setLoading(true);
      const updateData: UpdateTicketRequest = {
        status: editStatus,
      };
      
      const response = await ticketService.updateTicket(selectedTicket.id, updateData);
      
      if (response.success) {
        toast.success("Cập nhật trạng thái vé thành công");
        setShowEditDialog(false);
        fetchTickets();
      } else {
        toast.error(response.message || "Cập nhật vé thất bại");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật vé thất bại");
      console.error("Error updating ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      const response = await ticketService.deleteTicket(selectedTicket.id);
      
      if (response.success) {
        toast.success("Xóa vé thành công");
        setShowDeleteDialog(false);
        fetchTickets();
      } else {
        toast.error(response.message || "Xóa vé thất bại");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa vé thất bại");
      console.error("Error deleting ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      booked: { label: "Đã đặt", className: "bg-blue-100 text-blue-950" },
      confirmed: { label: "Đã xác nhận", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
    };
    const badge = badges[status] || badges.booked;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getBookingMethodBadge = (method: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      online: { label: "Online", className: "bg-purple-100 text-purple-800" },
      offline: { label: "Tại quầy", className: "bg-slate-100 text-slate-800" },
    };
    const badge = badges[method] || badges.online;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getTripTypeBadge = (tripType?: string) => {
    if (!tripType || tripType === "one_way") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          Một chiều
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
        Khứ hồi
      </span>
    );
  };

  const getDirectionIcon = (isReturnTrip?: boolean) => {
    if (isReturnTrip) {
      return <span className="text-orange-600" title="Vé về">←</span>;
    }
    return <span className="text-green-600" title="Vé đi">→</span>;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredTickets = tickets.filter((ticket) => {
    try {
      // Search filter
      const matchesSearch = (
        ticket?.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket?.trip?.route?.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket?.trip?.route?.toLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket?.seat?.seatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket?.bookingGroupId?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Trip type filter
      const matchesTripType = tripTypeFilter === "all" ||
        (tripTypeFilter === "one_way" && ticket.tripType === "one_way") ||
        (tripTypeFilter === "round_trip" && ticket.tripType === "round_trip");

      // Direction filter (only for round trip)
      const matchesDirection = directionFilter === "all" ||
        (directionFilter === "outbound" && !ticket.isReturnTrip) ||
        (directionFilter === "return" && ticket.isReturnTrip);

      return matchesSearch && matchesTripType && matchesDirection;
    } catch (error) {
      console.error("❌ Error filtering ticket:", ticket, error);
      return false;
    }
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý vé</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin vé xe trong hệ thống</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Search & Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Tìm theo khách hàng, email, tuyến, số ghế, booking group..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="text-sm text-slate-600 whitespace-nowrap">
                  Tổng: <span className="font-bold">{filteredTickets.length}</span> vé
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex gap-3 items-center">
                <span className="text-sm font-medium text-slate-700">Lọc:</span>

                {/* Trip Type Filter */}
                <select
                  value={tripTypeFilter}
                  onChange={(e) => setTripTypeFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="one_way">Một chiều</option>
                  <option value="round_trip">Khứ hồi</option>
                </select>

                {/* Direction Filter (only show when round_trip is selected) */}
                {tripTypeFilter === "round_trip" && (
                  <select
                    value={directionFilter}
                    onChange={(e) => setDirectionFilter(e.target.value as any)}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Cả 2 chiều</option>
                    <option value="outbound">Chỉ vé đi</option>
                    <option value="return">Chỉ vé về</option>
                  </select>
                )}

                {/* Reset Filters */}
                {(tripTypeFilter !== "all" || directionFilter !== "all" || searchTerm) && (
                  <button
                    onClick={() => {
                      setTripTypeFilter("all");
                      setDirectionFilter("all");
                      setSearchTerm("");
                    }}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 font-medium">{error}</p>
                <Button
                  onClick={fetchTickets}
                  className="mt-4 bg-blue-950 hover:bg-blue-900"
                >
                  Thử lại
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Đang tải...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <FaTicketAlt className="mx-auto text-4xl text-slate-300 mb-2" />
                <p className="text-slate-500">Không tìm thấy vé nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Loại vé</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Khách hàng</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Tuyến đường</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Ghế</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Đón/Trả</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Giá vé</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Đặt lúc</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Phương thức</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">#{ticket.id}</span>
                            {ticket.tripType === "round_trip" && (
                              <span className="text-lg">{getDirectionIcon(ticket.isReturnTrip)}</span>
                            )}
                          </div>
                          {ticket.bookingGroupId && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              Group: {ticket.bookingGroupId.substring(0, 8)}...
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getTripTypeBadge(ticket.tripType)}
                          {ticket.linkedTicketId && (
                            <div className="text-xs text-blue-600 mt-1">
                              ↔ #{ticket.linkedTicketId}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-slate-400 text-xs" />
                            <div>
                              <div className="font-medium">{ticket.user.fullName}</div>
                              <div className="text-xs text-slate-500">{ticket.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-green-600 text-xs" />
                            <span className="font-medium text-sm">{ticket.trip.route.fromLocation}</span>
                            <span className="text-slate-400">→</span>
                            <FaMapMarkerAlt className="text-red-600 text-xs" />
                            <span className="font-medium text-sm">{ticket.trip.route.toLocation}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {formatDateTime(ticket.trip.departureTime)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {ticket.seat ? (
                            <>
                              <span className="font-bold text-blue-950">{ticket.seat.seatNumber}</span>
                              <span className="text-xs text-slate-500 ml-1">({ticket.seat.seatType})</span>
                            </>
                          ) : ticket.tripSeat ? (
                            <>
                              <span className="font-bold text-blue-950">{ticket.tripSeat.seatNumber}</span>
                              <span className="text-xs text-slate-500 ml-1">({ticket.tripSeat.seatType})</span>
                            </>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {ticket.pickupPoint || ticket.dropoffPoint ? (
                            <div className="text-xs">
                              {ticket.pickupPoint && (
                                <div className="text-green-600 flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-[10px]" />
                                  <span className="truncate max-w-[120px]" title={ticket.pickupPoint}>
                                    {ticket.pickupPoint}
                                  </span>
                                </div>
                              )}
                              {ticket.dropoffPoint && (
                                <div className="text-red-600 flex items-center gap-1 mt-0.5">
                                  <FaMapMarkerAlt className="text-[10px]" />
                                  <span className="truncate max-w-[120px]" title={ticket.dropoffPoint}>
                                    {ticket.dropoffPoint}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          {formatCurrency(ticket.price)}
                          {ticket.promotion && (
                            <div className="text-xs text-blue-900">
                              -{ticket.promotion.code}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {formatDateTime(ticket.bookedAt)}
                        </td>
                        <td className="py-3 px-4">{getBookingMethodBadge(ticket.bookingMethod)}</td>
                        <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(ticket)}
                              className="text-blue-950 hover:text-blue-900"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(ticket)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FaTrash />
                            </Button>
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

      {/* Edit Status Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái vé</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit}>
            {selectedTicket && (
              <div className="py-4 space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Vé số:</span>
                    <span className="font-bold">#{selectedTicket.id}</span>
                  </div>

                  {/* Round trip info */}
                  {selectedTicket.tripType === "round_trip" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Loại vé:</span>
                        {getTripTypeBadge(selectedTicket.tripType)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Chiều:</span>
                        <span className="font-medium">
                          {selectedTicket.isReturnTrip ? "Về (←)" : "Đi (→)"}
                        </span>
                      </div>
                      {selectedTicket.linkedTicketId && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Vé liên kết:</span>
                          <span className="text-blue-600 font-medium">#{selectedTicket.linkedTicketId}</span>
                        </div>
                      )}
                      {selectedTicket.bookingGroupId && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Group ID:</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {selectedTicket.bookingGroupId.substring(0, 12)}...
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Khách hàng:</span>
                    <span className="font-medium">{selectedTicket.user.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Tuyến:</span>
                    <span className="text-sm">
                      {selectedTicket.trip.route.fromLocation} → {selectedTicket.trip.route.toLocation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Ghế:</span>
                    <span className="font-bold text-blue-950">
                      {selectedTicket.seat?.seatNumber || selectedTicket.tripSeat?.seatNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Warning for round trip cancellation */}
                {selectedTicket.tripType === "round_trip" && editStatus === "cancelled" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Lưu ý:</strong> Vé này là một phần của booking khứ hồi.
                      {selectedTicket.linkedTicketId && (
                        <> Vé liên kết (#{selectedTicket.linkedTicketId}) cũng nên được xem xét hủy.</>
                      )}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái *</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(value: any) => setEditStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booked">Đã đặt</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-950 hover:bg-blue-900">
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vé <strong>#{selectedTicket?.id}</strong> của khách hàng{" "}
              <strong>{selectedTicket?.user.fullName}</strong> không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminTickets;


