import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Globe, FileText } from "lucide-react"
import { toast } from "sonner"

function Contact() {
  const [formData, setFormData] = useState({
    subject: "",
    name: "",
    email: "",
    phone: "",
    title: "",
    note: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.subject || !formData.name || !formData.email || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    // TODO: Send to API
    console.log("Form data:", formData)
    toast.success("Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.")
    
    // Reset form
    setFormData({
      subject: "",
      name: "",
      email: "",
      phone: "",
      title: "",
      note: ""
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Side - Company Info */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                LIÊN HỆ VỚI CHÚNG TÔI
              </h2>

              <div className="mb-8">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-orange-500 font-bold">▶</span>
                  <span className="text-gray-600 font-semibold">TPT BUS LINES</span>
                </div>

                <h3 className="text-xl font-bold text-orange-500 mb-4">
                  CÔNG TY CỔ PHẦN XE KHÁCH<br />
                  TÂM PHÚC TÀI - TPT BUS LINES
                </h3>

                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold">Địa chỉ:</span> 486-486A Lê Văn Lương, Phường Tân Hưng, TP.HCM, Việt Nam.
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="text-orange-500 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold">Website:</span>{" "}
                      <a href="https://tptbus.vn" className="text-orange-500 hover:underline">
                        https://tptbus.vn/
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-orange-500 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold">Điện thoại:</span> 02838386852
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="text-orange-500 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold">Fax:</span> 02838386853
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="text-orange-500 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold">Email:</span>{" "}
                      <a href="mailto:contact@tptbus.vn" className="text-orange-500 hover:underline">
                        contact@tptbus.vn
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-orange-500 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold">Hotline:</span>{" "}
                      <a href="tel:19006067" className="text-2xl font-bold text-orange-500">
                        19006067
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Mail className="text-orange-500" size={28} />
                    <h2 className="text-2xl font-bold text-orange-500">
                      Gửi thông tin liên hệ đến chúng tôi
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Subject Dropdown */}
                    <div>
                      <Label htmlFor="subject" className="text-gray-700">
                        Chủ đề <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.subject} onValueChange={(value) => handleChange("subject", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="TPT BUS LINES" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">TPT BUS LINES</SelectItem>
                          <SelectItem value="booking">Đặt vé</SelectItem>
                          <SelectItem value="complaint">Khiếu nại</SelectItem>
                          <SelectItem value="feedback">Góp ý</SelectItem>
                          <SelectItem value="cooperation">Hợp tác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Name and Email */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700">
                          Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Họ và tên"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone and Title */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-gray-700">
                          Điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Điện thoại"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="title" className="text-gray-700">
                          Nhập Tiêu đề
                        </Label>
                        <Input
                          id="title"
                          placeholder="Nhập Tiêu đề"
                          value={formData.title}
                          onChange={(e) => handleChange("title", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Note */}
                    <div>
                      <Label htmlFor="note" className="text-gray-700">
                        Nhập ghi chú
                      </Label>
                      <Textarea
                        id="note"
                        placeholder="Nhập ghi chú"
                        value={formData.note}
                        onChange={(e) => handleChange("note", e.target.value)}
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                      <Button 
                        type="submit"
                        className="bg-blue-600 hover:bg-orange-500 text-white px-12 py-6 text-lg rounded-full"
                      >
                        Gửi
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Contact
