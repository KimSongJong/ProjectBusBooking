import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FaExchangeAlt, FaSearch } from "react-icons/fa"
import { toast } from "sonner"
import tripService from "@/services/trip.service"
import type { ScheduleGroup } from "@/types/schedule.types"

function Schedule() {
  const navigate = useNavigate()
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFrom, setSearchFrom] = useState("")
  const [searchTo, setSearchTo] = useState("")

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await tripService.getScheduleRoutes()
      console.log("API Response:", response)
      if (response.success && response.data) {
        console.log("Schedule data:", response.data)
        setScheduleGroups(response.data)
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast.error("Không thể tải danh sách lịch trình")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapLocations = () => {
    const temp = searchFrom
    setSearchFrom(searchTo)
    setSearchTo(temp)
  }

  // Filter schedule groups
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
  
  console.log("Schedule Groups:", scheduleGroups)
  console.log("Filtered Groups:", filteredGroups)

  const getVehicleTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      standard: "Tiêu chuẩn",
      vip: "VIP",
      sleeper: "Giường nằm"
    }
    return labels[type.toLowerCase()] || type
  }

  const handleSearchTrip = (fromLocation: string, toLocation: string) => {
    // Navigate to Product page with search params
    navigate(`/product?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Search Section */}
            <Card className="p-6 mb-8 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <Input
                    placeholder="Nhập điểm đi"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="h-12"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSwapLocations}
                  className="h-12 w-12 rounded-full hover:bg-orange-100 hover:text-orange-600"
                >
                  <FaExchangeAlt className="h-5 w-5" />
                </Button>

                <div className="flex-1 w-full">
                  <Input
                    placeholder="Nhập điểm đến"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="h-12"
                  />
                </div>

                <Button
                  type="button"
                  className="h-12 bg-orange-500 hover:bg-orange-600 text-white px-8"
                  onClick={fetchSchedules}
                >
                  <FaSearch className="mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </Card>

            {/* Routes Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <Card className="overflow-hidden shadow-lg">
                {/* Table Header */}
                <div className="bg-white border-b border-gray-200">
                  <div className="grid grid-cols-6 gap-4 p-4 font-semibold text-gray-700">
                    <div>Tuyến xe</div>
                    <div className="text-center">Loại xe</div>
                    <div className="text-center">Quãng đường</div>
                    <div className="text-center">Thời gian hành trình</div>
                    <div className="text-center">Giá vé</div>
                    <div className="text-center">Hành động</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white divide-y divide-gray-100">
                  {filteredGroups.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      Không tìm thấy tuyến xe nào
                    </div>
                  ) : (
                    filteredGroups.map((group) => (
                      group.destinations.map((dest, index) => (
                        <div
                          key={`${group.fromLocation}-${dest.routeId}`}
                          className="grid grid-cols-6 gap-4 p-4 hover:bg-orange-50 transition-colors"
                        >
                          <div className="flex flex-col">
                            {index === 0 && (
                              <span className="text-red-500 font-bold text-lg mb-2">
                                {group.fromLocation}
                              </span>
                            )}
                            <span className="text-gray-400 text-sm ml-4">→</span>
                            <span className="text-red-500 font-medium ml-4">
                              {dest.toLocation}
                            </span>
                          </div>

                          <div className="text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {dest.vehicleTypes.map((type, idx) => (
                                <span key={idx} className="text-gray-700 text-sm">
                                  {getVehicleTypeLabel(type)}{idx < dest.vehicleTypes.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-center">
                            <span className="text-gray-700">
                              {dest.distanceKm}
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-gray-700">
                              {dest.estimatedDuration}
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-gray-700">
                              {dest.basePrice}
                            </span>
                          </div>

                          <div className="text-center">
                            <Button
                              className="bg-orange-100 text-orange-600 hover:bg-orange-200 px-6"
                              onClick={() => handleSearchTrip(group.fromLocation, dest.toLocation)}
                            >
                              Tìm tuyến xe
                            </Button>
                          </div>
                        </div>
                      ))
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Schedule
