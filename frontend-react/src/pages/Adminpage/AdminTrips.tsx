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
import { FaBus, FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import tripService from "@/services/trip.service";
import type { Trip, CreateTripRequest, UpdateTripRequest, RouteOption, VehicleOption, DriverOption } from "@/types/trip.types";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      const response = await tripService.getAllVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await tripService.getAllDrivers();
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
    setSelectedTrip(trip);
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

  const handleDelete = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowDeleteDialog(true);
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.routeId || !formData.vehicleId || !formData.driverId || !formData.departureTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const response = await tripService.createTrip(formData);
      
      if (response.success) {
        toast.success("Thêm chuyến xe thành công");
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
    
    if (!selectedTrip || !formData.routeId || !formData.vehicleId || !formData.driverId || !formData.departureTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const updateData: UpdateTripRequest = {
        routeId: formData.routeId,
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime || undefined,
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

  const confirmDelete = async () => {
    if (!selectedTrip) return;

    try {
      setLoading(true);
      const response = await tripService.deleteTrip(selectedTrip.id);
      
      if (response.success) {
        toast.success("Xóa chuyến xe thành công");
        setShowDeleteDialog(false);
        fetchTrips();
      } else {
        toast.error(response.message || "Xóa chuyến xe thất bại");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa chuyến xe thất bại");
      console.error("Error deleting trip:", error);
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
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(trip)}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status">Trạng thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="ongoing">Đang chạy</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-departure">Thời gian khởi hành *</Label>
                <Input
                  id="add-departure"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-arrival">Thời gian đến (dự kiến)</Label>
                <Input
                  id="add-arrival"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyến xe</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-route">Tuyến đường *</Label>
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
                <Label htmlFor="edit-vehicle">Xe *</Label>
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
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="ongoing">Đang chạy</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-departure">Thời gian khởi hành *</Label>
                <Input
                  id="edit-departure"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-arrival">Thời gian đến (dự kiến)</Label>
                <Input
                  id="edit-arrival"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                />
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

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuyến xe{" "}
              <strong>
                {selectedTrip?.route.fromLocation} → {selectedTrip?.route.toLocation}
              </strong>{" "}
              không? Hành động này không thể hoàn tác.
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

export default AdminTrips;
