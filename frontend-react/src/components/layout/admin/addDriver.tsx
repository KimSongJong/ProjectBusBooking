import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaSave, FaTimes, FaTrash } from "react-icons/fa"
import { useState, useRef } from "react"
import type { CreateDriverRequest } from "@/types/driver.types"
import driverService from "@/services/driver.service"
import { toast } from "sonner"

interface AddDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateDriverRequest
  onInputChange: (field: keyof CreateDriverRequest, value: string | number) => void
  onSubmit: (e: React.FormEvent, uploadedImageUrl?: string) => void
}

export default function AddDriverDialog({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
}: AddDriverDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file ảnh")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!imageFile) {
      return null
    }

    try {
      setUploading(true)
      const response = await driverService.uploadImage(imageFile, 'drivers')
      if (response.success && response.data) {
        return response.data.url
      } else {
        toast.error("Upload ảnh thất bại")
        return null
      }
    } catch (error: any) {
      toast.error(error.payload?.message || "Lỗi khi upload ảnh")
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Upload ảnh trước nếu có file mới và chưa upload
      if (imageFile && !formData.imageUrl) {
        setUploading(true)
        const uploadedUrl = await handleUploadImage()
        setUploading(false)
        
        if (!uploadedUrl) {
          toast.error("Vui lòng upload ảnh thành công trước khi lưu")
          return
        }
        
        // Truyền uploadedUrl trực tiếp cho onSubmit
        onSubmit(e, uploadedUrl)
      } else {
        // Không có ảnh hoặc đã upload rồi, submit luôn
        onSubmit(e)
      }
    } catch (error) {
      setUploading(false)
      toast.error("Có lỗi xảy ra khi xử lý ảnh")
    }
  }

  const handleRemoveImage = async () => {
    if (formData.imageUrl) {
      try {
        await driverService.deleteImage(formData.imageUrl)
        onInputChange('imageUrl', '')
        setImageFile(null)
        setImagePreview("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        toast.success("Đã xóa ảnh")
      } catch (error) {
        toast.error("Lỗi khi xóa ảnh")
      }
    } else {
      setImageFile(null)
      setImagePreview("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setImageFile(null)
      setImagePreview("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">Thêm tài xế mới</DialogTitle>
          <DialogDescription>Điền thông tin để thêm tài xế mới vào hệ thống</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => onInputChange("fullName", e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onInputChange("phone", e.target.value)}
                placeholder="0987654321"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                Số giấy phép lái xe <span className="text-red-500">*</span>
              </Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => onInputChange("licenseNumber", e.target.value)}
                placeholder="B2-123456"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">
                Số năm kinh nghiệm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => onInputChange("experienceYears", parseInt(e.target.value) || 0)}
                placeholder="5"
                required
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2 border-t pt-4">
            <Label>Ảnh tài xế</Label>
            <div className="space-y-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              
              {imagePreview && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {formData.imageUrl && !imagePreview && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={formData.imageUrl}
                    alt="Uploaded"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {imageFile && !formData.imageUrl && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  ℹ Ảnh sẽ được upload tự động khi bạn nhấn "Lưu tài xế"
                </div>
              )}

              {formData.imageUrl && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  ✓ Ảnh đã được upload thành công
                </div>
              )}

              {(imageFile || formData.imageUrl) && (
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <FaTrash className="mr-2" />
                  Xóa ảnh
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              className="flex items-center gap-2"
            >
              <FaTimes /> Hủy
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
            >
              <FaSave /> {uploading ? "Đang upload ảnh..." : "Lưu tài xế"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
