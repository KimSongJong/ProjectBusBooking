import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import authService from "@/services/auth.service"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

function Login() {
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
        // Update auth context
        setAuthUser(response.data)
        toast.success(`Chào mừng ${response.data.fullName}!`)

        // Check if there's a redirect URL from payment callback
        const redirectUrl = sessionStorage.getItem("redirect_after_login")
        if (redirectUrl) {
          sessionStorage.removeItem("redirect_after_login")
          setTimeout(() => {
            window.location.href = redirectUrl // Use window.location to preserve query params
          }, 500)
        } else {
          // Redirect to home page after successful login
          setTimeout(() => {
            navigate("/")
          }, 500)
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white -mt-6">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left - branding / illustration */}
              <div className="p-10 bg-[url('/src/assets/bus-bg.svg')] bg-no-repeat bg-left-bottom relative">
                <div className="max-w-md">
                  <h2 className="text-3xl font-extrabold text-green-800 mb-3">PHƯƠNG TRANG</h2>
                  <p className="text-xl text-blue-950 font-medium mb-6">Cùng bạn trên mọi nẻo đường</p>

                  <div className="text-green-800 text-2xl font-bold leading-relaxed">
                    XE TRUNG CHUYỂN
                    <br />
                    ĐÓN - TRẢ TẬN NƠI
                  </div>
                </div>

                {/* decorative bus illustration fallback (small circle) */}
                <div className="absolute right-6 bottom-6 w-40 h-40 rounded-full bg-orange-50 border border-orange-100" />
              </div>

              {/* Right - form */}
              <div className="p-8 md:p-12">
                <h3 className="text-2xl font-semibold mb-6">Đăng nhập tài khoản</h3>

                <div className="mb-6">
                  <div className="flex gap-6 items-center border-b-2 border-orange-100 pb-3">
                    <button className="text-blue-950 font-semibold border-b-2 border-blue-950 pb-1">ĐĂNG NHẬP</button>
                    <Link to="/register" className="text-gray-400 hover:text-orange-400 transition">ĐĂNG KÝ</Link>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                      id="username"
                      placeholder="Nhập tên đăng nhập"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <Link to="/forgot-password" className="text-sm text-blue-950 hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-950 hover:bg-blue-900"
                      disabled={loading}
                    >
                      {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Login
