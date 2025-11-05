import { useEffect, useState } from "react"
import LeftTaskBar from "@/components/LeftTaskBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { FaPlus, FaEdit, FaSearch, FaSave, FaTimes, FaMapMarkerAlt } from "react-icons/fa"
import routeService from "@/services/route.service"
import type { Route, CreateRouteRequest, UpdateRouteRequest } from "@/types/route.types"
import { VIETNAM_PROVINCES } from "@/constants/provinces"
import { 
  validateDistance, 
  validatePrice, 
  validateDuration 
} from "@/utils/validation"

function AdminRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState<CreateRouteRequest | UpdateRouteRequest>({
    fromLocation: "",
    toLocation: "",
    distanceKm: 0,
    basePrice: 0,
    estimatedDuration: 0,
  })

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await routeService.getAllRoutes()
      if (response.success && response.data) {
        setRoutes(response.data)
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách tuyến đường")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentRoute(null)
    setFormData({
      fromLocation: "",
      toLocation: "",
      distanceKm: 0,
      basePrice: 0,
      estimatedDuration: 0,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (route: Route) => {
    setIsEditing(true)
    setCurrentRoute(route)
    setFormData({
      fromLocation: route.fromLocation,
      toLocation: route.toLocation,
      distanceKm: route.distanceKm,
      basePrice: route.basePrice,
      estimatedDuration: route.estimatedDuration,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: Kiểm tra điểm đi và điểm đến không được giống nhau
    if (formData.fromLocation === formData.toLocation) {
      toast.error("Điểm đi và điểm đến không được giống nhau");
      return;
    }

    // Validation: Kiểm tra khoảng cách
    const distanceValidation = validateDistance(Number(formData.distanceKm));
    if (!distanceValidation.valid) {
      toast.error(distanceValidation.message);
      return;
    }

    // Validation: Kiểm tra giá
    const priceValidation = validatePrice(Number(formData.basePrice));
    if (!priceValidation.valid) {
      toast.error(priceValidation.message);
      return;
    }

    // Validation: Kiểm tra thời gian
    const durationValidation = validateDuration(Number(formData.estimatedDuration));
    if (!durationValidation.valid) {
      toast.error(durationValidation.message);
      return;
    }

    // Validation: Kiểm tra tuyến đường đã tồn tại chưa (chỉ khi thêm mới)
    if (!isEditing) {
      const isDuplicate = routes.some(route => 
        route.fromLocation.toLowerCase() === formData.fromLocation.toLowerCase() &&
        route.toLocation.toLowerCase() === formData.toLocation.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(`Tuyến đường "${formData.fromLocation} → ${formData.toLocation}" đã tồn tại!`);
        return;
      }
    }

    // Validation: Kiểm tra khi edit, không được trùng với tuyến khác
    if (isEditing && currentRoute) {
      const isDuplicate = routes.some(route => 
        route.id !== currentRoute.id && // Không so sánh với chính nó
        route.fromLocation.toLowerCase() === formData.fromLocation.toLowerCase() &&
        route.toLocation.toLowerCase() === formData.toLocation.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(`Tuyến đường "${formData.fromLocation} → ${formData.toLocation}" đã tồn tại!`);
        return;
      }
    }

    try {
      if (isEditing && currentRoute) {
        const response = await routeService.updateRoute(currentRoute.id, formData as UpdateRouteRequest)
        if (response.success) {
          toast.success("Cập nhật tuyến đường thành công")
          setIsDialogOpen(false)
          fetchRoutes()
        } else {
          toast.error(response.message || "Cập nhật thất bại")
        }
      } else {
        const response = await routeService.createRoute(formData as CreateRouteRequest)
        if (response.success) {
          toast.success("Tạo tuyến đường thành công")
          setIsDialogOpen(false)
          fetchRoutes()
        } else {
          toast.error(response.message || "Tạo tuyến đường thất bại")
        }
      }
    } catch (error: any) {
      toast.error(error.payload?.message || "Lỗi khi lưu tuyến đường")
    }
  }

  const filteredRoutes = routes.filter((route) =>
    route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý tuyến đường</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin tuyến đường xe buýt</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo điểm đi, điểm đến..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              >
                <FaPlus /> Thêm tuyến đường
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
                      <TableHead className="font-semibold">Tuyến đường</TableHead>
                      <TableHead className="font-semibold">Khoảng cách</TableHead>
                      <TableHead className="font-semibold">Giá vé</TableHead>
                      <TableHead className="font-semibold">Thời gian</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                          Không tìm thấy tuyến đường nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoutes.map((route) => (
                        <TableRow key={route.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{route.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-green-600" />
                              <span className="font-medium">{route.fromLocation}</span>
                              <span className="text-slate-400">→</span>
                              <FaMapMarkerAlt className="text-red-600" />
                              <span className="font-medium">{route.toLocation}</span>
                            </div>
                          </TableCell>
                          <TableCell>{route.distanceKm} km</TableCell>
                          <TableCell className="font-semibold text-orange-600">
                            {formatCurrency(route.basePrice)}
                          </TableCell>
                          <TableCell>{formatDuration(route.estimatedDuration)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(route)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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
              {isEditing ? "Chỉnh sửa tuyến đường" : "Thêm tuyến đường mới"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Cập nhật thông tin tuyến đường" : "Điền thông tin để thêm tuyến đường mới"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromLocation">
                  Điểm đi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.fromLocation}
                  onValueChange={(value) => setFormData({ ...formData, fromLocation: value })}
                  required
                  disabled={isEditing}
                >
                  <SelectTrigger className={isEditing ? "bg-slate-100 cursor-not-allowed" : ""}>
                    <SelectValue placeholder="Chọn tỉnh/thành phố đi" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIETNAM_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditing && (
                  <p className="text-xs text-slate-500">Không thể sửa điểm đi</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="toLocation">
                  Điểm đến <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.toLocation}
                  onValueChange={(value) => setFormData({ ...formData, toLocation: value })}
                  required
                  disabled={isEditing}
                >
                  <SelectTrigger className={isEditing ? "bg-slate-100 cursor-not-allowed" : ""}>
                    <SelectValue placeholder="Chọn tỉnh/thành phố đến" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIETNAM_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditing && (
                  <p className="text-xs text-slate-500">Không thể sửa điểm đến</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="distanceKm">
                  Khoảng cách (km) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="distanceKm"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5000"
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })}
                  placeholder="120"
                  required
                  disabled={isEditing}
                  className={isEditing ? "bg-slate-100 cursor-not-allowed" : ""}
                />
                <p className="text-xs text-slate-500">
                  {isEditing ? "Không thể sửa khoảng cách" : "* Từ 1 đến 5,000 km"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">
                  Giá vé (VND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="10000"
                  max="10000000"
                  step="1000"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  placeholder="150000"
                  required
                />
                <p className="text-xs text-slate-500">* Từ 10,000 đến 10,000,000 VND</p>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="estimatedDuration">
                  Thời gian ước tính (phút) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="30"
                  max="4320"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                  placeholder="180"
                  required
                />
                <p className="text-xs text-slate-500">* Từ 30 phút đến 4,320 phút (3 ngày)</p>
              </div>
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
                <FaSave /> {isEditing ? "Cập nhật" : "Lưu tuyến đường"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminRoutes
