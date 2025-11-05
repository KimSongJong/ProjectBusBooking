import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
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
import { toast } from "sonner"
import Header from "@/components/header"
import Footer from "@/components/footer"
import tripService from "@/services/trip.service"
import routeService from "@/services/route.service"
import type { Trip } from "@/types/trip.types"
import type { Route } from "@/types/route.types"

function Product() {
  const [searchParams] = useSearchParams()
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay")
  const [passengers, setPassengers] = useState(1)
  const [fromLocation, setFromLocation] = useState(searchParams.get("from") || "")
  const [toLocation, setToLocation] = useState(searchParams.get("to") || "")
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0])
  const [trips, setTrips] = useState<Trip[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    fetchRoutes()
    // Nếu có params từ Schedule page, tự động tìm kiếmcòn
    if (searchParams.get("from") && searchParams.get("to")) {
      handleSearch()
    }
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAllRoutes()
      if (response.success && response.data) {
        setRoutes(response.data)
      }
    } catch (error) {
      console.error("Error fetching routes:", error)
    }
  }

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      toast.error("Vui lòng chọn điểm đi và điểm đến")
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)
      const response = await tripService.getAllTrips()
      if (response.success && response.data) {
        // Filter trips based on route and date
        const filteredTrips = response.data.filter(trip => {
          const matchRoute = 
            trip.route.fromLocation.toLowerCase() === fromLocation.toLowerCase() &&
            trip.route.toLocation.toLowerCase() === toLocation.toLowerCase()
          
          const tripDate = new Date(trip.departureTime).toISOString().split('T')[0]
          const matchDate = tripDate === searchDate
          
          // Only show scheduled trips
          const isScheduled = trip.status === 'scheduled'
          
          return matchRoute && matchDate && isScheduled
        })
        
        setTrips(filteredTrips)
        
        if (filteredTrips.length === 0) {
          toast.info("Không tìm thấy chuyến xe phù hợp")
        }
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast.error("Không thể tìm kiếm chuyến xe")
    } finally {
      setLoading(false)
    }
  }

  const getVehicleTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      standard: "Ghế",
      vip: "Ghế VIP",
      sleeper: "Giường nằm"
    }
    return labels[type] || type
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const handleSwapLocations = () => {
    const temp = fromLocation
    setFromLocation(toLocation)
    setToLocation(temp)
  }

  const getAvailableSeats = (trip: Trip) => {
    // This should come from backend, for now return a random number
    return Math.floor(Math.random() * 20) + 1
  }

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
                <Input
                  id="from"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="Nhập điểm đi"
                />
              </div>

              {/* Swap Button */}
              <div className="flex items-end justify-center pb-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-orange-600"
                  onClick={handleSwapLocations}
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Điểm đến */}
              <div className="space-y-2">
                <Label htmlFor="to" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Điểm đến
                </Label>
                <Input
                  id="to"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="Nhập điểm đến"
                />
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
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
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
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Đang tìm kiếm..." : "Tìm chuyến xe"}
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Available Trips */}
      <div className="w-full px-4 md:px-8 lg:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
        {hasSearched && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {trips.length > 0 
                ? `Tìm thấy ${trips.length} chuyến xe khả dụng`
                : "Không tìm thấy chuyến xe phù hợp"}
            </h2>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  <p className="mt-4 text-gray-600">Đang tìm kiếm chuyến xe...</p>
                </div>
              ) : trips.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    Không có chuyến xe nào phù hợp với tìm kiếm của bạn
                  </CardContent>
                </Card>
              ) : (
                trips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <FaBus className="text-4xl text-orange-600" />
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-orange-600">
                                {formatTime(trip.departureTime)}
                              </span>
                              <Badge variant="secondary">
                                {getVehicleTypeLabel(trip.vehicle.vehicleType)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{trip.route.estimatedDuration ? formatDuration(trip.route.estimatedDuration) : 'N/A'}</span>
                              </div>
                              <Separator orientation="vertical" className="h-4" />
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Còn {getAvailableSeats(trip)} chỗ</span>
                              </div>
                              <Separator orientation="vertical" className="h-4" />
                              <div>
                                <span className="font-medium">{trip.driver.fullName}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">Giá vé từ</div>
                          <div className="text-2xl font-bold text-orange-600 mb-3">
                            {formatPrice(Number(trip.route.basePrice))} ₫
                          </div>
                          <Button className="bg-orange-600 hover:bg-orange-700 px-8">
                            Chọn chuyến
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Product
