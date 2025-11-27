import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

// Fix Leaflet default marker icon issue with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface StationMapProps {
  center: { lat: number; lng: number };
  markerPosition: { lat: number; lng: number } | null;
  onMarkerDragEnd: (lat: number, lng: number) => void;
  onMapClick: (lat: number, lng: number) => void;
  onReverseGeocode?: (address: string) => void;
  height?: string;
}

// Component to handle map click events
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map center when it changes
function MapCenterUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center.lat, center.lng, map]);

  return null;
}

export default function StationMap({
  center,
  markerPosition,
  onMarkerDragEnd,
  onMapClick,
  onReverseGeocode,
  height = '400px',
}: StationMapProps) {
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Reverse geocode when marker position changes
  useEffect(() => {
    if (markerPosition && onReverseGeocode) {
      reverseGeocode(markerPosition.lat, markerPosition.lng);
    }
  }, [markerPosition?.lat, markerPosition?.lng]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BusBookingSystem/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.display_name) {
        if (onReverseGeocode) {
          onReverseGeocode(data.display_name);
        }
        toast.success('✅ Đã tìm thấy địa chỉ từ tọa độ!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Don't show error toast for reverse geocoding - it's not critical
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleMarkerDragEnd = (event: L.DragEndEvent) => {
    const marker = event.target;
    const position = marker.getLatLng();
    onMarkerDragEnd(position.lat, position.lng);
  };

  return (
    <div className="relative">
      {isReverseGeocoding && (
        <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1 rounded-md shadow-lg text-xs text-blue-600">
          🔍 Đang tìm địa chỉ...
        </div>
      )}

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={markerPosition ? 15 : 6}
        style={{ height, width: '100%', borderRadius: '0.5rem' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onClick={onMapClick} />
        <MapCenterUpdater center={center} />

        {markerPosition && (
          <Marker
            position={[markerPosition.lat, markerPosition.lng]}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
        )}
      </MapContainer>

      {/* Coordinates Display */}
      {markerPosition && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">📍 Tọa độ hiện tại:</span>
            <span className="font-mono font-medium text-blue-700">
              {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            💡 Kéo thả marker hoặc click vào bản đồ để thay đổi vị trí
          </p>
        </div>
      )}

      {!markerPosition && (
        <div className="mt-2 p-2 bg-slate-50 rounded-md text-xs text-center text-slate-500">
          🗺️ Click vào bản đồ để đặt vị trí trạm xe
        </div>
      )}
    </div>
  );
}

