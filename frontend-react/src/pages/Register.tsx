import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import authService from "@/services/auth.service"
import { toast } from "sonner"
import type { UserRegisterRequest } from "@/types/auth.types"

function Register() {
  const [formData, setFormData] = useState<UserRegisterRequest & { confirmPassword: string }>({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống"
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự"
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống"
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    setLoading(true)

    try {
      // Remove confirmPassword and add default role "customer"
      const { confirmPassword, ...registerData } = formData
      const response = await authService.register({
        ...registerData,
        role: "customer",
      })

      if (response.success) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
        setTimeout(() => {
          navigate("/login")
        }, 1000)
      } else {
        toast.error(response.message || "Đăng ký thất bại")
        // Set backend error messages if available
        if (response.message.includes("Username")) {
          setErrors(prev => ({ ...prev, username: response.message }))
        } else if (response.message.includes("Email")) {
          setErrors(prev => ({ ...prev, email: response.message }))
        }
      }
    } catch (err: any) {
      const errorMessage = err.payload?.message || err.message || "Lỗi kết nối đến server"
      toast.error(errorMessage)
      setErrors(prev => ({ ...prev, general: errorMessage }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-orange-50 to-white -mt-6 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100">
            <div className="bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Đăng ký tài khoản</h2>
              <p className="text-orange-100">Tạo tài khoản để đặt vé xe khách trực tuyến</p>
            </div>

            <div className="p-8">
              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div>
                  <Label htmlFor="username">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={handleChange}
                    className={`mt-2 ${errors.username ? "border-red-500" : ""}`}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`mt-2 ${errors.fullName ? "border-red-500" : ""}`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-2 ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`mt-2 ${errors.phone ? "border-red-500" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-2 ${errors.password ? "border-red-500" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-2 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-950 hover:bg-blue-900 text-white font-semibold py-3"
                    disabled={loading}
                  >
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4 border-t">
                  <p className="text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-blue-950 font-semibold hover:underline">
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Register
