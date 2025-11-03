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
import seatService from "@/services/seat.service";
import type { Seat, CreateSeatRequest, UpdateSeatRequest, VehicleOption } from "@/types/seat.types";

function AdminSeats() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [editStatus, setEditStatus] = useState<"available" | "booked" | "unavailable">("available");

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicleId > 0) {
      fetchSeats();
    }
  }, [selectedVehicleId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await seatService.getAllSeats();
      if (response.success && response.data) {
        // Filter seats by selected vehicle
        const filtered = response.data.filter(seat => seat.vehicle?.id === selectedVehicleId);
        
        // If no seats exist for this vehicle, auto-create them
        if (filtered.length === 0 && selectedVehicleId > 0) {
          const vehicle = vehicles.find(v => v.id === selectedVehicleId);
          if (vehicle) {
            await autoCreateSeats(vehicle);
            return; // Will re-fetch after creation
          }
        }
        
        setSeats(filtered);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách ghế");
      console.error("Error fetching seats:", error);
    } finally {
      setLoading(false);
    }
  };

  const autoCreateSeats = async (vehicle: VehicleOption) => {
    try {
      const totalSeats = vehicle.seatCount;
      const seatsPerFloor = Math.ceil(totalSeats / 2);
      const promises: Promise<any>[] = [];

      // Create lower floor seats (A1, A2, ...)
      for (let i = 1; i <= seatsPerFloor && i <= totalSeats; i++) {
        const seatData: CreateSeatRequest = {
          vehicleId: vehicle.id,
          seatNumber: `A${i}`,
          seatType: vehicle.vehicleType === "sleeper" ? "bed" : vehicle.vehicleType === "vip" ? "vip" : "standard",
          status: "available",
        };
        promises.push(seatService.createSeat(seatData));
      }

      // Create upper floor seats (B1, B2, ...) if total > seatsPerFloor
      for (let i = 1; i <= totalSeats - seatsPerFloor; i++) {
        const seatData: CreateSeatRequest = {
          vehicleId: vehicle.id,
          seatNumber: `B${i}`,
          seatType: vehicle.vehicleType === "sleeper" ? "bed" : vehicle.vehicleType === "vip" ? "vip" : "standard",
          status: "available",
        };
        promises.push(seatService.createSeat(seatData));
      }

      await Promise.all(promises);
      toast.success(`Đã tạo ${totalSeats} ghế cho xe ${vehicle.licensePlate}`);
      fetchSeats(); // Reload seats
    } catch (error) {
      toast.error("Lỗi khi tạo ghế tự động");
      console.error("Error auto-creating seats:", error);
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await seatService.getAllVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
        if (response.data.length > 0) {
          setSelectedVehicleId(response.data[0].id);
        }
      }
    } catch (error) {
      toast.error("Không thể tải danh sách xe");
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setEditStatus(seat.status);
    setShowEditDialog(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSeat) return;

    try {
      setLoading(true);
      const updateData: UpdateSeatRequest = {
        status: editStatus,
      };
      
      const response = await seatService.updateSeat(selectedSeat.id, updateData);
      
      if (response.success) {
        toast.success("Cập nhật trạng thái ghế thành công");
        setShowEditDialog(false);
        fetchSeats();
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



  // Group seats by floor (lower/upper)
  const lowerFloorSeats = seats.filter(s => 
    s.seatNumber.match(/^[A]\d+$/)
  );
  const upperFloorSeats = seats.filter(s => 
    s.seatNumber.startsWith('B')
  );

  const renderSeat = (seat: Seat) => {
    const statusColors = {
      available: "bg-green-100 border-green-500 text-green-800 hover:bg-green-200",
      booked: "bg-red-100 border-red-500 text-red-800 hover:bg-red-200",
      unavailable: "bg-slate-300 border-slate-500 text-slate-700 hover:bg-slate-400",
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

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý ghế</h1>
          <p className="text-slate-600 mt-1">Quản lý sơ đồ ghế ngồi trong xe</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Vehicle Selector */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <Label className="text-lg font-semibold">Chọn xe:</Label>
              <Select
                value={selectedVehicleId.toString()}
                onValueChange={(value) => setSelectedVehicleId(parseInt(value))}
              >
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Chọn xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.licensePlate} - {vehicle.vehicleType} ({vehicle.seatCount} ghế)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedVehicle && (
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="bg-slate-50 px-4 py-2 rounded-lg">
                  <span className="text-slate-600">Loại xe:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedVehicle.vehicleType}</span>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-lg">
                  <span className="text-slate-600">Tổng ghế:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedVehicle.seatCount} ghế</span>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-green-600">Còn trống:</span>{" "}
                  <span className="font-semibold text-green-700">
                    {seats.filter(s => s.status === "available").length} ghế
                  </span>
                </div>
                <div className="bg-red-50 px-4 py-2 rounded-lg">
                  <span className="text-red-600">Đã đặt:</span>{" "}
                  <span className="font-semibold text-red-700">
                    {seats.filter(s => s.status === "booked").length} ghế
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Legend */}
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
                <span className="text-sm font-medium">Không khả dụng</span>
              </div>
              <div className="ml-auto flex items-center gap-4 text-lg">
                <span>🪑 Tiêu chuẩn</span>
                <span>👑 VIP</span>
                <span>🛏️ Giường nằm</span>
              </div>
            </div>
          </Card>

          {/* Seat Layout */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-slate-500 mt-4">Đang tải sơ đồ ghế...</p>
            </div>
          ) : seats.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <FaChair className="mx-auto text-6xl text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg mb-2">Đang tạo sơ đồ ghế...</p>
                <p className="text-slate-400 text-sm">Hệ thống sẽ tự động tạo ghế cho xe này</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Lower Floor */}
              {lowerFloorSeats.length > 0 && (
                <Card className="p-6 bg-white shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">🔽 Tầng dưới</h3>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{lowerFloorSeats.filter(s => s.status === 'available').length}</span> / {lowerFloorSeats.length} ghế trống
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 place-items-center">
                    {lowerFloorSeats.map(renderSeat)}
                  </div>
                </Card>
              )}

              {/* Upper Floor */}
              {upperFloorSeats.length > 0 && (
                <Card className="p-6 bg-white shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">🔼 Tầng trên</h3>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{upperFloorSeats.filter(s => s.status === 'available').length}</span> / {upperFloorSeats.length} ghế trống
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 place-items-center">
                    {upperFloorSeats.map(renderSeat)}
                  </div>
                </Card>
              )}

              {/* Show all seats if no clear floor division */}
              {lowerFloorSeats.length === 0 && upperFloorSeats.length === 0 && (
                <Card className="p-6 bg-white shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Sơ đồ ghế</h3>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{seats.filter(s => s.status === 'available').length}</span> / {seats.length} ghế trống
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 place-items-center">
                    {seats.map(renderSeat)}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit Status Dialog */}
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
                      {selectedSeat.status === 'unavailable' && 'Không khả dụng'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-base font-semibold">Cập nhật trạng thái mới</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(value: any) => setEditStatus(value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
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
                      <SelectItem value="unavailable">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-slate-500 rounded"></div>
                          <span>Không khả dụng</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
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
