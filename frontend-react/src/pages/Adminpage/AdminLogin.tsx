import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import authService from "@/services/auth.service"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { FaBus } from "react-icons/fa"

function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { login: setAuthUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await authService.login({ username, password })
      
      if (response.success && response.data) {
        // Check if user has admin or staff role
        if (response.data.role === "admin" || response.data.role === "staff") {
          setAuthUser(response.data)
          toast.success(`Chào mừng quản trị viên ${response.data.fullName}!`)
          // Redirect to admin dashboard
          setTimeout(() => {
            navigate("/admin/dashboard")
          }, 500)
        } else {
          setError("Bạn không có quyền truy cập trang quản trị")
          toast.error("Bạn không có quyền truy cập trang quản trị")
          // Logout the user
          await authService.logout()
        }
      } else {
        setError(response.message || "Đăng nhập thất bại")
        toast.error(response.message || "Đăng nhập thất bại")
      }
    } catch (err: any) {
      const errorMessage = err.payload?.message || err.message || "Lỗi kết nối đến server"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTEwdjJIMjR2LTJoMTJ6bTAtMTB2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl shadow-2xl mb-4">
            <FaBus className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">TPT Bus Lines - Hệ thống quản trị</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Đăng nhập quản trị</h2>

            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="username" className="text-slate-200">
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-950 focus:ring-blue-950"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-slate-200">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-950 focus:ring-blue-950"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link to="/admin/forgot-password" className="text-orange-400 hover:text-orange-300 transition">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-orange-700 text-white font-semibold py-3 shadow-lg shadow-blue-950/30"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Đang xử lý...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-white/5 px-8 py-4 border-t border-white/10">
            <p className="text-center text-slate-400 text-sm">
              Trang khách hàng?{" "}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium transition">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            🔒 Trang quản trị được bảo mật. Chỉ dành cho nhân viên và quản lý.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin


