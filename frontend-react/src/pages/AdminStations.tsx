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
import authService from '@/services/auth.service';
import LeftTaskBar from '@/components/LeftTaskBar';

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
  { value: 'arrival', label: 'Chỉ điểm đến' },
];

const MAJOR_CITIES = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Nha Trang', 'Huế', 'Đà Lạt', 'Vũng Tàu', 'Quy Nhơn'
];

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
        setFormData({
          ...formData,
          latitude: parseFloat(result.lat).toFixed(6),
          longitude: parseFloat(result.lon).toFixed(6),
          address: result.display_name || formData.address,
        });
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
      const token = authService.getToken();
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      const url = `http://localhost:8080/api/stations?_t=${Date.now()}`;
      console.log('📡 Fetching stations from:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      console.log('📦 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Stations loaded:', result);

      if (result.success) {
        setStations(result.data);
        toast.success(`Đã tải ${result.data.length} trạm xe`);
      } else {
        throw new Error(result.message || 'Không thể tải dữ liệu');
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
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStation(null);
    setSearchQuery('');
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
    toast.success(`✅ Đã điền thông tin: ${station.name}`);
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

      const token = authService.getToken();
      const url = editingStation
        ? `http://localhost:8080/api/stations/${editingStation.id}`
        : 'http://localhost:8080/api/stations';

      const method = editingStation ? 'PUT' : 'POST';

      console.log('📤 Saving station:', method, url);
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

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
      const token = authService.getToken();
      console.log('🗑️ Deleting station:', id);
      const response = await fetch(`http://localhost:8080/api/stations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStation ? 'Chỉnh sửa trạm xe' : 'Thêm trạm xe mới'}
                </DialogTitle>
                <DialogDescription>
                  Điền thông tin trạm xe. Các trường có dấu * là bắt buộc.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  {/* Smart Search Bar with Mode Toggle */}
                  <div className="space-y-3 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 p-4 rounded-lg border-2 border-blue-300">
                    {/* Mode Toggle Buttons */}
                    <div className="flex gap-2 mb-3">
                      <Button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className={`flex-1 ${
                          searchQuery === ''
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        ⚡ Chọn nhanh
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setSearchQuery(' ')}
                        className={`flex-1 ${
                          searchQuery !== ''
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        🌍 Tự nhập địa chỉ
                      </Button>
                    </div>

                    {/* Quick Select Mode */}
                    {searchQuery === '' && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-blue-700 font-semibold">
                          <MapPin className="w-4 h-4" />
                          Chọn từ trạm xe phổ biến
                        </Label>
                        <Select onValueChange={(value) => {
                          const station = POPULAR_STATIONS[parseInt(value)];
                          if (station) handleSelectPopularStation(station);
                        }}>
                          <SelectTrigger className="bg-white border-2 border-blue-200">
                            <SelectValue placeholder="-- Chọn trạm xe từ danh sách --" />
                          </SelectTrigger>
                          <SelectContent>
                            {POPULAR_STATIONS.map((station, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-blue-500" />
                                  <span className="font-medium">{station.name}</span>
                                  <span className="text-xs text-gray-500">({station.city})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-blue-600">
                          💡 Chọn 1 trạm → Tự động điền tất cả thông tin
                        </p>
                      </div>
                    )}

                    {/* Address Search Mode */}
                    {searchQuery !== '' && (
                      <div className="space-y-2">
                        <Label htmlFor="address-search" className="flex items-center gap-2 text-green-700 font-semibold">
                          <Search className="w-4 h-4" />
                          Nhập địa chỉ trạm xe
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="address-search"
                            value={searchQuery === ' ' ? '' : searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value || ' ')}
                            placeholder="VD: Bến xe Mỹ Đình, Hà Nội hoặc Phạm Hùng, Nam Từ Liêm"
                            className="bg-white flex-1 border-2 border-green-200"
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
                            className="bg-green-600 hover:bg-green-700 px-6"
                          >
                            {isGeocoding ? '⏳ Đang tìm...' : '🔍 Tìm'}
                          </Button>
                        </div>
                        <p className="text-xs text-green-600">
                          💡 Nhập địa chỉ → Nhấn Enter hoặc "Tìm" → Tự động điền tọa độ
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thành phố" />
                        </SelectTrigger>
                        <SelectContent>
                          {MAJOR_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coordinates" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Tọa độ (Latitude, Longitude) *
                    </Label>
                    <Input
                      id="coordinates"
                      value={`${formData.latitude}, ${formData.longitude}`}
                      onChange={(e) => {
                        const coords = e.target.value.split(',').map(s => s.trim());
                        if (coords.length >= 2) {
                          setFormData({
                            ...formData,
                            latitude: coords[0],
                            longitude: coords[1]
                          });
                        } else if (coords.length === 1) {
                          setFormData({ ...formData, latitude: coords[0] });
                        }
                      }}
                      placeholder="VD: 21.028511, 105.784817"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      💡 Nhập theo format: vĩ độ, kinh độ (VD: 21.028511, 105.784817)
                    </p>
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Trạm đang hoạt động
                    </Label>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-sm">
                    <p className="font-medium mb-2">💡 Mẹo: Cách lấy tọa độ từ Google Maps</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      <li>Mở Google Maps và tìm địa điểm</li>
                      <li>Click chuột phải vào vị trí trên bản đồ</li>
                      <li>Chọn số tọa độ đầu tiên trong menu (VD: 21.028511, 105.784817)</li>
                      <li>Số đầu là Latitude (Vĩ độ), số sau là Longitude (Kinh độ)</li>
                    </ol>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingStation ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

