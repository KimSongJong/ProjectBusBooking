import { useEffect, useState } from "react"
import LeftTaskBar from "@/components/LeftTaskBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { FaPlus, FaEdit, FaSearch, FaImage, FaUserCheck, FaUserTimes } from "react-icons/fa"
import driverService from "@/services/driver.service"
import type { Driver, CreateDriverRequest, UpdateDriverRequest } from "@/types/driver.types"
import AddDriverDialog from "@/components/layout/admin/addDriver"
import EditDriverDialog from "@/components/layout/admin/editDriver"

function AdminDriver() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState<CreateDriverRequest | UpdateDriverRequest>({
    fullName: "",
    phone: "",
    licenseNumber: "",
    experienceYears: 0,
    imageUrl: "",
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await driverService.getAllDrivers()
      console.log('Drivers response:', response)
      if (response.success && response.data) {
        console.log('Drivers data:', response.data)
        setDrivers(response.data)
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách tài xế")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentDriver(null)
    setFormData({
      fullName: "",
      phone: "",
      licenseNumber: "",
      experienceYears: 0,
      imageUrl: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (driver: Driver) => {
    setIsEditing(true)
    setCurrentDriver(driver)
    setFormData({
      fullName: driver.fullName,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      experienceYears: driver.experienceYears,
      imageUrl: driver.imageUrl || "",
    })
    setIsDialogOpen(true)
  }

  const handleToggleStatus = async (driver: Driver) => {
    const action = driver.isActive ? "Nghỉ làm" : "kích hoạt"
    if (!confirm(`Bạn có chắc muốn ${action} tài xế "${driver.fullName}"?`)) return

    try {
      const response = await driverService.toggleDriverStatus(driver.id)
      if (response.success) {
        toast.success(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} tài xế thành công`)
        fetchDrivers()
      } else {
        toast.error(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} tài xế thất bại`)
      }
    } catch (error: any) {
      toast.error(error.payload?.message || `Lỗi khi ${action} tài xế`)
    }
  }

  const handleSubmit = async (e: React.FormEvent, uploadedImageUrl?: string) => {
    e.preventDefault()

    try {
      // Nếu có uploadedImageUrl từ upload, cập nhật vào formData
      const submitData = uploadedImageUrl 
        ? { ...formData, imageUrl: uploadedImageUrl }
        : formData

      if (isEditing && currentDriver) {
        const response = await driverService.updateDriver(currentDriver.id, submitData as UpdateDriverRequest)
        if (response.success) {
          toast.success("Cập nhật tài xế thành công")
          setIsDialogOpen(false)
          fetchDrivers()
        } else {
          toast.error(response.message || "Cập nhật thất bại")
        }
      } else {
        const response = await driverService.createDriver(submitData as CreateDriverRequest)
        if (response.success) {
          toast.success("Tạo tài xế thành công")
          setIsDialogOpen(false)
          fetchDrivers()
        } else {
          toast.error(response.message || "Tạo tài xế thất bại")
        }
      }
    } catch (error: any) {
      console.error('Error saving driver:', error)
      
      // Xử lý lỗi duplicate license number
      const errorMsg = error.payload?.message || error.message || ""
      if (errorMsg.toLowerCase().includes("duplicate") && errorMsg.toLowerCase().includes("license_number")) {
        toast.error("Số giấy phép lái xe đã tồn tại trong hệ thống")
      } else if (errorMsg.toLowerCase().includes("duplicate")) {
        toast.error("Thông tin đã tồn tại trong hệ thống")
      } else {
        toast.error(errorMsg || "Lỗi khi lưu tài xế")
      }
    }
  }

  const handleInputChange = (field: keyof CreateDriverRequest | keyof UpdateDriverRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const filteredDrivers = drivers.filter((driver) =>
    driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý tài xế</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin tài xế trong hệ thống</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, số điện thoại, GPLX..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2"
              >
                <FaPlus /> Thêm tài xế
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
                      <TableHead className="font-semibold">Ảnh</TableHead>
                      <TableHead className="font-semibold">Họ tên</TableHead>
                      <TableHead className="font-semibold">Số điện thoại</TableHead>
                      <TableHead className="font-semibold">GPLX</TableHead>
                      <TableHead className="font-semibold">Kinh nghiệm</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                          Không tìm thấy tài xế nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDrivers.map((driver) => (
                        <TableRow key={driver.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{driver.id}</TableCell>
                          <TableCell>
                            {driver.imageUrl ? (
                              <img
                                src={driver.imageUrl}
                                alt={driver.fullName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                <FaImage className="text-slate-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{driver.fullName}</TableCell>
                          <TableCell>{driver.phone}</TableCell>
                          <TableCell>{driver.licenseNumber}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                              {driver.experienceYears} năm
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              driver.isActive 
                                ? "bg-green-100 text-green-700" 
                                : "bg-orange-100 text-orange-700"
                            }`}>
                              {driver.isActive ? "Hoạt động" : "Đang nghỉ"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(driver)}
                                className="text-blue-950 hover:text-blue-900 hover:bg-blue-50"
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleStatus(driver)}
                                className={driver.isActive 
                                  ? "text-blue-900 hover:text-orange-700 hover:bg-orange-50"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                }
                                title={driver.isActive ? "Cho nghỉ" : "Kích hoạt"}
                              >
                                {driver.isActive ? <FaUserTimes /> : <FaUserCheck />}
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

      {/* Create Dialog */}
      {!isEditing && (
        <AddDriverDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData as CreateDriverRequest}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      )}

      {/* Edit Dialog */}
      {isEditing && (
        <EditDriverDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData as UpdateDriverRequest}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default AdminDriver


