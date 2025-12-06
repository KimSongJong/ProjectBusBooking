import { useState, useEffect } from "react";
import { toast } from "sonner";
import adminApi from "@/config/adminAxios";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaMapMarkerAlt } from "react-icons/fa";
import LeftTaskBar from "@/components/LeftTaskBar";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface City {
  id: number;
  name: string;
  normalizedName: string;
  region: string;
  isPopular: boolean;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
}

function AdminCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    region: "south",
    isPopular: false,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get("/cities");
      console.log("📍 Response data:", response.data);
      console.log("📍 Response data type:", typeof response.data);
      console.log("📍 Is array?:", Array.isArray(response.data));

      // Handle both formats:
      // 1. Direct array: [{id: 1, name: "..."}, ...]
      // 2. Wrapped: {success: true, data: [...]}
      let citiesData: City[] = [];

      if (Array.isArray(response.data)) {
        // Direct array format
        citiesData = response.data;
        console.log("✅ Direct array format, loaded cities:", citiesData.length);
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        // Wrapped format
        citiesData = response.data.data;
        console.log("✅ Wrapped format, loaded cities:", citiesData.length);
      } else {
        console.warn("⚠️ Unknown response format:", response.data);
      }

      setCities(citiesData);
      if (citiesData.length > 0) {
        toast.success(`Đã tải ${citiesData.length} thành phố`);
      } else {
        toast.warning("Không có dữ liệu thành phố");
      }
    } catch (error: any) {
      console.error("❌ Error fetching cities:", error);
      console.error("❌ Error response:", error.response);
      toast.error("Không thể tải danh sách thành phố");
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCity) {
        // Update
        await adminApi.put(`/cities/${editingCity.id}`, formData);
        toast.success("Cập nhật thành phố thành công");
      } else {
        // Create
        await adminApi.post("/cities", formData);
        toast.success("Thêm thành phố thành công");
      }

      fetchCities();
      handleCloseModal();
    } catch (error: any) {
      console.error("❌ Error saving city:", error);
      toast.error(error.response?.data?.message || "Lưu thành phố thất bại");
    }
  };

  const handleToggleActive = async (city: City) => {
    try {
      await adminApi.put(`/cities/${city.id}/toggle`);
      toast.success(`${city.isActive ? "Vô hiệu hóa" : "Kích hoạt"} thành phố thành công`);
      fetchCities();
    } catch (error) {
      toast.error("Thay đổi trạng thái thất bại");
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      region: city.region,
      isPopular: city.isPopular,
      latitude: city.latitude || null,
      longitude: city.longitude || null,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCity(null);
    setFormData({
      name: "",
      region: "south",
      isPopular: false,
      latitude: null,
      longitude: null,
    });
  };

  const getRegionLabel = (region: string) => {
    const labels: Record<string, string> = {
      north: "Miền Bắc",
      central: "Miền Trung",
      south: "Miền Nam",
    };
    return labels[region] || region;
  };

  // Map click handler component
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
        toast.success(`Đã chọn vị trí: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
      },
    });
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <LeftTaskBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  console.log("🔍 Render - cities.length:", cities.length);
  console.log("🔍 Render - loading:", loading);

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Quản lý thành phố</h1>
              <p className="text-slate-600 mt-1">
                Quản lý danh sách 63 tỉnh thành Việt Nam (Hiện có: {cities.length} thành phố)
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Thêm thành phố
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-sm text-blue-800">
              🔍 Debug: Loading = {loading ? "true" : "false"}, Cities = {cities.length}
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tên thành phố</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Vùng</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Tọa độ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Phổ biến</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {loading ? "Đang tải..." : "Không có dữ liệu thành phố"}
                    </td>
                  </tr>
                ) : (
                  cities.map((city) => (
                    <tr key={city.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{city.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{city.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getRegionLabel(city.region)}</td>
                      <td className="px-6 py-4 text-center">
                        {city.latitude && city.longitude ? (
                          <span className="text-xs text-gray-600" title={`${city.latitude}, ${city.longitude}`}>
                            <FaMapMarkerAlt className="inline text-green-600" /> Có
                          </span>
                        ) : (
                          <span className="text-xs text-red-400">Chưa có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {city.isPopular ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">⭐ Phổ biến</span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {city.isActive ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Hoạt động</span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Vô hiệu</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(city)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Chỉnh sửa"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(city)}
                            className={city.isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
                            title={city.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            {city.isActive ? <FaToggleOff size={18} /> : <FaToggleOn size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingCity ? "Chỉnh sửa thành phố" : "Thêm thành phố mới"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column - Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tên thành phố *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                        placeholder="VD: TP Hồ Chí Minh"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vùng *</label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="north">Miền Bắc</option>
                        <option value="central">Miền Trung</option>
                        <option value="south">Miền Nam</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        id="isPopular"
                      />
                      <label htmlFor="isPopular" className="text-sm">Đánh dấu là thành phố phổ biến</label>
                    </div>

                    {/* Coordinates display */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMapMarkerAlt className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Tọa độ trung tâm thành phố</span>
                      </div>
                      {formData.latitude && formData.longitude ? (
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>📍 Latitude: {formData.latitude.toFixed(6)}</p>
                          <p>📍 Longitude: {formData.longitude.toFixed(6)}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-blue-600">👆 Click vào bản đồ bên phải để chọn vị trí</p>
                      )}
                    </div>
                  </div>

                  {/* Right column - Map */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Chọn vị trí trên bản đồ *</label>
                    <div className="border rounded overflow-hidden" style={{ height: "300px" }}>
                      <MapContainer
                        center={
                          formData.latitude && formData.longitude
                            ? [formData.latitude, formData.longitude]
                            : [16.0544, 108.2022] // Đà Nẵng center
                        }
                        zoom={formData.latitude && formData.longitude ? 13 : 6}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <MapClickHandler />
                        {formData.latitude && formData.longitude && (
                          <Marker position={[formData.latitude, formData.longitude]} />
                        )}
                      </MapContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Click vào bản đồ để chọn điểm trung tâm thành phố (dùng để tính khoảng cách tuyến đường)
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    disabled={!formData.latitude || !formData.longitude}
                  >
                    {editingCity ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminCities;

