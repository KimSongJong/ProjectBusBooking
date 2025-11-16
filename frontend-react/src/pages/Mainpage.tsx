import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, MapPin, ArrowLeftRight, Users, Star, Shield, Headphones } from "lucide-react"
// import { FaBus, FaTicketAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { RouteCard, PromotionCard, FeatureCard } from "@/components/layout"
import bannerImage from "@/assets/2257 x 501 px.png"

function MainPage() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("2025-10-14")
  const [passengers, setPassengers] = useState(1)

  const handleSearch = () => {
    navigate(`/product?from=${from}&to=${to}&date=${date}&passengers=${passengers}`)
  }

  const promotions = [
    { id: 1, image: "https://cdn.futabus.vn/futa-busline-web-cms-prod/2_343_x_184_px_x4_f3961edd19/2_343_x_184_px_x4_f3961edd19.png" },
    { id: 2, image: "https://cdn.futabus.vn/futa-busline-web-cms-prod/2_343_x_184_px_f365e0f9c8/2_343_x_184_px_f365e0f9c8.png" },
    { id: 3, image: "https://cdn.futabus.vn/futa-busline-web-cms-prod/2_343_x_184_px_x4_f3961edd19/2_343_x_184_px_x4_f3961edd19.png" },
  ]

  const popularRoutes = [
    {
      from: "TP.Hồ Chí Minh",
      routes: [
        { to: "Đà Lạt", price: "350.000đ", distance: "310km", duration: "11 giờ" },
        { to: "Cần Thơ", price: "200.000đ", distance: "167km", duration: "4 giờ 30 phút" },
        { to: "Long Xuyên", price: "200.000đ", distance: "186km", duration: "5 giờ" },
      ],
      image: "https://cdn.futabus.vn/futa-busline-cms-dev/Rectangle_23_2_8bf6ed1d78/Rectangle_23_2_8bf6ed1d78.png"
    },
    {
      from: "Đà Lạt",
      routes: [
        { to: "TP.Hồ Chí Minh", price: "300.000đ", distance: "293km", duration: "8 giờ" },
        { to: "Đà Nẵng", price: "800.000đ", distance: "757km", duration: "17 giờ" },
        { to: "Cần Thơ", price: "500.000đ", distance: "457km", duration: "11 giờ" },
      ],
      image: "https://cdn.futabus.vn/futa-busline-cms-dev/Rectangle_23_3_2d8ce855bc/Rectangle_23_3_2d8ce855bc.png"
    },
    {
      from: "Đà Nẵng",
      routes: [
        { to: "Đà Lạt", price: "700.000đ", distance: "666km", duration: "17 giờ" },
        { to: "TP.Hồ Chí Minh", price: "900.000đ", distance: "850km", duration: "23 giờ" },
        { to: "Nha Trang", price: "500.000đ", distance: "543km", duration: "12 giờ" },
      ],
      image: "https://cdn.futabus.vn/futa-busline-cms-dev/Rectangle_23_4_061f4249f6/Rectangle_23_4_061f4249f6.png"
    },
  ]

  return (
    <>
      <Header />

      {/* Hero Banner with Search Form */}
      <div className="relative overflow-visible mb-32 mt-6 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Background Banner Image - Full height */}
          <div 
            className="w-full h-[500px] bg-cover bg-center overflow-hidden"
            style={{ 
              backgroundImage: `url(${bannerImage})`,
              borderRadius: '25px'
            }}
          >
          </div>
          
          {/* Search Form - Positioned at bottom, overlapping 1/8 of image */}
          <div className="absolute bottom-[-62.5px] left-0 right-0 z-10 w-full px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">

            {/* Search Form */}
            <Card className="shadow-2xl max-w-5xl mx-auto">
              <CardContent className="p-6">
                {/* Trip Type */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="oneWay"
                      checked={tripType === "oneWay"}
                      onChange={() => setTripType("oneWay")}
                      className="w-4 h-4 text-blue-900"
                    />
                    <Label htmlFor="oneWay" className="cursor-pointer">Một chiều</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="roundTrip"
                      checked={tripType === "roundTrip"}
                      onChange={() => setTripType("roundTrip")}
                      className="w-4 h-4 text-blue-900"
                    />
                    <Label htmlFor="roundTrip" className="cursor-pointer">Khứ hồi</Label>
                  </div>
                </div>

                {/* Search Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  {/* Điểm đi */}
                  <div className="space-y-2">
                    <Label htmlFor="from" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-900" />
                      Điểm đi
                    </Label>
                    <Select value={from} onValueChange={setFrom}>
                      <SelectTrigger id="from">
                        <SelectValue placeholder="Chọn điểm đi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                        <SelectItem value="dalat">Đà Lạt</SelectItem>
                        <SelectItem value="danang">Đà Nẵng</SelectItem>
                        <SelectItem value="cantho">Cần Thơ</SelectItem>
                        <SelectItem value="nhatrang">Nha Trang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Swap Button */}
                  <div className="flex items-end justify-center pb-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-blue-900"
                      onClick={() => {
                        const temp = from
                        setFrom(to)
                        setTo(temp)
                      }}
                    >
                      <ArrowLeftRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Điểm đến */}
                  <div className="space-y-2">
                    <Label htmlFor="to" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-900" />
                      Điểm đến
                    </Label>
                    <Select value={to} onValueChange={setTo}>
                      <SelectTrigger id="to">
                        <SelectValue placeholder="Chọn điểm đến" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dalat">Đà Lạt</SelectItem>
                        <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                        <SelectItem value="danang">Đà Nẵng</SelectItem>
                        <SelectItem value="cantho">Cần Thơ</SelectItem>
                        <SelectItem value="nhatrang">Nha Trang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ngày đi */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-900" />
                      Ngày đi
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  {/* Số vé */}
                  <div className="space-y-2">
                    <Label htmlFor="passengers" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-900" />
                      Số vé
                    </Label>
                    <Select value={passengers.toString()} onValueChange={(v) => setPassengers(Number(v))}>
                      <SelectTrigger id="passengers">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Button */}
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-blue-900 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                >
                  Tìm chuyến xe
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>

      {/* Promotions Section */}
      <div className="bg-white py-12">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              KHUYẾN MÃI NỔI BẬT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <PromotionCard key={promo.id} id={promo.id} image={promo.image} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="bg-gray-50 py-12">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                TUYẾN PHỔ BIẾN
              </h2>
              <p className="text-gray-600">Được khách hàng tin tưởng và lựa chọn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularRoutes.map((route, idx) => (
                <RouteCard
                  key={idx}
                  from={route.from}
                  routes={route.routes}
                  image={route.image}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">
                TPT BUS LINES - CHẤT LƯỢNG LÀ DANH DỰ
              </h2>
              <p className="text-orange-100">Được khách hàng tin tưởng và lựa chọn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">20+</div>
                <div className="text-xl font-semibold mb-2">Triệu</div>
                <div className="text-2xl font-bold mb-2">Lượt khách</div>
                <p className="text-sm text-orange-100">
                  TPT Bus Lines phục vụ hơn 20 triệu lượt khách bình quân 1 năm trên toàn quốc
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold mb-2">350+</div>
                <div className="text-xl font-semibold mb-2">Phòng vé</div>
                <div className="text-2xl font-bold mb-2">Bưu cục</div>
                <p className="text-sm text-orange-100">
                  TPT Bus Lines có hơn 350 phòng vé, trạm trung chuyển, bến xe,... trên toàn hệ thống
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold mb-2">1,000+</div>
                <div className="text-xl font-semibold mb-2">Chuyến xe</div>
                <div className="text-2xl font-bold mb-2">Mỗi ngày</div>
                <p className="text-sm text-orange-100">
                  TPT Bus Lines phục vụ hơn 1,000 chuyến xe đường dài và liên tỉnh mỗi ngày
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white py-12">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Tại sao chọn TPT Bus Lines?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Star}
                title="Chất lượng hàng đầu"
                description="24 năm kinh nghiệm, đội xe hiện đại, an toàn và thoải mái"
              />

              <FeatureCard
                icon={Shield}
                title="Cam kết an toàn"
                description="Bảo hiểm toàn diện, lái xe chuyên nghiệp, tuân thủ an toàn giao thông"
              />

              <FeatureCard
                icon={Headphones}
                title="Hỗ trợ 24/7"
                description="Hotline 1900 6067 luôn sẵn sàng hỗ trợ khách hàng mọi lúc"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default MainPage
