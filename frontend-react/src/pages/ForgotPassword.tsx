import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import api from "@/config/axios"
import { FaEnvelope, FaUser, FaArrowLeft } from "react-icons/fa"

function ForgotPassword() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post("/auth/forgot-password", {
        username,
        email
      })

      if (response.success) {
        setSuccess(true)
        toast.success("Mật khẩu tạm thời đã được gửi đến email của bạn!")
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        toast.error(response.message || "Không tìm thấy tài khoản với thông tin này")
      }
    } catch (err: any) {
      const errorMessage = err.payload?.message || err.message || "Có lỗi xảy ra"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-orange-50 -mt-6">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8 shadow-xl border-orange-100">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <FaEnvelope className="text-3xl text-blue-950" />
                </div>
                <h2 className="text-2xl font-bold text-blue-950 mb-2">Quên mật khẩu?</h2>
                <p className="text-gray-600">
                  Nhập tên đăng nhập và email để nhận mật khẩu tạm thời
                </p>
              </div>

              {success ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-600 mb-2">Thành công!</h3>
                  <p className="text-gray-600 mb-4">
                    Mật khẩu tạm thời đã được gửi đến email của bạn.
                    <br />
                    Vui lòng kiểm tra hộp thư và đăng nhập.
                  </p>
                  <p className="text-sm text-gray-500">Đang chuyển đến trang đăng nhập...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <FaUser className="text-blue-950" />
                      Tên đăng nhập
                    </Label>
                    <Input
                      id="username"
                      placeholder="Nhập tên đăng nhập của bạn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-2"
                      required
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
                      placeholder="Nhập email đã đăng ký"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Lưu ý:</strong> Mật khẩu tạm thời gồm 6 chữ số sẽ được gửi đến email của bạn.
                      Vui lòng đổi mật khẩu sau khi đăng nhập thành công.
                    </p>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-blue-950 hover:bg-blue-900"
                      disabled={loading}
                    >
                      {loading ? "Đang xử lý..." : "Gửi mật khẩu tạm thời"}
                    </Button>

                    <Link to="/login">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        <FaArrowLeft className="mr-2" />
                        Quay lại đăng nhập
                      </Button>
                    </Link>
                  </div>
                </form>
              )}
            </Card>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-blue-950 font-semibold hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ForgotPassword

