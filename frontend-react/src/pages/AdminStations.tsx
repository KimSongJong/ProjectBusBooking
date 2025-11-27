import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/config/adminAxios'; // 🔑 Use admin axios
import LeftTaskBar from '@/components/LeftTaskBar';
import StationMap from '@/components/StationMap';
import { autoDetectCity } from '@/utils/cityNormalizer';
import { VIETNAM_PROVINCES } from '@/constants/provinces';

// Popular stations in Vietnam for quick selection
const POPULAR_STATIONS = [
  { name: 'Bến xe Mỹ Đình', city: 'Hà Nội', address: 'Phạm Hùng, Nam Từ Liêm, Hà Nội', lat: 21.028511, lng: 105.784817 },
  { name: 'Bến xe Nước Ngầm', city: 'Hà Nội', address: 'Giải Phóng, Hoàng Mai, Hà Nội', lat: 20.981465, lng: 105.843817 },
  { name: 'Bến xe Giáp Bát', city: 'Hà Nội', address: 'Giải Phóng, Hoàng Mai, Hà Nội', lat: 20.984722, lng: 105.837222 },
  { name: 'Bến xe Miền Đông', city: 'Hồ Chí Minh', address: 'Quốc lộ 13, Bình Thạnh, TP.HCM', lat: 10.815103, lng: 106.712433 },
  { name: 'Bến xe Miền Tây', city: 'Hồ Chí Minh', address: 'Kinh Dương Vương, Bình Tân, TP.HCM', lat: 10.739722, lng: 106.610833 },
  { name: 'Bến xe An Sương', city: 'Hồ Chí Minh', address: 'Quốc lộ 22, Hóc Môn, TP.HCM', lat: 10.802500, lng: 106.603056 },
  { name: 'Bến xe Đà Nẵng', city: 'Đà Nẵng', address: 'Điện Biên Phủ, Thanh Khê, Đà Nẵng', lat: 16.061389, lng: 108.211389 },
  { name: 'Bến xe Nha Trang', city: 'Khánh Hòa', address: '23 Tháng 10, Nha Trang, Khánh Hòa', lat: 12.238791, lng: 109.196749 },
  { name: 'Bến xe Đà Lạt', city: 'Lâm Đồng', address: 'Tô Hiến Thành, Đà Lạt, Lâm Đồng', lat: 11.940278, lng: 108.438056 },
  { name: 'Bến xe Cần Thơ', city: 'Cần Thơ', address: 'Nguyễn Trãi, Ninh Kiều, Cần Thơ', lat: 10.033333, lng: 105.766667 },
];

interface Station {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  stationType: 'departure' | 'arrival' | 'both';
  isActive: boolean;
  createdAt: string;
}

interface StationForm {
  name: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  stationType: string;
  isActive: boolean;
}

const STATION_TYPES = [
  { value: 'both', label: 'Cả đi và đến' },
  { value: 'departure', label: 'Chỉ điểm đi' },
  { name: 'Bến xe Cần Thơ', city: 'Cần Thơ', address: 'Nguyễn Trãi, Ninh Kiều, Cần Thơ', lat: 10.033333, lng: 105.766667 },
];

// Use all Vietnam provinces from shared constants
// This ensures consistency across admin routes and stations
const MAJOR_CITIES = VIETNAM_PROVINCES;

