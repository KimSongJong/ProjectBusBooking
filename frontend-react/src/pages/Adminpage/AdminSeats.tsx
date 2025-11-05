import { useState, useEffect } from "react";
import LeftTaskBar from "@/components/LeftTaskBar";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
import { FaChair } from "react-icons/fa";
import tripSeatService from "@/services/tripSeat.service";
import tripService from "@/services/trip.service";
import type { TripSeat, TripOption } from "@/types/tripSeat.types";

function AdminSeats() {
  const [tripSeats, setTripSeats] = useState<TripSeat[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [selectedSeat, setSelectedSeat] = useState<TripSeat | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStatus, setEditStatus] = useState<"available" | "booked" | "locked">("available");

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId > 0) {
      fetchTripSeats();
    }
  }, [selectedTripId]);

  const fetchTrips = async () => {
    try {
      const response = await tripService.getAllTrips();
      if (response.success && response.data) {
        setTrips(response.data);
        if (response.data.length > 0) {
          setSelectedTripId(response.data[0].id);
        }
      }
    } catch (error) {
      toast.error("Không thể tải danh sách chuyến đi");
      console.error("Error fetching trips:", error);
    }
  };

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

  const lowerFloorSeats = tripSeats.filter(s => s.seatNumber.match(/^[A]\d+$/));
  const upperFloorSeats = tripSeats.filter(s => s.seatNumber.startsWith('B'));

  const renderSeat = (seat: TripSeat) => {
    const statusColors = {
      available: "bg-green-100 border-green-500 text-green-800 hover:bg-green-200",
      booked: "bg-red-100 border-red-500 text-red-800 hover:bg-red-200",
      locked: "bg-slate-300 border-slate-500 text-slate-700 hover:bg-slate-400",
    };

    const typeIcons = {
      standard: "🪑",
      vip: "👑",
      bed: "🛏️",
    };

    return (
      <div
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        className={`relative w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm ${statusColors[seat.status]}`}
      >
        <span className="text-sm font-bold">{seat.seatNumber}</span>
        <span className="text-2xl">{typeIcons[seat.seatType]}</span>
      </div>
    );
  };

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý ghế</h1>
          <p className="text-slate-600 mt-1">Quản lý sơ đồ ghế theo từng chuyến đi</p>
        </div>
        <div className="p-8">
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-2">
              <Label className="text-lg font-semibold">Chọn chuyến đi:</Label>
              <Select value={selectedTripId.toString()} onValueChange={(value) => setSelectedTripId(parseInt(value))}>
                <SelectTrigger className="w-[600px]">
                  <SelectValue placeholder="Chọn chuyến đi" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id.toString()}>
                      {trip.route.fromLocation} → {trip.route.toLocation} | {trip.vehicle.licensePlate} ({trip.vehicle.vehicleType} - {trip.vehicle.seatCount} ghế) | {new Date(trip.departureTime).toLocaleString('vi-VN')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTrip && (
              <div className="mt-4 flex items-center gap-6 text-sm flex-wrap">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-600">Tuyến:</span> <span className="font-semibold text-blue-800">{selectedTrip.route.fromLocation} → {selectedTrip.route.toLocation}</span>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-lg">
                  <span className="text-slate-600">Xe:</span> <span className="font-semibold text-slate-800">{selectedTrip.vehicle.licensePlate}</span>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-lg">
                  <span className="text-slate-600">Loại:</span> <span className="font-semibold text-slate-800">{selectedTrip.vehicle.vehicleType}</span>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-lg">
                  <span className="text-slate-600">Khởi hành:</span> <span className="font-semibold text-slate-800">{new Date(selectedTrip.departureTime).toLocaleString('vi-VN')}</span>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-green-600">Còn trống:</span> <span className="font-semibold text-green-700">{tripSeats.filter(s => s.status === "available").length} ghế</span>
                </div>
                <div className="bg-red-50 px-4 py-2 rounded-lg">
                  <span className="text-red-600">Đã đặt:</span> <span className="font-semibold text-red-700">{tripSeats.filter(s => s.status === "booked").length} ghế</span>
                </div>
              </div>
            )}
          </Card>
          <Card className="p-4 mb-6 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 border-2 border-green-500 rounded-lg shadow-sm"></div>
                <span className="text-sm font-medium">Còn trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 border-2 border-red-500 rounded-lg shadow-sm"></div>
                <span className="text-sm font-medium">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-slate-300 border-2 border-slate-500 rounded-lg shadow-sm"></div>
                <span className="text-sm font-medium">Bị khóa</span>
              </div>
              <div className="ml-auto flex items-center gap-4 text-lg">
                <span>🪑 Tiêu chuẩn</span>
                <span>👑 VIP</span>
                <span>🛏️ Giường nằm</span>
              </div>
            </div>
          </Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-slate-500 mt-4">Đang tải sơ đồ ghế...</p>
            </div>
          ) : tripSeats.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <FaChair className="mx-auto text-6xl text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg mb-2">Chưa có sơ đồ ghế cho chuyến này</p>
                <p className="text-slate-400 text-sm mb-4">Nhấn nút bên dưới để tạo sơ đồ ghế</p>
                <Button onClick={fetchTripSeats} className="bg-orange-500 hover:bg-orange-600">Tạo sơ đồ ghế</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {lowerFloorSeats.length > 0 && (
                <Card className="p-6 bg-white shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">🔽 Tầng dưới</h3>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{lowerFloorSeats.filter(s => s.status === 'available').length}</span> / {lowerFloorSeats.length} ghế trống
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 place-items-center">{lowerFloorSeats.map(renderSeat)}</div>
                </Card>
              )}
              {upperFloorSeats.length > 0 && (
                <Card className="p-6 bg-white shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">🔼 Tầng trên</h3>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{upperFloorSeats.filter(s => s.status === 'available').length}</span> / {upperFloorSeats.length} ghế trống
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 place-items-center">{upperFloorSeats.map(renderSeat)}</div>
                </Card>
              )}
              {lowerFloorSeats.length === 0 && upperFloorSeats.length === 0 && (
                <Card className="p-6 bg-white shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Sơ đồ ghế</h3>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{tripSeats.filter(s => s.status === 'available').length}</span> / {tripSeats.length} ghế trống
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 place-items-center">{tripSeats.map(renderSeat)}</div>
                </Card>
              )}
            </div>
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
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg space-y-3 border border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Số ghế:</span>
                    <span className="font-bold text-xl text-orange-600">{selectedSeat.seatNumber}</span>
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
              <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
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
