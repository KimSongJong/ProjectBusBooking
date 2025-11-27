import { useEffect, useState } from "react"
import LeftTaskBar from "@/components/LeftTaskBar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { FaCheck, FaTimes, FaMapMarkedAlt, FaClock } from "react-icons/fa"
import adminApi from "@/config/adminAxios"

interface PendingCity {
  id: number;
  cityName: string;
  normalizedName: string;
  latitude: number;
  longitude: number;
  suggestedByStationId: number | null;
  suggestedByStationName: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: number | null;
}

function AdminPendingCities() {
  const [pendingCities, setPendingCities] = useState<PendingCity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingCities()
  }, [])

  const fetchPendingCities = async () => {
    try {
      setLoading(true)
      const result = await adminApi.get('/admin/pending-cities')
      if (result.success && result.data) {
        setPendingCities(result.data)
        console.log('✅ Loaded pending cities:', result.data)
      }
    } catch (error) {
      console.error('Error fetching pending cities:', error)
      toast.error('Không thể tải danh sách thành phố chờ duyệt')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (cityId: number, cityName: string) => {
    try {
      const result = await adminApi.post(`/admin/pending-cities/${cityId}/approve`, {})
      if (result.success) {
        toast.success(`✅ Đã duyệt thành phố "${cityName}"`)
        fetchPendingCities()
      } else {
        toast.error(result.message || 'Duyệt thất bại')
      }
    } catch (error: any) {
      console.error('Error approving city:', error)
      toast.error(error.payload?.message || 'Lỗi khi duyệt thành phố')
    }
  }

  const handleReject = async (cityId: number, cityName: string) => {
    if (!confirm(`⚠️ Bạn có chắc muốn TỪ CHỐI thành phố "${cityName}"?\n\nTất cả trạm xe thuộc thành phố này sẽ bị XÓA!`)) {
      return
    }

    try {
      const result = await adminApi.post(`/admin/pending-cities/${cityId}/reject`, {})
      if (result.success) {
        toast.success(`❌ Đã từ chối thành phố "${cityName}"`)
        fetchPendingCities()
      } else {
        toast.error(result.message || 'Từ chối thất bại')
      }
    } catch (error: any) {
      console.error('Error rejecting city:', error)
      toast.error(error.payload?.message || 'Lỗi khi từ chối thành phố')
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FaMapMarkedAlt className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Duyệt thành phố mới</h1>
              <p className="text-slate-600 mt-1">
                Các thành phố mới được đề xuất từ người dùng khi thêm trạm xe
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Quy trình duyệt thành phố:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Khi user thêm trạm ở thành phố <strong>CHƯA CÓ</strong> trong danh sách → Tạo pending city</li>
                    <li>Admin <strong>DUYỆT</strong> → Thành phố được thêm vào dropdown chính thức</li>
                    <li>Admin <strong>TỪ CHỐI</strong> → Thành phố và tất cả trạm liên quan bị xóa</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-slate-400">Đang tải dữ liệu...</div>
            ) : pendingCities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-slate-500">Không có thành phố nào đang chờ duyệt</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Tên thành phố</TableHead>
                      <TableHead className="font-semibold">Tọa độ (Lat, Lng)</TableHead>
                      <TableHead className="font-semibold">Trạm xe đề xuất</TableHead>
                      <TableHead className="font-semibold">Thời gian tạo</TableHead>
                      <TableHead className="font-semibold text-center">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCities.map((city) => (
                      <TableRow key={city.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{city.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-800">{city.cityName}</p>
                            <p className="text-xs text-slate-500">{city.normalizedName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {city.latitude.toFixed(6)}, {city.longitude.toFixed(6)}
                        </TableCell>
                        <TableCell>
                          {city.suggestedByStationName ? (
                            <div className="text-sm">
                              <p className="font-medium text-slate-700">{city.suggestedByStationName}</p>
                              <p className="text-xs text-slate-500">ID: {city.suggestedByStationId}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FaClock className="text-slate-400" />
                            {new Date(city.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(city.id, city.cityName)}
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                              title="Duyệt thành phố này"
                            >
                              <FaCheck /> Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(city.id, city.cityName)}
                              className="flex items-center gap-1"
                              title="Từ chối và xóa tất cả trạm"
                            >
                              <FaTimes /> Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AdminPendingCities

