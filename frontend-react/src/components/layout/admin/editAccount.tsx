import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CreateUserRequest } from "@/types/user.types"

interface EditAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CreateUserRequest
  onInputChange: (field: keyof CreateUserRequest, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function EditAccountDialog({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
}: EditAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              disabled
              className="bg-slate-100 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Không thể sửa username</p>
          </div>

          <div>
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => onInputChange("fullName", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Vai trò</Label>
            <Select value={formData.role} disabled>
              <SelectTrigger className="bg-slate-100 cursor-not-allowed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">Không thể sửa vai trò</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
