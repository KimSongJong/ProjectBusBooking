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


  const handleSearchTrip = (fromLocation: string, toLocation: string) => {
    navigate(`/product?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`)
  }

  return (
    <>
      <Header />


      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Simple Search Bar - Horizontal */}
          <Card className="shadow-lg mb-6 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* From Location */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 h-5 w-5" />
                  <Input
                    placeholder="Nhập điểm đi"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                  />
                </div>

                {/* Swap Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapLocations}
                  className="h-14 w-14 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all"
                >
                  <FaExchangeAlt className="h-5 w-5" />
                </Button>

                {/* To Location */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 h-5 w-5" />
                  <Input
                    placeholder="Nhập điểm đến"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-orange-500 rounded-xl"
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
                  <Card key={group.fromLocation} className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-0 rounded-xl">
                    {/* GROUP HEADER - Click to expand/collapse */}
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
                      onClick={() => toggleGroup(group.fromLocation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{group.fromLocation}</h2>
                            <p className="text-sm text-orange-100 mt-1">
                              {group.destinations.length} tuyến xe khả dụng
                            </p>
                          </div>
                        </div>
                        <div className="text-white bg-white/10 rounded-full p-2">
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
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-orange-200">
                          <div className="grid grid-cols-4 gap-6 px-5 py-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
                            <div>Điểm đến</div>
                            <div className="text-center">Quãng đường</div>
                            <div className="text-center">Thời gian</div>
                            <div className="text-center">Giá vé</div>
                          </div>
                        </div>

                        {/* Destinations List */}
                        <div className="divide-y divide-gray-200">
                          {group.destinations.map((dest) => (
                            <div
                              key={dest.routeId}
                              className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-50/50 transition-all duration-200"
                            >
                              <div className="grid grid-cols-4 gap-6 px-5 py-5 items-center">
                                {/* Destination */}
                                <div className="flex items-center gap-3">
                                  <span className="text-orange-600 text-xl">→</span>
                                  <span className="font-semibold text-gray-900 text-base">{dest.toLocation}</span>
                                </div>

                                {/* Distance */}
                                <div className="text-center">
                                  <span className="text-gray-800 font-semibold text-base">{dest.distanceKm}</span>
                                </div>

                                {/* Duration */}
                                <div className="text-center">
                                  <span className="text-gray-600 font-medium">{dest.estimatedDuration}</span>
                                </div>

                                {/* Price & Button */}
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-bold text-orange-600 text-lg">
                                    {dest.basePrice}
                                  </span>
                                  <Button
                                    onClick={() => handleSearchTrip(group.fromLocation, dest.toLocation)}
                                    size="sm"
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                                  >
                                    Tìm xe →
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

