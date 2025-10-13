import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, MapPin, ArrowLeftRight, Users, Clock } from "lucide-react"
import { FaBus } from "react-icons/fa"
import Header from "@/components/header"
import Footer from "@/components/footer"

function Product() {
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay")
  const [passengers, setPassengers] = useState(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white py-12">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/futa-group-logo.png" alt="FUTA Group" className="h-12" />
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-yellow-300 text-4xl">24</span>
                <span className="text-green-600">VỮNG TIN & PHÁT TRIỂN</span>
              </h2>
            </div>
          </div>
          <div className="flex justify-center gap-8">
            <FaBus className="text-6xl animate-bounce" />
            <FaBus className="text-8xl" />
            <FaBus className="text-6xl animate-bounce" />
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="w-full px-4 md:px-8 lg:px-12 -mt-16 mb-8">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-2xl">
          <CardContent className="p-6">
            {/* Trip Type */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="oneWay"
                  checked={tripType === "oneWay"}
                  onChange={() => setTripType("oneWay")}
                  className="w-4 h-4 text-orange-600"
                />
                <Label htmlFor="oneWay" className="cursor-pointer">Một chiều</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="roundTrip"
                  checked={tripType === "roundTrip"}
                  onChange={() => setTripType("roundTrip")}
                  className="w-4 h-4 text-orange-600"
                />
                <Label htmlFor="roundTrip" className="cursor-pointer">Khứ hồi</Label>
              </div>
              <a href="#" className="ml-auto text-orange-600 text-sm hover:underline">
                Hướng dẫn mua vé
              </a>
            </div>

            {/* Search Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Điểm đi */}
              <div className="space-y-2">
                <Label htmlFor="from" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Điểm đi
                </Label>
                <Select defaultValue="binhthuan">
                  <SelectTrigger id="from">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binhthuan">Bình Thuận</SelectItem>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                    <SelectItem value="haiphong">Hải Phòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <div className="flex items-end justify-center pb-2">
                <Button variant="ghost" size="icon" className="text-orange-600">
                  <ArrowLeftRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Điểm đến */}
              <div className="space-y-2">
                <Label htmlFor="to" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Điểm đến
                </Label>
                <Select defaultValue="hcm">
                  <SelectTrigger id="to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                    <SelectItem value="haiphong">Hải Phòng</SelectItem>
                    <SelectItem value="binhthuan">Bình Thuận</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ngày đi */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Ngày đi
                </Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue="2025-10-11"
                  className="border-gray-300"
                />
              </div>
            </div>

            {/* Số vé */}
            <div className="mb-6">
              <Label htmlFor="passengers" className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-orange-600" />
                Số vé
              </Label>
              <Select value={passengers.toString()} onValueChange={(v) => setPassengers(Number(v))}>
                <SelectTrigger id="passengers" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} vé
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Search */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <Label className="text-sm text-gray-700 mb-2 block">Tìm kiếm gần đây</Label>
              <Button variant="outline" size="sm" className="text-sm">
                Bình Thuận - TP. Hồ Chí Minh
                <span className="ml-2 text-gray-500">11/10/2025</span>
              </Button>
            </div>

            {/* Search Button */}
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold">
              Tìm chuyến xe
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Available Trips */}
      <div className="w-full px-4 md:px-8 lg:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Các chuyến xe khả dụng</h2>
        
        <div className="space-y-4">
          {/* Trip Card */}
          {[
            { time: "06:00", duration: "6h 30m", price: "250,000", seats: 15, type: "Giường nằm" },
            { time: "08:30", duration: "6h 30m", price: "250,000", seats: 8, type: "Giường nằm" },
            { time: "10:00", duration: "6h 30m", price: "280,000", seats: 20, type: "Limousine" },
            { time: "14:00", duration: "6h 30m", price: "250,000", seats: 12, type: "Giường nằm" },
            { time: "20:00", duration: "6h 30m", price: "280,000", seats: 5, type: "Limousine" },
          ].map((trip, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <FaBus className="text-4xl text-orange-600" />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-orange-600">{trip.time}</span>
                        <Badge variant="secondary">{trip.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{trip.duration}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Còn {trip.seats} chỗ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Giá vé từ</div>
                    <div className="text-2xl font-bold text-orange-600 mb-3">
                      {trip.price} ₫
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700 px-8">
                      Chọn chuyến
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Product
