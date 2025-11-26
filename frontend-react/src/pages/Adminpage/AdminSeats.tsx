import { useState, useEffect } from "react";
import LeftTaskBar from "@/components/LeftTaskBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { FaChair, FaSearch, FaFilter, FaCalendar } from "react-icons/fa";
import tripSeatService from "@/services/tripSeat.service";
import tripService from "@/services/trip.service";
import type { TripSeat, TripOption } from "@/types/tripSeat.types";
import BusLayoutRenderer from "@/components/BusLayoutRenderer";

function AdminSeats() {
  const [tripSeats, setTripSeats] = useState<TripSeat[]>([]);
  const [allTrips, setAllTrips] = useState<TripOption[]>([]); // Store all trips
  const [filteredTrips, setFilteredTrips] = useState<TripOption[]>([]); // Store filtered trips
  const [loading, setLoading] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [selectedSeat, setSelectedSeat] = useState<TripSeat | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStatus, setEditStatus] = useState<"available" | "booked" | "locked">("available");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("scheduled"); // all, scheduled, starting_soon, completed, cancelled
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all"); // all, standard, bed, vip
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12; // 12 cards per page (4x3 grid)

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId > 0) {
      fetchTripSeats();
    }
  }, [selectedTripId]);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [allTrips, statusFilter, vehicleTypeFilter, searchQuery, dateFromFilter, dateToFilter]);

  const fetchTrips = async () => {
    try {
      const response = await tripService.getAllTrips();
      if (response.success && response.data) {
        setAllTrips(response.data);
        // Don't auto-select first trip, let filters apply first
      }
    } catch (error) {
      toast.error("Không thể tải danh sách chuyến đi");
      console.error("Error fetching trips:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTrips];

    // 1. Filter by status
    if (statusFilter === "scheduled") {
      filtered = filtered.filter(trip => trip.status === "scheduled");
    } else if (statusFilter === "completed") {
      filtered = filtered.filter(trip => trip.status === "completed");
    } else if (statusFilter === "cancelled") {
      filtered = filtered.filter(trip => trip.status === "cancelled");
    } else if (statusFilter === "starting_soon") {
      // Sắp khởi hành trong 30 phút
      const now = new Date();
      const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

      filtered = filtered.filter(trip => {
        const departureTime = new Date(trip.departureTime);
        return trip.status === "scheduled" &&
               departureTime >= now &&
               departureTime <= in30Minutes;
      });
    }
    // statusFilter === "all" → không filter

    // 2. Filter by vehicle type
    if (vehicleTypeFilter !== "all") {
      filtered = filtered.filter(trip => {
        const vehicleType = trip.vehicle?.vehicleType?.toLowerCase() || '';
        if (vehicleTypeFilter === "standard") {
          return vehicleType === "standard" || vehicleType === "ghế";
        } else if (vehicleTypeFilter === "bed") {
          return vehicleType === "bed" || vehicleType === "sleeper" || vehicleType === "giường" || vehicleType === "giường nằm";
        } else if (vehicleTypeFilter === "vip") {
          return vehicleType === "vip" || vehicleType === "limousine";
        }
        return true;
      });
    }

    // 3. Filter by search query (route, vehicle plate, ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip => {
        const routeMatch = trip.route?.fromLocation?.toLowerCase().includes(query) ||
                          trip.route?.toLocation?.toLowerCase().includes(query);
        const vehicleMatch = trip.vehicle?.licensePlate?.toLowerCase().includes(query);
        const idMatch = trip.id.toString().includes(query);
        return routeMatch || vehicleMatch || idMatch;
      });
    }

    // 4. Filter by date range
    if (dateFromFilter || dateToFilter) {
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.departureTime);
        const tripDateOnly = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate());

        let matchFrom = true;
        let matchTo = true;

        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          matchFrom = tripDateOnly >= fromDate;
        }

        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          matchTo = tripDateOnly <= toDate;
        }

        return matchFrom && matchTo;
      });
    }

    setFilteredTrips(filtered);
    setCurrentPage(1); // Reset to first page when filters change

    // Auto-select first trip if available and no trip is selected
    if (filtered.length > 0 && selectedTripId === 0) {
      setSelectedTripId(filtered[0].id);
    } else if (filtered.length === 0) {
      setSelectedTripId(0);
      setTripSeats([]);
    }
  };

  // Calculate paginated trips
  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  const fetchTripSeats = async () => {
    try {
      setLoading(true);
      const response = await tripSeatService.getSeatsByTrip(selectedTripId);
      
      if (response.success && response.data) {
        setTripSeats(response.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404 || !error.response) {
        toast.info("Đang tạo sơ đồ ghế cho chuyến đi...");
        try {
          await tripSeatService.createSeatsForTrip(selectedTripId);
          toast.success("Đã tạo sơ đồ ghế thành công");
          setTimeout(fetchTripSeats, 500);
        } catch (createError) {
          toast.error("Không thể tạo sơ đồ ghế");
          console.error("Error creating trip seats:", createError);
        }
      } else {
        toast.error("Không thể tải sơ đồ ghế");
        console.error("Error fetching trip seats:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: TripSeat) => {
    setSelectedSeat(seat);
    setEditStatus(seat.status);
    setShowEditDialog(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) return;

    try {
      setLoading(true);
      let response;
      
      if (editStatus === 'booked') {
        response = await tripSeatService.bookSeat(selectedSeat.id);
      } else if (editStatus === 'locked') {
        response = await tripSeatService.lockSeat(selectedSeat.id);
      } else {
        response = await tripSeatService.cancelSeat(selectedSeat.id);
      }
      
      if (response.success) {
        toast.success("Cập nhật trạng thái ghế thành công");
        setShowEditDialog(false);
        fetchTripSeats();
      } else {
        toast.error(response.message || "Cập nhật ghế thất bại");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật ghế thất bại");
      console.error("Error updating seat:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTrip = filteredTrips.find(t => t.id === selectedTripId);

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý ghế</h1>
          <p className="text-slate-600 mt-1">Quản lý sơ đồ ghế theo từng chuyến đi</p>
        </div>
        <div className="p-8">
          {/* Compact Filters Card */}
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <FaFilter className="text-blue-600 text-sm" />
              <h3 className="text-sm font-semibold text-gray-800">Bộ lọc & tìm kiếm</h3>
            </div>

            {/* Compact Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Search */}
              <div>
                <Label className="text-xs font-medium mb-1 block text-gray-600">Tìm kiếm</Label>
                <Input
                  placeholder="🔍 Tuyến, xe, mã..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block text-gray-600">Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📋 Tất cả</SelectItem>
                    <SelectItem value="scheduled">🟢 Sắp đi</SelectItem>
                    <SelectItem value="starting_soon">🔥 Trong 30p</SelectItem>
                    <SelectItem value="completed">✅ Xong</SelectItem>
                    <SelectItem value="cancelled">❌ Hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Type Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block text-gray-600">Loại xe</Label>
                <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🚌 Tất cả</SelectItem>
                    <SelectItem value="standard">🪑 Ghế ngồi</SelectItem>
                    <SelectItem value="bed">🛏️ Giường nằm</SelectItem>
                    <SelectItem value="vip">👑 Limousine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div>
                <Label className="text-xs font-medium mb-1 block text-gray-600">Từ ngày</Label>
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* To Date */}
              <div>
                <Label className="text-xs font-medium mb-1 block text-gray-600">Đến ngày</Label>
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Filter Summary - Inline */}
            {(searchQuery || statusFilter !== "scheduled" || vehicleTypeFilter !== "all" || dateFromFilter || dateToFilter) && (
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200">
                <p className="text-xs text-blue-600">
                  📊 <span className="font-bold">{filteredTrips.length}</span> / {allTrips.length} chuyến
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("scheduled");
                    setVehicleTypeFilter("all");
                    setDateFromFilter("");
                    setDateToFilter("");
                  }}
                  className="h-7 px-2 text-xs"
                >
                  ❌ Xóa lọc
                </Button>
              </div>
            )}
          </Card>

          {/* Trip Cards Grid with Pagination */}
          {filteredTrips.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-lg mb-2 font-medium">Không tìm thấy chuyến xe nào</p>
                <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Cards Grid - Fixed Height, No Scroll (12 cards per page = 3 rows) */}
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[360px]">
                  {paginatedTrips.map((trip) => {
                      const isSelected = selectedTripId === trip.id;
                      return (
                        <Card
                          key={trip.id}
                          onClick={() => setSelectedTripId(trip.id)}
                          className={`p-3 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                              : 'border border-gray-200 hover:border-blue-400 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-gray-800 mb-0.5 line-clamp-1">
                                {trip.route.fromLocation} → {trip.route.toLocation}
                              </h3>
                              <p className="text-xs text-gray-500">#{trip.id}</p>
                            </div>
                            {isSelected && (
                              <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ml-1">
                                ✓
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">🚌</span>
                              <span className="font-medium truncate">{trip.vehicle.licensePlate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">
                                {(() => {
                                  const vType = trip.vehicle.vehicleType?.toLowerCase() || '';
                                  if (vType === 'bed' || vType === 'sleeper' || vType === 'giường' || vType === 'giường nằm') {
                                    return '🛏️';
                                  } else if (vType === 'vip' || vType === 'limousine') {
                                    return '👑';
                                  } else {
                                    return '🪑'; // Chair icon
                                  }
                                })()}
                              </span>
                              <span className="font-medium truncate">
                                {(() => {
                                  const vType = trip.vehicle.vehicleType?.toLowerCase() || '';
                                  if (vType === 'bed' || vType === 'sleeper' || vType === 'giường' || vType === 'giường nằm') {
                                    return 'Giường nằm';
                                  } else if (vType === 'vip' || vType === 'limousine') {
                                    return 'Limousine';
                                  } else {
                                    return 'Ghế ngồi';
                                  }
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">⏰</span>
                              <span className="font-medium truncate">{new Date(trip.departureTime).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                trip.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                                trip.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {trip.status === 'scheduled' && '🟢 Sắp đi'}
                                {trip.status === 'completed' && '✅ Xong'}
                                {trip.status === 'cancelled' && '❌ Hủy'}
                              </span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>

                {/* Pagination Controls - Centered & Bigger Buttons */}
                {totalPages > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-gray-600">
                        Trang <span className="font-semibold text-lg">{currentPage}</span> / {totalPages}
                        <span className="ml-2 text-gray-500">
                          ({startIndex + 1}-{Math.min(endIndex, filteredTrips.length)} / {filteredTrips.length} chuyến)
                        </span>
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-6 py-2 text-base"
                        >
                          ← Trang trước
                        </Button>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-6 py-2 text-base"
                        >
                          Trang sau →
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Trip Details & Seats */}
              {selectedTrip && (
                <>
                  {/* Compact Sticky Trip Bar with Legend */}
                  <div className="sticky top-0 z-10 mb-3 -mx-8 px-8 pt-3 pb-3 bg-slate-50">
                    <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
                      {/* Trip Info + Legend Row */}
                      <div className="flex items-center gap-4 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-700 font-semibold">📍</span>
                          <span className="font-bold text-blue-900 text-sm">{selectedTrip.route.fromLocation} → {selectedTrip.route.toLocation}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🚌</span>
                          <span className="font-medium">{selectedTrip.vehicle.licensePlate}</span>
                        </div>
                        <div className="bg-green-100 px-2 py-1 rounded border border-green-300">
                          <span className="text-green-700">Trống:</span>{' '}
                          <span className="font-bold text-green-800">{tripSeats.filter(s => s.status === "available").length}</span>
                        </div>
                        <div className="bg-red-100 px-2 py-1 rounded border border-red-300">
                          <span className="text-red-700">Đã đặt:</span>{' '}
                          <span className="font-bold text-red-800">{tripSeats.filter(s => s.status === "booked").length}</span>
                        </div>

                        {/* Legend badges - color blocks instead of icons */}
                        <div className="flex items-center gap-2 ml-2 border-l border-blue-300 pl-3">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                            <span className="text-[10px] font-medium text-gray-700">Trống</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                            <span className="text-[10px] font-medium text-gray-700">Đã đặt</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-slate-300 border-2 border-slate-500 rounded"></div>
                            <span className="text-[10px] font-medium text-gray-700">Khóa</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}

          {/* 🚌 Bus Seat Layout with BusLayoutRenderer */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-950"></div>
              <p className="text-slate-500 mt-3 text-sm">Đang tải...</p>
            </div>
          ) : tripSeats.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <FaChair className="mx-auto text-5xl text-slate-300 mb-3" />
                <p className="text-slate-500 text-base mb-1">Chưa có sơ đồ ghế</p>
                <p className="text-slate-400 text-xs mb-3">Nhấn nút bên dưới để tạo</p>
                <Button onClick={fetchTripSeats} size="sm" className="bg-blue-950 hover:bg-blue-900">Tạo sơ đồ ghế</Button>
              </div>
            </Card>
          ) : (
            <BusLayoutRenderer
              seats={tripSeats}
              onSeatClick={handleSeatClick}
              selectedSeats={[]}
              viewMode="admin"
            />
          )}
        </div>
      </main>
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cập nhật trạng thái ghế</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit}>
            {selectedSeat && (
              <div className="py-4 space-y-4">
                <div className="bg-gradient-to-r bg-gray-50 p-4 rounded-lg space-y-3 border border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Số ghế:</span>
                    <span className="font-bold text-xl text-blue-900">{selectedSeat.seatNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Loại ghế:</span>
                    <span className="capitalize font-medium text-slate-800">
                      {selectedSeat.seatType === 'standard' && '🪑 Tiêu chuẩn'}
                      {selectedSeat.seatType === 'vip' && '👑 VIP'}
                      {selectedSeat.seatType === 'bed' && '🛏️ Giường nằm'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Trạng thái hiện tại:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedSeat.status === 'available' ? 'bg-green-100 text-green-700' :
                      selectedSeat.status === 'booked' ? 'bg-red-100 text-red-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedSeat.status === 'available' && 'Còn trống'}
                      {selectedSeat.status === 'booked' && 'Đã đặt'}
                      {selectedSeat.status === 'locked' && 'Bị khóa'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-base font-semibold">Cập nhật trạng thái mới</Label>
                  <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>Còn trống</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="booked">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>Đã đặt</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="locked">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-slate-500 rounded"></div>
                          <span>Bị khóa</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
              <Button type="submit" disabled={loading} className="bg-blue-950 hover:bg-blue-900">
                {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminSeats;
