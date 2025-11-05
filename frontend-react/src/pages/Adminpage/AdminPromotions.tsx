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
import { FaPlus, FaEdit, FaSearch, FaSave, FaTimes, FaTag, FaPercent } from "react-icons/fa"
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
    discountPercentage: undefined,
    discountAmount: undefined,
    startDate: "",
    endDate: "",
    maxUses: 0,
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await promotionService.getAllPromotions()
      if (response.success && response.data) {
        setPromotions(response.data)
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách khuyến mãi")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentPromotion(null)
    setFormData({
      code: "",
      discountPercentage: undefined,
      discountAmount: undefined,
      startDate: "",
      endDate: "",
      maxUses: 0,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (promotion: Promotion) => {
    setIsEditing(true)
    setCurrentPromotion(promotion)
    setFormData({
      code: promotion.code,
      discountPercentage: promotion.discountPercentage,
      discountAmount: promotion.discountAmount,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      maxUses: promotion.maxUses,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: Phải có ít nhất discountPercentage hoặc discountAmount
    if (!formData.discountPercentage && !formData.discountAmount) {
      toast.error("Vui lòng nhập % giảm giá hoặc số tiền giảm")
      return
    }

    try {
      if (isEditing && currentPromotion) {
        const response = await promotionService.updatePromotion(currentPromotion.id, formData as UpdatePromotionRequest)
        if (response.success) {
          toast.success("Cập nhật khuyến mãi thành công")
          setIsDialogOpen(false)
          fetchPromotions()
        } else {
          toast.error(response.message || "Cập nhật thất bại")
        }
      } else {
        const response = await promotionService.createPromotion(formData as CreatePromotionRequest)
        if (response.success) {
          toast.success("Tạo khuyến mãi thành công")
          setIsDialogOpen(false)
          fetchPromotions()
        } else {
          toast.error(response.message || "Tạo khuyến mãi thất bại")
        }
      }
    } catch (error: any) {
      const errorMsg = error.payload?.message || error.message || ""
      if (errorMsg.toLowerCase().includes("duplicate") && errorMsg.toLowerCase().includes("code")) {
        toast.error("Mã khuyến mãi đã tồn tại trong hệ thống")
      } else {
        toast.error(errorMsg || "Lỗi khi lưu khuyến mãi")
      }
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
    return now >= start && now <= end && promotion.usedCount < promotion.maxUses
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
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
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
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                          Không tìm thấy khuyến mãi nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPromotions.map((promotion) => (
                        <TableRow key={promotion.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{promotion.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FaTag className="text-orange-500" />
                              <span className="font-bold text-orange-600">{promotion.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {promotion.discountPercentage && (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                <FaPercent className="text-xs" />
                                {promotion.discountPercentage}%
                              </span>
                            )}
                            {promotion.discountAmount && (
                              <span className="text-green-600 font-semibold">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promotion.discountAmount)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(promotion.startDate)}</div>
                              <div className="text-slate-400">đến {formatDate(promotion.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {promotion.usedCount} / {promotion.maxUses}
                            </span>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">% Giảm giá</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountPercentage || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    discountPercentage: e.target.value ? parseFloat(e.target.value) : undefined,
                    discountAmount: undefined // Clear amount khi nhập %
                  })}
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountAmount">Hoặc số tiền giảm (VND)</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  min="0"
                  value={formData.discountAmount || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    discountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    discountPercentage: undefined // Clear % khi nhập amount
                  })}
                  placeholder="50000"
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
                <Label htmlFor="maxUses">
                  Số lượt sử dụng tối đa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  required
                />
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
