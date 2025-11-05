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
import { toast } from "sonner";
import { FaBus, FaPlus, FaEdit, FaSearch, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import tripService from "@/services/trip.service";
import type { Trip, CreateTripRequest, UpdateTripRequest, RouteOption, VehicleOption, DriverOption } from "@/types/trip.types";
import { 
  isValidDepartureTime, 
  getMinDateTime
} from "@/utils/tripValidation";

function AdminTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateTripRequest>({
    routeId: 0,
    vehicleId: 0,
    driverId: 0,
    departureTime: "",
    arrivalTime: "",
    status: "scheduled",
  });

  useEffect(() => {
    fetchTrips();
    fetchRoutes();
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getAllTrips();
      if (response.success && response.data) {
        setTrips(response.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách chuyến xe");
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await tripService.getAllRoutes();
      if (response.success && response.data) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await tripService.getActiveVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await tripService.getActiveDrivers();
      if (response.success && response.data) {
        setDrivers(response.data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleAdd = () => {
    setFormData({
      routeId: 0,
      vehicleId: 0,
      driverId: 0,
      departureTime: "",
      arrivalTime: "",
      status: "scheduled",
    });
    setShowAddDialog(true);
  };

  const handleEdit = (trip: Trip) => {
    // Nếu trạng thái là ongoing, completed hoặc cancelled, chỉ cho xem thông tin
    if (trip.status === 'ongoing' || trip.status === 'completed' || trip.status === 'cancelled') {
      setSelectedTrip(trip);
      setShowEditDialog(false); // Đảm bảo edit dialog không mở
      setShowViewDialog(true);
      return;
    }
    
    setSelectedTrip(trip);
    setShowViewDialog(false); // Đảm bảo view dialog không mở
    setFormData({
      routeId: trip.route.id,
      vehicleId: trip.vehicle.id,
      driverId: trip.driver.id,
      departureTime: trip.departureTime.slice(0, 16), // Format for datetime-local
      arrivalTime: trip.arrivalTime ? trip.arrivalTime.slice(0, 16) : "",
      status: trip.status,
    });
    setShowEditDialog(true);
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.routeId || !formData.vehicleId || !formData.driverId || !formData.departureTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Validate departure time > current date
    if (!isValidDepartureTime(formData.departureTime)) {
      toast.error("Thời gian khởi hành phải sau thời gian hiện tại");
      return;
    }

    try {
      setLoading(true);
      
      // Force status to 'scheduled' when creating new trip
      const tripData = {
        ...formData,
        status: 'scheduled' as const
      };
      
      const response = await tripService.createTrip(tripData);
      
      if (response.success) {
        toast.success("Thêm chuyến xe thành công với trạng thái 'Đã lên lịch'");
        setShowAddDialog(false);
        fetchTrips();
      } else {
        toast.error(response.message || "Thêm chuyến xe thất bại");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thêm chuyến xe thất bại");
      console.error("Error adding trip:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTrip) {
      toast.error("Không tìm thấy chuyến xe");
      return;
    }

    // Chỉ cho phép sửa khi trạng thái là "scheduled"
    if (selectedTrip.status !== 'scheduled') {
      toast.error("Chỉ có thể chỉnh sửa chuyến xe ở trạng thái 'Đã lên lịch'");
      return;
    }

    // Chỉ validate các trường bắt buộc: status và driverId
    if (!formData.status || !formData.driverId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      
      // Chỉ gửi status và driverId, giữ nguyên các trường khác
      const updateData: UpdateTripRequest = {
        routeId: selectedTrip.route.id,
        vehicleId: selectedTrip.vehicle.id,
        driverId: formData.driverId,
        departureTime: selectedTrip.departureTime,
        arrivalTime: selectedTrip.arrivalTime || undefined,
        status: formData.status,
      };
      
      const response = await tripService.updateTrip(selectedTrip.id, updateData);
      
      if (response.success) {
        toast.success("Cập nhật chuyến xe thành công");
        setShowEditDialog(false);
        fetchTrips();
      } else {
        toast.error(response.message || "Cập nhật chuyến xe thất bại");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật chuyến xe thất bại");
      console.error("Error updating trip:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      scheduled: { label: "Đã lên lịch", className: "bg-blue-100 text-blue-800" },
      ongoing: { label: "Đang chạy", className: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
    };
    const badge = badges[status] || badges.scheduled;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
        {badge.label}
      </span>
    );
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

  const filteredTrips = trips.filter((trip) =>
    trip.route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.route.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý chuyến xe</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin chuyến xe trong hệ thống</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Search and Add */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tuyến, xe, tài xế..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleAdd} className="ml-4 bg-green-600 hover:bg-green-700">
                <FaPlus className="mr-2" />
                Thêm chuyến xe
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Đang tải...</p>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-8">
                <FaBus className="mx-auto text-4xl text-slate-300 mb-2" />
                <p className="text-slate-500">Không tìm thấy chuyến xe nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Tuyến đường</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Xe</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Tài xế</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Khởi hành</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((trip) => (
                      <tr key={trip.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">{trip.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-green-600 text-xs" />
                            <span className="font-medium">{trip.route.fromLocation}</span>
                            <span className="text-slate-400">→</span>
                            <FaMapMarkerAlt className="text-red-600 text-xs" />
                            <span className="font-medium">{trip.route.toLocation}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-blue-600">{trip.vehicle.licensePlate}</td>
                        <td className="py-3 px-4">{trip.driver.fullName}</td>
                        <td className="py-3 px-4 text-sm">{formatDateTime(trip.departureTime)}</td>
                        <td className="py-3 px-4">{getStatusBadge(trip.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(trip)}
                              className={
                                trip.status === 'ongoing' || trip.status === 'completed' || trip.status === 'cancelled'
                                  ? "text-slate-600 hover:text-slate-700"
                                  : "text-blue-600 hover:text-blue-700"
                              }
                              title={
                                trip.status === 'ongoing' || trip.status === 'completed' || trip.status === 'cancelled'
                                  ? "Xem thông tin chuyến xe"
                                  : "Chỉnh sửa"
                              }
                            >
                              {trip.status === 'ongoing' || trip.status === 'completed' || trip.status === 'cancelled' ? <FaEye /> : <FaEdit />}
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

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm chuyến xe mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitAdd}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-route">Tuyến đường *</Label>
                <Select
                  value={formData.routeId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, routeId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tuyến" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {route.fromLocation} → {route.toLocation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-vehicle">Xe *</Label>
                <Select
                  value={formData.vehicleId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, vehicleId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.licensePlate} ({vehicle.vehicleType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-driver">Tài xế *</Label>
                <Select
                  value={formData.driverId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, driverId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.fullName} - {driver.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  * Hệ thống sẽ kiểm tra xung đột lịch trình tự động
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-departure">Thời gian khởi hành *</Label>
                <Input
                  id="add-departure"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  min={getMinDateTime()}
                  step="1"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  * Phải sau thời gian hiện tại. Thời gian đến sẽ được tính tự động dựa trên thời gian ước tính của tuyến đường
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? "Đang thêm..." : "Thêm chuyến xe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyến xe (Chỉ Status & Tài xế)</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit}>
            {/* Hiển thị thông tin không thể chỉnh sửa */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-slate-700 mb-2">Thông tin chuyến xe:</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Tuyến đường:</strong> {selectedTrip?.route.fromLocation} → {selectedTrip?.route.toLocation}</p>
                <p><strong>Xe:</strong> {selectedTrip?.vehicle.licensePlate} ({selectedTrip?.vehicle.vehicleType})</p>
                <p><strong>Khởi hành:</strong> {selectedTrip?.departureTime ? formatDateTime(selectedTrip.departureTime) : ''}</p>
                <p><strong>Đến (dự kiến):</strong> {selectedTrip?.arrivalTime ? formatDateTime(selectedTrip.arrivalTime) : 'Chưa có'}</p>
              </div>
            </div>

            {/* Chỉ cho phép chỉnh sửa Driver và Status */}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-driver">Tài xế *</Label>
                <Select
                  value={formData.driverId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, driverId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.fullName} - {driver.phoneNumber}
                        {driver.id === selectedTrip?.driver.id && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  * Hệ thống sẽ kiểm tra xung đột lịch trình tự động
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  * Chỉ được chuyển giữa "Đã lên lịch" và "Đã hủy"
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Only Dialog - For ongoing/completed trips */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Thông tin chuyến xe
            </DialogTitle>
          </DialogHeader>

          {selectedTrip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tuyến đường</Label>
                  <Input 
                    value={`${selectedTrip.route.fromLocation} → ${selectedTrip.route.toLocation}`}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Xe</Label>
                  <Input 
                    value={`${selectedTrip.vehicle.licensePlate} (${selectedTrip.vehicle.vehicleType})`}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tài xế</Label>
                  <Input 
                    value={selectedTrip.driver.fullName}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Khởi hành</Label>
                  <Input 
                    value={formatDateTime(selectedTrip.departureTime)}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Đến (dự kiến)</Label>
                  <Input 
                    value={selectedTrip.arrivalTime ? formatDateTime(selectedTrip.arrivalTime) : "Chưa xác định"}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <div className="p-2">
                    {getStatusBadge(selectedTrip.status)}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Chuyến xe đang chạy hoặc đã hoàn thành không thể chỉnh sửa.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setShowViewDialog(false)} className="bg-slate-600 hover:bg-slate-700">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminTrips;
