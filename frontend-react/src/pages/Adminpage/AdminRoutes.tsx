import { useEffect, useState } from "react"
import LeftTaskBar from "@/components/LeftTaskBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import RouteMapVisualizer from "@/components/RouteMapVisualizer"
import { FaPlus, FaEdit, FaSearch, FaSave, FaTimes, FaMapMarkerAlt } from "react-icons/fa"
import routeService from "@/services/route.service"
import adminApi from "@/config/adminAxios" // 🔑 Use admin axios
import type { Route, CreateRouteRequest, UpdateRouteRequest } from "@/types/route.types"
import {
  validateDistance,
  validatePrice,
  validateDuration
} from "@/utils/validation"
import { sortCitiesByPriority, STANDARD_CITIES } from "@/utils/cityNormalizer"

interface Station {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  stationType: string;
  isActive: boolean;
}

interface RouteCalculation {
  fromCity: string;
  toCity: string;
  distanceKm: number;
  durationMinutes: number;
  basePrice: number;
  calculationSource: string;
}

function AdminRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [cities, setCities] = useState<string[]>([]) // 🆕 Load from API
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [fromCity, setFromCity] = useState<string>("")
  const [toCity, setToCity] = useState<string>("")
  const [calculating, setCalculating] = useState(false)
  const [calculation, setCalculation] = useState<RouteCalculation | null>(null)
  const [formData, setFormData] = useState<CreateRouteRequest | UpdateRouteRequest>({
    fromLocation: "",
    toLocation: "",
    distanceKm: 0,
    basePrice: 0,
    estimatedDuration: 0,
  })

  // 🏙️ Sorted cities list (priority cities first) - load from API or fallback to STANDARD_CITIES
  const sortedCities = sortCitiesByPriority(cities.length > 0 ? cities : STANDARD_CITIES)

  // 🗺️ City center coordinates for map visualization
  const getCityCoordinates = (cityName: string): [number, number] => {
    const cityCoords: Record<string, [number, number]> = {
      "TP Hồ Chí Minh": [10.8231, 106.6297],
      "Hà Nội": [21.0285, 105.8542],
      "Đà Nẵng": [16.0544, 108.2022],
      "Nha Trang": [12.2388, 109.1967],
      "Đà Lạt": [11.9404, 108.4583],
      "Vũng Tàu": [10.4113, 107.1362],
      "Phan Thiết": [10.9289, 108.1022],
      "Cần Thơ": [10.0452, 105.7469],
      "Huế": [16.4637, 107.5909],
      "Quy Nhơn": [13.7830, 109.2196],
      "Hải Phòng": [20.8449, 106.6881],
      "Buôn Ma Thuột": [12.6667, 108.0500],
      "Pleiku": [13.9833, 108.0000],
      "Vinh": [18.6792, 105.6922],
      "Biên Hòa": [10.9510, 106.8442],
    }
    return cityCoords[cityName] || [10.8231, 106.6297] // Default to TPHCM if not found
  }

  useEffect(() => {
    fetchRoutes()
    fetchStations()
    fetchCities() // 🆕 Load cities from API
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await routeService.getAllRoutes()
      if (response.success && response.data) {
        setRoutes(response.data)
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách tuyến đường")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStations = async () => {
    try {
      // 🔑 Use adminApi instead of authService
      const result = await adminApi.get('/stations', { activeOnly: 'true' })
      if (result.success && result.data) {
        setStations(result.data)
      }
    } catch (error) {
      console.error('Error fetching stations:', error)
      toast.error('Không thể tải danh sách trạm xe')
    }
  }

  const fetchCities = async () => {
    try {
      // 🔑 Use adminApi to fetch cities
      const result = await adminApi.get('/cities')
      if (result.success && result.data) {
        setCities(result.data.map((city: any) => city.name)) // Assuming city object has a 'name' field
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
      toast.error('Không thể tải danh sách thành phố')
    }
  }

  const handleAutoCalculate = async () => {
    if (!fromCity || !toCity) {
      toast.error('Vui lòng chọn cả thành phố đi và thành phố đến')
      return
    }

    if (fromCity === toCity) {
      toast.error('Thành phố đi và thành phố đến không được giống nhau')
      return
    }

    try {
      setCalculating(true)
      console.log('🔍 Calculating route:', { fromCity, toCity })

      // Use adminApi to make the request with proper headers
      const result = await adminApi.get(`/routes/calculate-by-city`, {
        fromCity: fromCity,
        toCity: toCity
      })

      console.log('✅ Response data:', result)

      if (result.success && result.data) {
        const calc = result.data
        setCalculation(calc)

        // Auto-fill form data
        setFormData({
          fromLocation: calc.fromCity,
          toLocation: calc.toCity,
          distanceKm: calc.distanceKm,
          basePrice: calc.basePrice,
          estimatedDuration: calc.durationMinutes,
        })

        toast.success(`✅ Tính toán thành công!\n📏 ${calc.distanceKm}km\n⏱️ ${calc.durationMinutes}phút\n💰 ${calc.basePrice.toLocaleString()}đ`)
      } else {
        const errorMsg = result.message || 'Không thể tính toán tuyến đường'
        console.error('❌ Calculation failed:', errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      console.error('❌ Calculate route error:', error)
      const errorMsg = error.message || 'Lỗi khi tính toán tuyến đường'
      toast.error(`Lỗi: ${errorMsg}`)
    } finally {
      setCalculating(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentRoute(null)
    setFromCity("")
    setToCity("")
    setCalculation(null)
    setFormData({
      fromLocation: "",
      toLocation: "",
      distanceKm: 0,
      basePrice: 0,
      estimatedDuration: 0,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (route: Route) => {
    setIsEditing(true)
    setCurrentRoute(route)

    // 🔑 Set city values for edit mode
    setFromCity(route.fromLocation)
    setToCity(route.toLocation)

    setFormData({
      fromLocation: route.fromLocation,
      toLocation: route.toLocation,
      distanceKm: route.distanceKm,
      basePrice: route.basePrice,
      estimatedDuration: route.estimatedDuration,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: Kiểm tra điểm đi và điểm đến không được giống nhau
    if (formData.fromLocation === formData.toLocation) {
      toast.error("Điểm đi và điểm đến không được giống nhau");
      return;
    }

    // Validation: Kiểm tra khoảng cách
    const distanceValidation = validateDistance(Number(formData.distanceKm));
    if (!distanceValidation.valid) {
      toast.error(distanceValidation.message);
      return;
    }

    // Validation: Kiểm tra giá
    const priceValidation = validatePrice(Number(formData.basePrice));
    if (!priceValidation.valid) {
      toast.error(priceValidation.message);
      return;
    }

    // Validation: Kiểm tra thời gian
    const durationValidation = validateDuration(Number(formData.estimatedDuration));
    if (!durationValidation.valid) {
      toast.error(durationValidation.message);
      return;
    }

    // Validation: Kiểm tra tuyến đường đã tồn tại chưa (chỉ khi thêm mới)
    if (!isEditing) {
      const isDuplicate = routes.some(route => 
        route.fromLocation.toLowerCase() === formData.fromLocation.toLowerCase() &&
        route.toLocation.toLowerCase() === formData.toLocation.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(`Tuyến đường "${formData.fromLocation} → ${formData.toLocation}" đã tồn tại!`);
        return;
      }
    }

    // Validation: Kiểm tra khi edit, không được trùng với tuyến khác
    if (isEditing && currentRoute) {
      const isDuplicate = routes.some(route => 
        route.id !== currentRoute.id && // Không so sánh với chính nó
        route.fromLocation.toLowerCase() === formData.fromLocation.toLowerCase() &&
        route.toLocation.toLowerCase() === formData.toLocation.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(`Tuyến đường "${formData.fromLocation} → ${formData.toLocation}" đã tồn tại!`);
        return;
      }
    }

    try {
      if (isEditing && currentRoute) {
        const response = await routeService.updateRoute(currentRoute.id, formData as UpdateRouteRequest)
        if (response.success) {
          toast.success("Cập nhật tuyến đường thành công")
          setIsDialogOpen(false)
          fetchRoutes()
        } else {
          toast.error(response.message || "Cập nhật thất bại")
        }
      } else {
        const response = await routeService.createRoute(formData as CreateRouteRequest)
        if (response.success) {
          toast.success("Tạo tuyến đường thành công")
          setIsDialogOpen(false)
          fetchRoutes()
        } else {
          toast.error(response.message || "Tạo tuyến đường thất bại")
        }
      }
    } catch (error: any) {
      toast.error(error.payload?.message || "Lỗi khi lưu tuyến đường")
    }
  }

  const filteredRoutes = routes.filter((route) =>
    route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }




  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý tuyến đường</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin tuyến đường xe buýt</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo điểm đi, điểm đến..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2"
              >
                <FaPlus /> Thêm tuyến đường
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-slate-400">Đang tải dữ liệu...</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Tuyến đường</TableHead>
                      <TableHead className="font-semibold">Khoảng cách</TableHead>
                      <TableHead className="font-semibold">Giá vé</TableHead>
                      <TableHead className="font-semibold">Thời gian</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                          Không tìm thấy tuyến đường nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoutes.map((route) => (
                        <TableRow key={route.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{route.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-green-600" />
                              <span className="font-medium">{route.fromLocation}</span>
                              <span className="text-slate-400">→</span>
                              <FaMapMarkerAlt className="text-red-600" />
                              <span className="font-medium">{route.toLocation}</span>
                            </div>
                          </TableCell>
                          <TableCell>{route.distanceKm} km</TableCell>
                          <TableCell className="font-semibold text-blue-900">
                            {formatCurrency(route.basePrice)}
                          </TableCell>
                          <TableCell>{formatDuration(route.estimatedDuration)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(route)}
                                className="text-blue-950 hover:text-blue-900 hover:bg-blue-50"
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              {isEditing ? "Chỉnh sửa tuyến đường" : "Thêm tuyến đường mới"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Cập nhật thông tin tuyến đường" : "Điền thông tin để thêm tuyến đường mới"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            {/* Conditional Layout: 2 columns when creating, 1 column when editing */}
            <div className={isEditing ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>

              {/* LEFT COLUMN / MAIN COLUMN: Form */}
              <div className="space-y-4">
                {/* City Selection with Auto Calculate */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-blue-900">🏙️ Chọn thành phố & Tự động tính toán</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromCity">
                      Thành phố đi <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={fromCity}
                      onValueChange={setFromCity}
                      disabled={isEditing}
                    >
                      <SelectTrigger className={isEditing ? "bg-slate-100 cursor-not-allowed" : ""}>
                        <SelectValue placeholder="Chọn thành phố đi" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedCities.map((city) => (
                          <SelectItem key={city} value={city} disabled={city === toCity}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toCity">
                      Thành phố đến <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={toCity}
                      onValueChange={setToCity}
                      disabled={isEditing}
                    >
                      <SelectTrigger className={isEditing ? "bg-slate-100 cursor-not-allowed" : ""}>
                        <SelectValue placeholder="Chọn thành phố đến" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedCities.map((city) => (
                          <SelectItem key={city} value={city} disabled={city === fromCity}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                      <Button
                        type="button"
                        onClick={handleAutoCalculate}
                        disabled={calculating || !fromCity || !toCity || isEditing}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {calculating ? "⏳ Đang tính toán..." : "🧮 Tự động tính toán"}
                      </Button>

                {/* Calculation Result */}
                {calculation && (
                  <div className="p-4 bg-white rounded-lg border border-green-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800">
                        ✅ {calculation.calculationSource}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {calculation.fromCity} → {calculation.toCity}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-2 bg-slate-50 rounded">
                        <p className="text-slate-500 text-xs">Khoảng cách</p>
                        <p className="font-semibold text-lg">{calculation.distanceKm} km</p>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded">
                        <p className="text-slate-500 text-xs">Thời gian</p>
                        <p className="font-semibold text-lg">{formatDuration(calculation.durationMinutes)}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-slate-500 text-xs">Giá đề xuất</p>
                        <p className="font-semibold text-lg text-blue-900">{formatCurrency(calculation.basePrice)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                {/* Editable fields when editing - 2 columns layout */}
                {isEditing && (
                  <div className="space-y-4 mt-4">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800 font-medium mb-2">📝 Chỉnh sửa tuyến đường</p>
                      <p className="text-xs text-amber-700">Chỉ có thể chỉnh sửa giá vé và thời gian ước tính. Không thể thay đổi điểm đi, điểm đến và khoảng cách.</p>
                    </div>

                    {/* Route Info - Full Width */}
                    <div className="space-y-2">
                      <Label>Tuyến đường</Label>
                      <div className="p-3 bg-slate-100 rounded-lg text-sm">
                        <p className="font-medium text-slate-700">
                          {formData.fromLocation} → {formData.toLocation}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Khoảng cách: {formData.distanceKm} km
                        </p>
                      </div>
                    </div>

                    {/* Editable Fields - 2 Columns */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basePrice">
                          Giá vé (VND) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="basePrice"
                          type="number"
                          min="10000"
                          max="10000000"
                          step="1000"
                          value={formData.basePrice}
                          onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                          placeholder="150000"
                          required
                        />
                        <p className="text-xs text-slate-500">* Từ 10,000 đến 10,000,000 VND</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedDuration">
                          Thời gian ước tính (phút) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="estimatedDuration"
                          type="number"
                          min="30"
                          max="4320"
                          value={formData.estimatedDuration}
                          onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                          placeholder="180"
                          required
                        />
                        <p className="text-xs text-slate-500">* Từ 30 phút đến 4,320 phút (3 ngày)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dialog Footer - inside left column */}
                <DialogFooter className="pt-4 border-t gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex items-center justify-center gap-2 min-w-[140px] px-6"
                  >
                    <FaTimes /> Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-950 hover:bg-blue-900 text-white flex items-center justify-center gap-2 min-w-[180px] px-6"
                  >
                    <FaSave /> {isEditing ? "Cập nhật" : "Lưu tuyến đường"}
                  </Button>
                </DialogFooter>
              </div>
              {/* END LEFT/MAIN COLUMN */}

              {/* RIGHT COLUMN: Map Visualization - Only show when CREATING */}
              {!isEditing && (
                <div className="space-y-4">
                  <div className="sticky top-0">
                    <div className="bg-slate-50 rounded-lg border-2 border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🗺️</span>
                        <h3 className="font-semibold text-slate-800">Bản đồ tương tác</h3>
                      </div>

                      {/* Route Map Visualization */}
                      {calculation ? (
                        <RouteMapVisualizer
                          fromStation={{
                            lat: getCityCoordinates(calculation.fromCity)[0],
                            lng: getCityCoordinates(calculation.fromCity)[1],
                            name: calculation.fromCity,
                          }}
                          toStation={{
                            lat: getCityCoordinates(calculation.toCity)[0],
                            lng: getCityCoordinates(calculation.toCity)[1],
                            name: calculation.toCity,
                          }}
                          height="500px"
                          showDistance={true}
                          distanceKm={calculation.distanceKm}
                        />
                      ) : (
                        <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                          <div className="text-slate-400 space-y-2">
                            <div className="text-4xl">🗺️</div>
                            <p className="text-sm">
                              Chọn thành phố đi và thành phố đến<br/>
                              rồi bấm "Tự động tính toán" để xem bản đồ
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* END RIGHT COLUMN */}

            </div>
            {/* END CONDITIONAL LAYOUT */}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminRoutes
