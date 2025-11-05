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
import { FaPlus, FaEdit, FaSearch, FaKey, FaLock, FaLockOpen } from "react-icons/fa"
import userService from "@/services/user.service"
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types/user.types"
import AddAccountDialog from "@/components/layout/admin/addAccount"
import EditAccountDialog from "@/components/layout/admin/editAccount"
import ChangePasswordDialog from "@/components/layout/admin/changePass"

function AdminAccount() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    password: "",
    email: "",
    role: "customer",
    fullName: "",
    phone: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAllUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách người dùng")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentUser(null)
    setFormData({
      username: "",
      password: "",
      email: "",
      role: "customer",
      fullName: "",
      phone: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setIsEditing(true)
    setCurrentUser(user)
    setFormData({
      username: user.username,
      password: "", // Not used in edit mode
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
    })
    setIsDialogOpen(true)
  }

  const handleChangePassword = (user: User) => {
    setCurrentUser(user)
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    })
    setIsPasswordDialogOpen(true)
  }

  const handleToggleStatus = async (user: User) => {
    const action = user.isActive ? "khóa" : "mở khóa"
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${user.fullName}"?`)) return

    try {
      const response = await userService.toggleUserStatus(user.id)
      if (response.success) {
        toast.success(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`)
        fetchUsers()
      } else {
        toast.error(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thất bại`)
      }
    } catch (error: any) {
      toast.error(error.payload?.message || `Lỗi khi ${action} tài khoản`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isEditing && currentUser) {
        // When editing, don't send password - it's handled separately
        const updateData: UpdateUserRequest = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          fullName: formData.fullName,
          phone: formData.phone,
        }
        
        const response = await userService.updateUser(currentUser.id, updateData)
        if (response.success) {
          toast.success("Cập nhật người dùng thành công")
          setIsDialogOpen(false)
          fetchUsers()
        } else {
          toast.error(response.message || "Cập nhật thất bại")
        }
      } else {
        // When creating, password is required
        const response = await userService.createUser(formData)
        if (response.success) {
          toast.success("Tạo người dùng thành công")
          setIsDialogOpen(false)
          fetchUsers()
        } else {
          toast.error(response.message || "Tạo người dùng thất bại")
        }
      }
    } catch (error: any) {
      toast.error(error.payload?.message || "Lỗi khi lưu người dùng")
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (!currentUser) return

    try {
      const updateData: UpdateUserRequest = {
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        password: passwordData.newPassword,
      }

      const response = await userService.updateUser(currentUser.id, updateData)
      if (response.success) {
        toast.success("Đổi mật khẩu thành công")
        setIsPasswordDialogOpen(false)
        setPasswordData({ newPassword: "", confirmPassword: "" })
      } else {
        toast.error(response.message || "Đổi mật khẩu thất bại")
      }
    } catch (error: any) {
      toast.error(error.payload?.message || "Lỗi khi đổi mật khẩu")
    }
  }

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      staff: "bg-blue-100 text-blue-700",
      customer: "bg-green-100 text-green-700",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý tài khoản</h1>
          <p className="text-slate-600 mt-1">Quản lý người dùng hệ thống</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              >
                <FaPlus /> Thêm người dùng
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
                      <TableHead className="font-semibold">Họ tên</TableHead>
                      <TableHead className="font-semibold">Username</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Số điện thoại</TableHead>
                      <TableHead className="font-semibold">Vai trò</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                          Không tìm thấy người dùng nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {user.isActive ? "Hoạt động" : "Đã khóa"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangePassword(user)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Đổi mật khẩu"
                              >
                                <FaKey />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleStatus(user)}
                                className={user.isActive 
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                }
                                title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              >
                                {user.isActive ? <FaLock /> : <FaLockOpen />}
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
        <AddAccountDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      )}

      {/* Edit Dialog */}
      {isEditing && (
        <EditAccountDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      )}

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open)
          if (!open) {
            setPasswordData({ newPassword: "", confirmPassword: "" })
          }
        }}
        userName={currentUser?.fullName || ""}
        passwordData={passwordData}
        onPasswordChange={(field, value) => setPasswordData((prev) => ({ ...prev, [field]: value }))}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  )
}

export default AdminAccount
