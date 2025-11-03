import { useEffect, useState } from "react"
import LeftTaskBar from "@/components/LeftTaskBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaTimes } from "react-icons/fa"
import vehicleService from "@/services/vehicle.service"
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from "@/types/vehicle.types"

function AdminVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState<CreateVehicleRequest | UpdateVehicleRequest>({
    licensePlate: "",
    model: "",
    totalSeats: 0,
    seatsLayout: "",
    vehicleType: "standard",
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await vehicleService.getAllVehicles()
      if (response.success && response.data) {
        setVehicles(response.data)
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách xe")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentVehicle(null)
    setFormData({
      licensePlate: "",
      model: "",
      totalSeats: 0,
      seatsLayout: "",
      vehicleType: "standard",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setIsEditing(true)
    setCurrentVehicle(vehicle)
    setFormData({
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      totalSeats: vehicle.totalSeats,
      seatsLayout: vehicle.seatsLayout || "",
      vehicleType: vehicle.vehicleType,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Bạn có chắc muốn xóa xe "${vehicle.licensePlate}"?`)) return

    try {
      const response = await vehicleService.deleteVehicle(vehicle.id)
      if (response.success) {
        toast.success("Xóa xe thành công")
        fetchVehicles()
      } else {
        toast.error(response.message || "Xóa xe thất bại")
      }
    } catch (error: any) {
      toast.error(error.payload?.message || "Lỗi khi xóa xe")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isEditing && currentVehicle) {
        const response = await vehicleService.updateVehicle(currentVehicle.id, formData as UpdateVehicleRequest)
        if (response.success) {
          toast.success("Cập nhật xe thành công")
          setIsDialogOpen(false)
          fetchVehicles()
        } else {
          toast.error(response.message || "Cập nhật thất bại")
        }
      } else {
        const response = await vehicleService.createVehicle(formData as CreateVehicleRequest)
        if (response.success) {
          toast.success("Tạo xe thành công")
          setIsDialogOpen(false)
          fetchVehicles()
        } else {
          toast.error(response.message || "Tạo xe thất bại")
        }
      }
    } catch (error: any) {
      const errorMsg = error.payload?.message || error.message || ""
      if (errorMsg.toLowerCase().includes("duplicate") && errorMsg.toLowerCase().includes("license_plate")) {
        toast.error("Biển số xe đã tồn tại trong hệ thống")
      } else {
        toast.error(errorMsg || "Lỗi khi lưu xe")
      }
    }
  }

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getVehicleTypeBadge = (type: string) => {
    const colors = {
      standard: "bg-gray-100 text-gray-700",
      vip: "bg-purple-100 text-purple-700",
      sleeper: "bg-blue-100 text-blue-700",
    }
    const labels = {
      standard: "Tiêu chuẩn",
      vip: "VIP",
      sleeper: "Giường nằm",
    }
    return { color: colors[type as keyof typeof colors], label: labels[type as keyof typeof labels] }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý xe</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin phương tiện trong hệ thống</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo biển số, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              >
                <FaPlus /> Thêm xe
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-slate-400">Đang tải dữ liệu...</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Biển số</TableHead>
                      <TableHead className="font-semibold">Model</TableHead>
                      <TableHead className="font-semibold">Số ghế</TableHead>
                      <TableHead className="font-semibold">Loại xe</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                          Không tìm thấy xe nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVehicles.map((vehicle) => {
                        const typeBadge = getVehicleTypeBadge(vehicle.vehicleType)
                        return (
                          <TableRow key={vehicle.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{vehicle.id}</TableCell>
                            <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                            <TableCell>{vehicle.model}</TableCell>
                            <TableCell>{vehicle.totalSeats} ghế</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge.color}`}>
                                {typeBadge.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(vehicle)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Chỉnh sửa"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(vehicle)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Xóa"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {isEditing ? "Chỉnh sửa xe" : "Thêm xe mới"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Cập nhật thông tin xe" : "Điền thông tin để thêm xe mới"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">
                  Biển số xe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="51A-12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">
                  Model xe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Thaco Universe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalSeats">
                  Số ghế <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalSeats"
                  type="number"
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) || 0 })}
                  placeholder="40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">
                  Loại xe <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value: 'standard' | 'vip' | 'sleeper') => setFormData({ ...formData, vehicleType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Tiêu chuẩn</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="sleeper">Giường nằm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatsLayout">Sơ đồ ghế (JSON)</Label>
              <Input
                id="seatsLayout"
                value={formData.seatsLayout}
                onChange={(e) => setFormData({ ...formData, seatsLayout: e.target.value })}
                placeholder='{"rows": 10, "cols": 4}'
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex items-center gap-2"
              >
                <FaTimes /> Hủy
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              >
                <FaSave /> {isEditing ? "Cập nhật" : "Lưu xe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminVehicles
