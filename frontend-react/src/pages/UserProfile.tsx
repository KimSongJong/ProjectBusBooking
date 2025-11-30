import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { API_BASE_URL } from "@/config/constants"
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaKey } from "react-icons/fa"

// Helper function to make API calls with CUSTOMER token only (not admin)
async function customerApi<T = any>(method: string, path: string, data?: any): Promise<T> {
  const token = localStorage.getItem("access_token") // ← Force customer token
  const url = `${API_BASE_URL}${path}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const options: RequestInit = {
    method,
    headers
  }

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const error: any = new Error(response.statusText)
    error.status = response.status
    throw error
  }

  return response.json()
}

interface UserProfile {
  id: number
  username: string
  email: string
  fullName: string
  phone: string
  isActive: boolean
  emailVerified: boolean
}

function UserProfile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Profile form
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem trang này")
      navigate("/login")
      return
    }

    fetchProfile()
  }, [user, navigate])

  const fetchProfile = async () => {
    try {
      const response = await customerApi("GET", "/users/me")
      if (response.success && response.data) {
        setProfile(response.data)
        setFullName(response.data.fullName || "")
        setPhone(response.data.phone || "")
        setEmail(response.data.email || "")
      }
    } catch (err: any) {
      toast.error("Không thể tải thông tin người dùng")
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await customerApi("PUT", "/users/me", {
        fullName,
        phone,
        email
      })

      if (response.success) {
        toast.success("Cập nhật thông tin thành công!")
        setProfile(response.data)
        if (updateUser) {
          updateUser(response.data)
        }
      }
    } catch (err: any) {
      toast.error("Không thể cập nhật thông tin")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!")
      return
    }

    setLoading(true)

    try {
      const response = await customerApi("PUT", "/auth/change-password", {
        currentPassword,
        newPassword
      })

      if (response.success) {
        toast.success("Đổi mật khẩu thành công!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err: any) {
      toast.error("Không thể đổi mật khẩu")
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-orange-50 -mt-6">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-blue-950">Thông tin cá nhân</h1>
              <p className="text-gray-600 mt-2">Quản lý thông tin và bảo mật tài khoản của bạn</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">
                  <FaUser className="mr-2" />
                  Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger value="password">
                  <FaLock className="mr-2" />
                  Đổi mật khẩu
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="p-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="username" className="flex items-center gap-2">
                          <FaUser className="text-blue-950" />
                          Tên đăng nhập
                        </Label>
                        <Input
                          id="username"
                          value={profile.username}
                          disabled
                          className="mt-2 bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Không thể thay đổi tên đăng nhập</p>
                      </div>

                      <div>
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <FaUser className="text-blue-950" />
                          Họ và tên
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="mt-2"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <FaEnvelope className="text-blue-950" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-2"
                          placeholder="Nhập email"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <FaPhone className="text-blue-950" />
                          Số điện thoại
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-2"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded ${profile.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {profile.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                        </span>
                        <span className={`px-2 py-1 rounded ${profile.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {profile.emailVerified ? 'Email đã xác thực' : 'Email chưa xác thực'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-blue-950 hover:bg-blue-900"
                        disabled={loading}
                      >
                        <FaSave className="mr-2" />
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password">
                <Card className="p-6">
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword" className="flex items-center gap-2">
                          <FaLock className="text-blue-950" />
                          Mật khẩu hiện tại
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="mt-2"
                          placeholder="Nhập mật khẩu hiện tại"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="newPassword" className="flex items-center gap-2">
                          <FaKey className="text-blue-950" />
                          Mật khẩu mới
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-2"
                          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                          <FaKey className="text-blue-950" />
                          Xác nhận mật khẩu mới
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="mt-2"
                          placeholder="Nhập lại mật khẩu mới"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-900">
                        <strong>Lưu ý:</strong> Sau khi đổi mật khẩu thành công, bạn cần đăng nhập lại với mật khẩu mới.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-blue-950 hover:bg-blue-900"
                        disabled={loading}
                      >
                        <FaKey className="mr-2" />
                        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default UserProfile