export default function AdminStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState<StationForm>({
    name: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    stationType: 'both',
    isActive: true,
  });

  // OpenStreetMap Geocoding
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // 🆕 City input with confirmation
  const [cityInputValue, setCityInputValue] = useState('');
  const [showCityConfirmDialog, setShowCityConfirmDialog] = useState(false);
  const [pendingCityValue, setPendingCityValue] = useState('');

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 16.0, lng: 108.0 }); // Vietnam center
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Geocode address using OpenStreetMap Nominatim (free, no API key needed)
  const geocodeAddress = async (address: string) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Vietnam')}&limit=1`,
        {
          headers: {
            'User-Agent': 'BusBookingSystem/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setFormData({
          ...formData,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: result.display_name || formData.address,
        });

        // Update map position
        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });

        toast.success('✅ Đã tìm thấy tọa độ!');
      } else {
        toast.error('❌ Không tìm thấy địa điểm. Vui lòng nhập tọa độ thủ công.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Lỗi khi tìm tọa độ. Vui lòng nhập thủ công.');
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    filterStationList();
  }, [stations, searchKeyword, filterCity, filterActive]);

  const fetchStations = async () => {
    setLoading(true);
    try {
      // 🔑 Use adminApi instead of manual fetch
      if (!adminApi.getAdminToken()) {
        toast.error('Vui lòng đăng nhập lại với tài khoản admin');
        return;
      }

      console.log('📡 Fetching stations with admin token...');
      const response = await adminApi.get<any>('/stations', { _t: Date.now() });

      console.log('📦 Response:', response);

      if (response.success) {
        setStations(response.data);
        toast.success(`Đã tải ${response.data.length} trạm xe`);
      } else {
        throw new Error(response.message || 'Không thể tải dữ liệu');
      }
    } catch (error: any) {
      console.error('❌ Error fetching stations:', error);
      toast.error(error.message || 'Không thể tải danh sách trạm xe');
    } finally {
      setLoading(false);
    }
  };

  const filterStationList = () => {
    let filtered = [...stations];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.city.toLowerCase().includes(keyword) ||
          s.address.toLowerCase().includes(keyword)
      );
    }

    if (filterCity !== 'all') {
      filtered = filtered.filter((s) => s.city === filterCity);
    }

    if (filterActive !== 'all') {
      filtered = filtered.filter((s) => s.isActive === (filterActive === 'active'));
    }

    setFilteredStations(filtered);
  };

  const handleOpenDialog = (station?: Station) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        name: station.name,
        city: station.city,
        address: station.address,
        latitude: station.latitude.toString(),
        longitude: station.longitude.toString(),
        phone: station.phone || '',
        stationType: station.stationType,
        isActive: station.isActive,
      });
      // Sync city input value
      setCityInputValue(station.city);
      // Set map to station location
      setMapCenter({ lat: station.latitude, lng: station.longitude });
      setMarkerPosition({ lat: station.latitude, lng: station.longitude });
    } else {
      setEditingStation(null);
      setFormData({
        name: '',
        city: '',
        address: '',
        latitude: '',
        longitude: '',
        phone: '',
        stationType: 'both',
        isActive: true,
      });
      // Reset city input
      setCityInputValue('');
      // Reset map to Vietnam center
      setMapCenter({ lat: 16.0, lng: 108.0 });
      setMarkerPosition(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStation(null);
    setSearchQuery('');
    setCityInputValue('');
    setShowCityConfirmDialog(false);
    setPendingCityValue('');
    setMapCenter({ lat: 16.0, lng: 108.0 });
    setMarkerPosition(null);
  };

  const handleSelectPopularStation = (station: typeof POPULAR_STATIONS[0]) => {
    setFormData({
      ...formData,
      name: station.name,
      city: station.city,
      address: station.address,
      latitude: station.lat.toString(),
      longitude: station.lng.toString(),
    });
    setMapCenter({ lat: station.lat, lng: station.lng });
    setMarkerPosition({ lat: station.lat, lng: station.lng });
    toast.success(`✅ Đã điền thông tin: ${station.name}`);
  };

  // Map interaction handlers
  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  };

  const handleReverseGeocode = (address: string) => {
    // Auto-detect city from address
    const detectedCity = autoDetectCity(address);

    // Prepare updated formData
    const updatedData = { ...formData };

    // Auto-update address only if it's empty (don't overwrite user input)
    if (!formData.address.trim()) {
      updatedData.address = address;
    }

    // Auto-update city if detected
    if (detectedCity) {
      updatedData.city = detectedCity;
      setCityInputValue(detectedCity); // 🆕 Sync input value
    }

    setFormData(updatedData);

    // Show appropriate toast message
    if (detectedCity) {
      toast.success(`✅ Đã tự động chọn: ${detectedCity}`, { duration: 2500 });
    } else {
      toast.warning('⚠️ Không nhận diện được thành phố. Vui lòng chọn thủ công.', { duration: 3000 });
    }
  };

  const handleResetMap = () => {
    setMapCenter({ lat: 16.0, lng: 108.0 });
    setMarkerPosition(null);
    setFormData({
      ...formData,
      latitude: '',
      longitude: '',
    });
    toast.info('🗺️ Đã đặt lại bản đồ về Việt Nam');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!formData.name || !formData.city || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error('Tọa độ không hợp lệ');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        latitude,
        longitude,
        phone: formData.phone || null,
        stationType: formData.stationType,
        isActive: formData.isActive,
      };

      // 🔑 Use adminApi
      console.log('📤 Saving station:', editingStation ? 'UPDATE' : 'CREATE');
      const result = editingStation
        ? await adminApi.put(`/stations/${editingStation.id}`, payload)
        : await adminApi.post('/stations', payload);

      if (result.success) {
        toast.success(result.message);
        handleCloseDialog();
        fetchStations();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa trạm xe này?')) return;

    try {
      // 🔑 Use adminApi
      console.log('🗑️ Deleting station:', id);
      const result = await adminApi.delete(`/stations/${id}`);

      if (result.success) {
        toast.success(result.message);
        fetchStations();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa trạm xe');
    }
  };

  const getStationTypeLabel = (type: string) => {
    const found = STATION_TYPES.find((t) => t.value === type);
    return found?.label || type;
  };

  const cities = Array.from(new Set(stations.map((s) => s.city))).sort();

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Quản lý Trạm xe</h1>
              <p className="text-slate-600 mt-1">Quản lý các trạm xe khách trong hệ thống</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="bg-blue-950 hover:bg-blue-900">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Trạm Xe
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm trạm xe..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thành phố</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={fetchStations}>
                  Làm mới
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stations Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Danh sách trạm xe ({filteredStations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : filteredStations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có trạm xe nào</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Tên trạm</th>
                        <th className="text-left p-3">Thành phố</th>
                        <th className="text-left p-3">Địa chỉ</th>
                        <th className="text-left p-3">Tọa độ</th>
                        <th className="text-left p-3">Điện thoại</th>
                        <th className="text-left p-3">Loại</th>
                        <th className="text-left p-3">Trạng thái</th>
                        <th className="text-left p-3">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStations.map((station) => (
                        <tr key={station.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{station.id}</td>
                          <td className="p-3 font-medium">{station.name}</td>
                          <td className="p-3">{station.city}</td>
                          <td className="p-3 max-w-xs truncate">{station.address}</td>
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                            </div>
                          </td>
                          <td className="p-3">
                            {station.phone ? (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {station.phone}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{getStationTypeLabel(station.stationType)}</Badge>
                          </td>
                          <td className="p-3">
                            {station.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Hoạt động
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                Không hoạt động
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDialog(station)}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(station.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingStation ? '📝 Chỉnh sửa trạm xe' : '➕ Thêm trạm xe mới'}
                </DialogTitle>
                <DialogDescription>
                  Điền thông tin trạm xe. Các trường có dấu * là bắt buộc.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                {/* 2-Column Landscape Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">

                  {/* LEFT COLUMN: Form Fields */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-slate-700 border-b pb-2">📋 Thông tin trạm xe</h3>

                    <div className="space-y-2">
                      <Label htmlFor="name">Tên trạm xe *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: Bến xe Mỹ Đình"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Thành phố *</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => {
                          if (value === '__custom__') {
                            // User wants to enter custom city
                            setShowCityConfirmDialog(true);
                            setPendingCityValue('');
                          } else {
                            // User selected from list
                            setFormData({ ...formData, city: value });
                            setCityInputValue(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn hoặc nhập thành phố" />
                        </SelectTrigger>
                        <SelectContent>
                          {MAJOR_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__" className="text-orange-600 font-medium border-t mt-2 pt-2">
                            ✏️ Nhập thành phố khác...
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {cityInputValue && !MAJOR_CITIES.includes(cityInputValue.trim()) && (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          ⚠️ Thành phố này không có trong danh sách. Bấm ra ngoài để xác nhận.
                        </p>
                      )}

                      {formData.city && MAJOR_CITIES.includes(formData.city) && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          ✅ Đã chọn: {formData.city}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="VD: Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội"
                        required
                      />
                      <p className="text-xs text-slate-500">
                        💡 Địa chỉ tự động điền khi click vào bản đồ (nếu trống)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coordinates" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Tọa độ (Latitude, Longitude) *
                      </Label>
                      <Input
                        id="coordinates"
                        value={formData.latitude && formData.longitude
                          ? `${formData.latitude}, ${formData.longitude}`
                          : ''}
                        readOnly
                        placeholder="Click vào bản đồ để đặt tọa độ"
                        required
                        className="bg-slate-50 font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="VD: 024 3768 5549"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stationType">Loại trạm</Label>
                      <Select
                        value={formData.stationType}
                        onValueChange={(value) => setFormData({ ...formData, stationType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isActive" className="cursor-pointer">
                        ✅ Trạm đang hoạt động
                      </Label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t mt-6">
                      <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                        Hủy
                      </Button>
                      <Button type="submit" className="flex-1 bg-blue-950 hover:bg-blue-900">
                        {editingStation ? 'Cập nhật' : 'Thêm mới'}
                      </Button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Map */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-slate-700 border-b pb-2">🗺️ Bản đồ tương tác</h3>

                    {/* Search Bar */}
                    <div className="space-y-2">
                      <Label htmlFor="address-search" className="flex items-center gap-2 text-green-700 font-medium">
                        <Search className="w-4 h-4" />
                        Tìm kiếm địa điểm
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="address-search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="VD: Bến xe Mỹ Đình, Hà Nội"
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const query = searchQuery.trim();
                              if (query) geocodeAddress(query);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const query = searchQuery.trim();
                            if (query) geocodeAddress(query);
                          }}
                          disabled={isGeocoding || searchQuery.trim() === ''}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isGeocoding ? '⏳' : '🔍'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleResetMap}
                          variant="outline"
                          title="Đặt lại bản đồ về Việt Nam"
                        >
                          📍
                        </Button>
                      </div>
                    </div>

                    {/* Map Component */}
                    <div className="border-2 border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <StationMap
                        center={mapCenter}
                        markerPosition={markerPosition}
                        onMapClick={handleMapClick}
                        onMarkerDragEnd={handleMarkerDragEnd}
                        onReverseGeocode={handleReverseGeocode}
                        height="500px"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* 🆕 City Confirmation Dialog */}
          <Dialog open={showCityConfirmDialog} onOpenChange={setShowCityConfirmDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  ✏️ Nhập thành phố mới
                </DialogTitle>
                <DialogDescription>
                  Thành phố này chưa có trong danh sách. Vui lòng nhập chính xác.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-city">Tên thành phố *</Label>
                  <Input
                    id="custom-city"
                    value={pendingCityValue}
                    onChange={(e) => setPendingCityValue(e.target.value)}
                    placeholder="VD: Bình Phước, Tây Ninh..."
                    autoFocus
                    className="text-lg"
                  />
                  <p className="text-xs text-slate-500">
                    💡 Gõ chính xác tên tỉnh/thành phố
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 mb-2">
                    💡 <strong>Danh sách thành phố phổ biến:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {MAJOR_CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, city });
                          setCityInputValue(city);
                          setShowCityConfirmDialog(false);
                          toast.success(`✅ Đã chọn: ${city}`);
                        }}
                        className="px-3 py-1 text-xs bg-white border border-slate-300 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPendingCityValue('');
                      setShowCityConfirmDialog(false);
                      toast.info('Đã hủy. Vui lòng chọn lại.');
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const city = pendingCityValue.trim();
                      if (!city) {
                        toast.error('Vui lòng nhập tên thành phố');
                        return;
                      }
                      setFormData({ ...formData, city });
                      setCityInputValue(city);
                      setShowCityConfirmDialog(false);
                      toast.success(`✅ Đã xác nhận: ${city}`);
                    }}
                    disabled={!pendingCityValue.trim()}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    ✅ Xác nhận
                  </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Lưu ý:</strong> Nếu bạn chắc chắn thành phố này đúng, hãy bấm <strong>"Xác nhận"</strong>.
                    Nếu không, hãy chọn lại từ danh sách gợi ý.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

