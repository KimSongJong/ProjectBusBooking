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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { FaPlus, FaEdit, FaSearch, FaSave, FaTimes, FaTag, FaPercent, FaTrash } from "react-icons/fa"
import promotionService from "@/services/promotion.service"
import type { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from "@/types/promotion.types"

function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState<CreatePromotionRequest | UpdatePromotionRequest>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minAmount: 0,
    maxDiscount: undefined,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    isActive: true,
    applicableToRoundTrip: false,
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      console.log("🎫 Fetching promotions...")
      setLoading(true)
      const response = await promotionService.getAllPromotions()
      console.log("📥 Promotions response:", response)
      console.log("📥 Response type:", typeof response, Array.isArray(response))

      // Handle both wrapped {success, data} and unwrapped array responses
      let promotionsData: Promotion[] = []

      if (Array.isArray(response)) {
        // Direct array response
        console.log("✅ Direct array response")
        promotionsData = response
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Wrapped response {success, data}
        console.log("✅ Wrapped response")
        promotionsData = response.data || []
      }

      console.log("✅ Promotions loaded:", promotionsData.length, "items")
      setPromotions(promotionsData)
    } catch (error: any) {
      console.error("❌ Error fetching promotions:", error)
      console.error("Error status:", error.status)
      console.error("Error payload:", error.payload)
      toast.error("Không thể tải danh sách khuyến mãi")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentPromotion(null)
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minAmount: 0,
      maxDiscount: undefined,
      startDate: "",
      endDate: "",
      usageLimit: 0,
      isActive: true,
      applicableToRoundTrip: false,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (promotion: Promotion) => {
    setIsEditing(true)
    setCurrentPromotion(promotion)
    setFormData({
      code: promotion.code,
      description: promotion.description || "",
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      minAmount: promotion.minAmount,
      maxDiscount: promotion.maxDiscount,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      usageLimit: promotion.usageLimit,
      isActive: promotion.isActive ?? true,
      applicableToRoundTrip: promotion.applicableToRoundTrip || false,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.discountValue || formData.discountValue <= 0) {
      toast.error("Vui lòng nhập giá trị giảm giá")
      return
    }

    try {
      // ⭐ Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
      const requestData = {
        ...formData,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00` : "",
        endDate: formData.endDate ? `${formData.endDate}T23:59:59` : "",
      }

      console.log("📤 Sending promotion data:", requestData)

      if (isEditing && currentPromotion) {
        const response = await promotionService.updatePromotion(currentPromotion.id, requestData as UpdatePromotionRequest)
        if (response.success) {
          toast.success("Cập nhật khuyến mãi thành công")
          setIsDialogOpen(false)
          fetchPromotions()
        } else {
          toast.error(response.message || "Cập nhật thất bại")
        }
      } else {
        const response = await promotionService.createPromotion(requestData as CreatePromotionRequest)
        if (response.success) {
          toast.success("Tạo khuyến mãi thành công")
          setIsDialogOpen(false)
          fetchPromotions()
        } else {
          toast.error(response.message || "Tạo khuyến mãi thất bại")
        }
      }
    } catch (error: any) {
      console.error("❌ Error submitting promotion:", error)
      const errorMsg = error.payload?.message || error.message || ""
      if (errorMsg.toLowerCase().includes("duplicate") && errorMsg.toLowerCase().includes("code")) {
        toast.error("Mã khuyến mãi đã tồn tại trong hệ thống")
      } else if (errorMsg.toLowerCase().includes("datetime")) {
        toast.error("Định dạng ngày tháng không hợp lệ")
      } else {
        toast.error(errorMsg || "Lỗi khi lưu khuyến mãi")
      }
    }
  }

  const handleDelete = async (promotion: Promotion) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khuyến mãi "${promotion.code}"?`)) {
      return
    }

    try {
      const response = await promotionService.deletePromotion(promotion.id)
      if (response.success) {
        toast.success("Xóa khuyến mãi thành công")
        fetchPromotions()
      } else {
        toast.error(response.message || "Xóa khuyến mãi thất bại")
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa khuyến mãi")
    }
  }

  const filteredPromotions = promotions.filter((promotion) =>
    promotion.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const isActive = (promotion: Promotion) => {
    const now = new Date()
    const start = new Date(promotion.startDate)
    const end = new Date(promotion.endDate)
    return now >= start && now <= end && (promotion.usageLimit === null || promotion.usageLimit === undefined || promotion.usedCount < promotion.usageLimit)
  }

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.discountType === 'percentage') {
      return (
        <span className="flex items-center gap-1 text-green-600 font-semibold">
          <FaPercent className="text-xs" />
          {promotion.discountValue}%
        </span>
      )
    } else {
      return (
        <span className="text-green-600 font-semibold">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promotion.discountValue)}
        </span>
      )
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý khuyến mãi</h1>
          <p className="text-slate-600 mt-1">Quản lý chương trình khuyến mãi và ưu đãi</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo mã khuyến mãi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2"
              >
                <FaPlus /> Thêm khuyến mãi
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
                      <TableHead className="font-semibold">Mã KM</TableHead>
                      <TableHead className="font-semibold">Giảm giá</TableHead>
                      <TableHead className="font-semibold">Thời gian</TableHead>
                      <TableHead className="font-semibold">Lượt dùng</TableHead>
                      <TableHead className="font-semibold">Vé khứ hồi</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                          Không tìm thấy khuyến mãi nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPromotions.map((promotion) => (
                        <TableRow key={promotion.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{promotion.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FaTag className="text-blue-950" />
                              <span className="font-bold text-blue-900">{promotion.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDiscount(promotion)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(promotion.startDate)}</div>
                              <div className="text-slate-400">đến {formatDate(promotion.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {promotion.usedCount} / {promotion.usageLimit || '∞'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {promotion.applicableToRoundTrip ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                ✓ Khứ hồi
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                Không
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isActive(promotion) ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Đang hoạt động
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Hết hạn
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(promotion)}
                                className="text-blue-950 hover:text-blue-900 hover:bg-blue-50"
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(promotion)}
                                className="text-red-600 hover:text-red-500 hover:bg-red-50"
                                title="Xóa"
                              >
                                <FaTrash />
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
              {isEditing ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Cập nhật thông tin khuyến mãi" : "Điền thông tin để thêm khuyến mãi mới"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã khuyến mãi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả khuyến mãi (tuỳ chọn)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Loại giảm giá</Label>
                <select
                  id="discountType"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="block w-full p-2 border rounded-md focus:ring focus:ring-blue-500"
                >
                  <option value="percentage">Giảm theo phần trăm</option>
                  <option value="amount">Giảm theo số tiền</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">Giá trị giảm giá</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  value={formData.discountValue || ""}
                  onChange={(e) => setFormData({
                    ...formData, 
                    discountValue: e.target.value ? parseFloat(e.target.value) : undefined,
                  })}
                  placeholder="20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minAmount">Số tiền tối thiểu áp dụng</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Giảm giá tối đa (VND)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min="0"
                  value={formData.maxDiscount || ""}
                  onChange={(e) => setFormData({
                    ...formData, 
                    maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined,
                  })}
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="usageLimit">
                  Số lượt sử dụng tối đa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  required
                />
              </div>
            </div>

            {/* Round Trip Checkbox */}
            <div className="flex items-center space-x-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="applicableToRoundTrip"
                checked={formData.applicableToRoundTrip || false}
                onChange={(e) => setFormData({ ...formData, applicableToRoundTrip: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500"
              />
              <Label htmlFor="applicableToRoundTrip" className="text-sm font-medium text-purple-900 cursor-pointer">
                Áp dụng cho vé khứ hồi (khách đặt vé khứ hồi sẽ được giảm giá)
              </Label>
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
                className="bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2"
              >
                <FaSave /> {isEditing ? "Cập nhật" : "Lưu khuyến mãi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPromotions

