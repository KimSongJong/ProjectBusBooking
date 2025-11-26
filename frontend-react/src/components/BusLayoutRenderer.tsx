import React from "react";
import type { TripSeat } from "@/types/tripSeat.types";

interface BusLayoutRendererProps {
  seats: TripSeat[];
  onSeatClick: (seat: TripSeat) => void;
  selectedSeats?: string[]; // Changed from number[] to string[] for seat numbers
  direction?: "outbound" | "return";
  viewMode?: "admin" | "customer";
}

/**
 * 🚌 BusLayoutRenderer - 2D Top-Down Bus Seat Layout
 *
 * Features:
 * - Realistic bus layout with driver position
 * - Door indicators
 * - Separate upper/lower floors for sleeper buses
 * - Click-to-select seats
 * - Visual status indicators (available, booked, locked)
 *
 * Layout Logic:
 * - Standard Bus (40 seats): 2-2 configuration (2 left + aisle + 2 right)
 *   └─ 10 rows x 4 seats = 40 seats total
 * - Sleeper Bus (36 beds): 2-1 configuration per floor
 *   └─ 12 rows x 3 beds = 36 beds (A1-A18 lower, B1-B18 upper)
 *   └─ Beds are longer and wider than standard seats
 * - Seat numbering: A1-A20 (lower), B1-B20 (upper) for standard
 * - Bed numbering: A1-A18 (lower), B1-B18 (upper) for sleeper
 */
