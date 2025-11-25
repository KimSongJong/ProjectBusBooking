import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FaExchangeAlt, FaChevronDown, FaChevronUp } from "react-icons/fa"
import { MapPin } from "lucide-react"
import { toast } from "sonner"
import tripService from "@/services/trip.service"
import type { ScheduleGroup } from "@/types/schedule.types"

function Schedule() {
  const navigate = useNavigate()
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFrom, setSearchFrom] = useState("")
  const [searchTo, setSearchTo] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await tripService.getScheduleRoutes()
      if (response.success && response.data) {
        setScheduleGroups(response.data)
        // Auto expand all groups on load
        const allLocations = response.data.map(g => g.fromLocation)
        setExpandedGroups(new Set(allLocations))
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách lịch trình")
    } finally {
      setLoading(false)
    }
  }

  const handleSwapLocations = () => {
    const temp = searchFrom
    setSearchFrom(searchTo)
    setSearchTo(temp)
  }

  const toggleGroup = (fromLocation: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(fromLocation)) {
      newExpanded.delete(fromLocation)
    } else {
      newExpanded.add(fromLocation)
    }
    setExpandedGroups(newExpanded)
  }

  // Simple filter
  const filteredGroups = scheduleGroups
    .map(group => ({
      ...group,
      destinations: group.destinations.filter(dest => {
        const matchFrom = searchFrom === "" ||
          group.fromLocation.toLowerCase().includes(searchFrom.toLowerCase())
        const matchTo = searchTo === "" ||
          dest.toLocation.toLowerCase().includes(searchTo.toLowerCase())
        return matchFrom && matchTo
      })
    }))
    .filter(group => group.destinations.length > 0)

  const getVehicleTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      standard: "Ghế",
      vip: "Ghế VIP",
      sleeper: "Giường nằm"
    }
    return labels[type.toLowerCase()] || type
  }

  const handleSearchTrip = (fromLocation: string, toLocation: string) => {
    navigate(`/product?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`)
  }

  return (
    <>
      <Header />

      {/* Orange Banner - FUTA Style */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">LỊCH TRÌNH</h1>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Simple Search Bar - Horizontal */}
          <Card className="shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* From Location */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nhập điểm đi"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>

                {/* Swap Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapLocations}
                  className="h-12 w-12 rounded-full text-orange-500"
                >
                  <FaExchangeAlt className="h-4 w-4" />
                </Button>

                {/* To Location */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nhập điểm đến"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Routes List - GROUPED BY FROM LOCATION */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center bg-white rounded-lg shadow-md">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">🚌</div>
                <p className="text-xl">Không tìm thấy tuyến xe nào</p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.fromLocation)

                return (
                  <Card key={group.fromLocation} className="shadow-md overflow-hidden">
                    {/* GROUP HEADER - Click to expand/collapse */}
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
                      onClick={() => toggleGroup(group.fromLocation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 rounded-full p-2">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{group.fromLocation}</h2>
                            <p className="text-sm text-orange-100">
                              {group.destinations.length} tuyến xe khả dụng
                            </p>
                          </div>
                        </div>
                        <div className="text-white">
                          {isExpanded ? (
                            <FaChevronUp className="h-5 w-5" />
                          ) : (
                            <FaChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DESTINATIONS - Only show when expanded */}
                    {isExpanded && (
                      <div className="bg-white">
                        {/* Table Header */}
                        <div className="bg-gray-50 border-b">
                          <div className="grid grid-cols-5 gap-4 p-4 text-sm font-semibold text-gray-700">
                            <div>Điểm đến</div>
                            <div className="text-center">Loại xe</div>
                            <div className="text-center">Quãng đường</div>
                            <div className="text-center">Thời gian</div>
                            <div className="text-center">Giá vé</div>
                          </div>
                        </div>

                        {/* Destinations List */}
                        <div className="divide-y divide-gray-100">
                          {group.destinations.map((dest) => (
                            <div
                              key={dest.routeId}
                              className="hover:bg-orange-50 transition-colors"
                            >
                              <div className="grid grid-cols-5 gap-4 p-4 items-center">
                                {/* Destination */}
                                <div className="flex items-center gap-2">
                                  <span className="text-orange-600">→</span>
                                  <span className="font-medium text-gray-800">{dest.toLocation}</span>
                                </div>

                                {/* Vehicle Type */}
                                <div className="text-center text-gray-600 text-sm">
                                  {dest.vehicleTypes.map(getVehicleTypeLabel).join(", ")}
                                </div>

                                {/* Distance */}
                                <div className="text-center text-gray-700 font-medium">
                                  {dest.distanceKm}
                                </div>

                                {/* Duration */}
                                <div className="text-center text-gray-600 text-sm">
                                  {dest.estimatedDuration}
                                </div>

                                {/* Price & Button */}
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-bold text-orange-600">
                                    {dest.basePrice}
                                  </span>
                                  <Button
                                    onClick={() => handleSearchTrip(group.fromLocation, dest.toLocation)}
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 rounded-full"
                                  >
                                    Tìm xe
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Schedule

