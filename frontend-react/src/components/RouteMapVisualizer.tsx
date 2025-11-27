// filepath: src/components/RouteMapVisualizer.tsx
/**
 * 🗺️ ROUTE MAP VISUALIZER COMPONENT
 *
 * Purpose: Visualize a route between two stations on a map
 * Used in: AdminRoutes dialog (when creating/editing routes)
 *
 * Features:
 * - Shows 2 markers (from/to stations)
 * - Draws polyline between them
 * - Auto-fits bounds to show both markers
 * - Shows station names in popups
 *
 * Date: 2025-11-27
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for from/to stations
const fromIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const toIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ============================================
// TYPES
// ============================================

interface StationCoords {
  lat: number;
  lng: number;
  name: string;
}

interface RouteMapVisualizerProps {
  fromStation: StationCoords | null;
  toStation: StationCoords | null;
  height?: string;
  showDistance?: boolean;
  distanceKm?: number;
}

// ============================================
// AUTO-FIT BOUNDS COMPONENT
// ============================================

/**
 * Component to auto-fit map bounds to show all markers
 */
function AutoFitBounds({ fromStation, toStation }: {
  fromStation: StationCoords | null;
  toStation: StationCoords | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (fromStation && toStation) {
      const bounds = L.latLngBounds(
        [fromStation.lat, fromStation.lng],
        [toStation.lat, toStation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (fromStation) {
      map.setView([fromStation.lat, fromStation.lng], 13);
    } else if (toStation) {
      map.setView([toStation.lat, toStation.lng], 13);
    }
  }, [fromStation, toStation, map]);

  return null;
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * RouteMapVisualizer - Shows route between two stations
 *
 * @param fromStation - Origin station coordinates
 * @param toStation - Destination station coordinates
 * @param height - Map height (default: 400px)
 * @param showDistance - Show distance info below map
 * @param distanceKm - Calculated distance
 */
export default function RouteMapVisualizer({
  fromStation,
  toStation,
  height = '400px',
  showDistance = false,
  distanceKm,
}: RouteMapVisualizerProps) {
  // Default center: Vietnam
  const defaultCenter: [number, number] = [16.0544, 108.2022];

  // State for route coordinates (real road geometry from OSRM)
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Fetch route geometry from OSRM when stations change
  useEffect(() => {
    if (!fromStation || !toStation) {
      setRouteCoordinates([]);
      return;
    }

    const fetchRouteGeometry = async () => {
      setIsLoadingRoute(true);
      try {
        // OSRM API URL (same as backend uses)
        // Format: lng,lat;lng,lat (OSRM uses lon,lat order!)
        const url = `http://router.project-osrm.org/route/v1/driving/${fromStation.lng},${fromStation.lat};${toStation.lng},${toStation.lat}?overview=full&geometries=geojson`;

        console.log('🗺️ Fetching OSRM route geometry:', url);

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          // Parse GeoJSON coordinates
          const coordinates = data.routes[0].geometry.coordinates;

          // Convert from [lng, lat] to [lat, lng] for Leaflet
          const leafletCoords: [number, number][] = coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          setRouteCoordinates(leafletCoords);
          console.log('✅ Route geometry loaded:', leafletCoords.length, 'points');
        } else {
          console.warn('⚠️ OSRM returned no routes, using fallback straight line');
          // Fallback to straight line
          setRouteCoordinates([
            [fromStation.lat, fromStation.lng],
            [toStation.lat, toStation.lng],
          ]);
        }
      } catch (error) {
        console.error('❌ Error fetching OSRM route:', error);
        // Fallback to straight line on error
        setRouteCoordinates([
          [fromStation.lat, fromStation.lng],
          [toStation.lat, toStation.lng],
        ]);
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRouteGeometry();
  }, [fromStation, toStation]);

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
        <MapContainer
          center={defaultCenter}
          zoom={6}
          style={{ height, width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto-fit bounds */}
          <AutoFitBounds fromStation={fromStation} toStation={toStation} />

          {/* From Station Marker (Green) */}
          {fromStation && (
            <Marker
              position={[fromStation.lat, fromStation.lng]}
              icon={fromIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-green-700">🚏 Trạm đi</p>
                  <p className="text-sm">{fromStation.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* To Station Marker (Red) */}
          {toStation && (
            <Marker
              position={[toStation.lat, toStation.lng]}
              icon={toIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-red-700">🏁 Trạm đến</p>
                  <p className="text-sm">{toStation.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Polyline with real road geometry from OSRM */}
          {fromStation && toStation && routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#2563eb"
              weight={4}
              opacity={0.8}
            >
              <Popup>
                <div className="text-center text-sm">
                  <p className="font-semibold text-blue-700">🛣️ Tuyến đường thực tế</p>
                  <p className="text-xs text-slate-600">Dữ liệu từ OpenStreetMap</p>
                </div>
              </Popup>
            </Polyline>
          )}
        </MapContainer>
      </div>

      {/* Info Display */}
      {fromStation && toStation && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-semibold">🚏 {fromStation.name}</span>
              <span className="text-slate-400">━━━━━━━━→</span>
              <span className="text-red-700 font-semibold">🏁 {toStation.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {isLoadingRoute && (
                <span className="text-blue-600 text-xs animate-pulse">
                  🔄 Đang tải đường đi...
                </span>
              )}
              {showDistance && distanceKm && (
                <div className="text-blue-700 font-medium">
                  📏 {distanceKm.toFixed(1)} km
                </div>
              )}
            </div>
          </div>
          {!isLoadingRoute && routeCoordinates.length > 2 && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <span>✅</span>
              <span>Hiển thị theo đường xá thực tế ({routeCoordinates.length} điểm)</span>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!fromStation && !toStation && (
        <div className="bg-slate-50 rounded-lg p-6 text-center border-2 border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">
            🗺️ Chọn trạm đi và trạm đến để xem tuyến đường trên bản đồ
          </p>
        </div>
      )}

      {/* Partial State (only one station selected) */}
      {(fromStation && !toStation) && (
        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
          <p className="text-amber-700 text-sm">
            ⚠️ Vui lòng chọn trạm đến để hoàn tất tuyến đường
          </p>
        </div>
      )}

      {(!fromStation && toStation) && (
        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
          <p className="text-amber-700 text-sm">
            ⚠️ Vui lòng chọn trạm đi để hoàn tất tuyến đường
          </p>
        </div>
      )}
    </div>
  );
}