const BusLayoutRenderer: React.FC<BusLayoutRendererProps> = ({
  seats,
  onSeatClick,
  selectedSeats = [],
  direction = "outbound",
  viewMode = "customer",
}) => {
  // Separate seats by floor
  const lowerFloorSeats = seats.filter(s => s.seatNumber.startsWith('A'));
  const upperFloorSeats = seats.filter(s => s.seatNumber.startsWith('B'));

  const hasUpperFloor = upperFloorSeats.length > 0;

  // Determine vehicle type from seat type
  const isSleeper = seats.some(s => s.seatType === "bed");

  // Get seat status styling
  const getSeatStyle = (seat: TripSeat) => {
    const isSelected = selectedSeats.includes(seat.seatNumber); // ✅ Fixed: compare by seatNumber

    const baseStyle = "relative rounded-lg border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-xs font-bold";

    // Size based on type
    const sizeStyle = isSleeper ? "w-16 h-20" : "w-14 h-14";

    // Status colors
    let colorStyle = "";
    if (isSelected) {
      // ✅ Orange color for selected seats
      colorStyle = "bg-orange-500 border-orange-600 text-white shadow-lg scale-105 ring-2 ring-orange-300";
    } else if (seat.status === "available") {
      colorStyle = "bg-green-100 border-green-500 text-green-800 hover:bg-green-200 hover:scale-105";
    } else if (seat.status === "booked") {
      colorStyle = "bg-red-100 border-red-500 text-red-800 cursor-not-allowed opacity-70";
    } else { // locked
      colorStyle = "bg-slate-300 border-slate-500 text-slate-700 cursor-not-allowed opacity-60";
    }

    return `${baseStyle} ${sizeStyle} ${colorStyle}`;
  };

  // Get icon for seat type
  const getSeatIcon = (seatType: string) => {
    switch (seatType) {
      case "bed": return "🛏️";
      case "vip": return "👑";
      default: return "🪑"; // Chair icon
    }
  };

  // Render a single seat
  const renderSeat = (seat: TripSeat) => {
    const isClickable = seat.status === "available" || viewMode === "admin";

    return (
      <div
        key={seat.id}
        onClick={() => isClickable && onSeatClick(seat)}
        className={getSeatStyle(seat)}
        title={`${seat.seatNumber} - ${seat.status} - ${seat.seatType}`}
      >
        <span className="text-[10px] font-bold">{seat.seatNumber}</span>
        <span className="text-base">{getSeatIcon(seat.seatType)}</span>
      </div>
    );
  };

  // Organize seats into rows (Standard bus: 4 seats/row, Sleeper: 3 beds/row)
  const organizeSeatsByRow = (floorSeats: TripSeat[]) => {
    const seatsPerRow = isSleeper ? 3 : 4;
    const rows: TripSeat[][] = [];

    // Sort seats by number
    const sortedSeats = [...floorSeats].sort((a, b) => {
      const numA = parseInt(a.seatNumber.substring(1));
      const numB = parseInt(b.seatNumber.substring(1));
      return numA - numB;
    });

    // Group into rows
    for (let i = 0; i < sortedSeats.length; i += seatsPerRow) {
      rows.push(sortedSeats.slice(i, i + seatsPerRow));
    }

    return rows;
  };

  // Render floor layout
  const renderFloorLayout = (floorSeats: TripSeat[], floorName: string) => {
    const rows = organizeSeatsByRow(floorSeats);

    return (
      <div className="bg-white p-6 rounded-xl border-2 border-gray-300 shadow-md">
        {/* Floor Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            {floorName === "Tầng trên" ? "🔼" : "🔽"} {floorName}
          </h3>
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-green-600">
              {floorSeats.filter(s => s.status === 'available').length}
            </span>
            /{floorSeats.length} trống
          </div>
        </div>

        {/* Bus Container */}
        <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl p-4 border-4 border-gray-400">
          {/* Driver Section (only on lower floor or single floor) */}
          {(floorName === "Tầng dưới" || !hasUpperFloor) && (
            <div className="flex items-center justify-between mb-4 bg-blue-100 border-2 border-blue-300 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🚗</div>
                <span className="text-xs font-bold text-blue-800">Tài xế</span>
              </div>
              <div className="text-xs text-blue-600 font-medium">🚪 Cửa lên</div>
            </div>
          )}

          {/* Seat Grid */}
          <div className="space-y-3">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center gap-2">
                {isSleeper ? (
                  // Sleeper Layout: 2 beds - aisle - 1 bed
                  <>
                    <div className="flex gap-2">
                      {row.slice(0, 2).map(seat => renderSeat(seat))}
                    </div>
                    <div className="w-8 h-full flex items-center justify-center">
                      <div className="w-1 h-16 bg-gradient-to-b from-gray-300 via-yellow-400 to-gray-300 rounded-full"></div>
                    </div>
                    <div>
                      {row[2] && renderSeat(row[2])}
                    </div>
                  </>
                ) : (
                  // Standard Layout: 2 seats - aisle - 2 seats
                  <>
                    <div className="flex gap-2">
                      {row.slice(0, 2).map(seat => renderSeat(seat))}
                    </div>
                    <div className="w-6 h-full flex items-center justify-center">
                      <div className="w-1 h-12 bg-gradient-to-b from-gray-300 via-yellow-400 to-gray-300 rounded-full"></div>
                    </div>
                    <div className="flex gap-2">
                      {row.slice(2, 4).map(seat => renderSeat(seat))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Back Door */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-lg px-3 py-1">
              <span className="text-xs font-bold text-orange-800">🚪 Cửa sau</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Seat Status Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="text-xs font-medium text-gray-700">Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 border-2 border-orange-600 rounded"></div>
          <span className="text-xs font-medium text-gray-700">Đã chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded"></div>
          <span className="text-xs font-medium text-gray-700">Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-300 border-2 border-slate-500 rounded"></div>
          <span className="text-xs font-medium text-gray-700">Khóa</span>
        </div>
      </div>

      {/* Floor Layouts */}
      <div className={`grid ${hasUpperFloor ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {lowerFloorSeats.length > 0 && renderFloorLayout(lowerFloorSeats, hasUpperFloor ? "Tầng dưới" : "Sơ đồ ghế")}
        {upperFloorSeats.length > 0 && renderFloorLayout(upperFloorSeats, "Tầng trên")}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{seats.length}</div>
          <div className="text-xs text-gray-600">Tổng ghế</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {seats.filter(s => s.status === 'available').length}
          </div>
          <div className="text-xs text-gray-600">Còn trống</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {seats.filter(s => s.status === 'booked').length}
          </div>
          <div className="text-xs text-gray-600">Đã đặt</div>
        </div>
      </div>
    </div>
  );
};

export default BusLayoutRenderer;

