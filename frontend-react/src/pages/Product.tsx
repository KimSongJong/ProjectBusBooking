import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, ArrowLeftRight } from "lucide-react";
import { FaBus } from "react-icons/fa";
import { toast } from "sonner";
import Header from "@/components/header";
import Footer from "@/components/footer";
import tripService from "@/services/trip.service";
import routeService from "@/services/route.service";
import type { Trip } from "@/types/trip.types";
import type { Route } from "@/types/route.types";
import { ALL_PROVINCES, POPULAR_PROVINCES, getAvailableDestinations } from "@/constants/provinces";

function Product() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">(
    (searchParams.get("tripType") as "oneWay" | "roundTrip") || "oneWay"
  );
  const [passengers, setPassengers] = useState(
    Number(searchParams.get("passengers")) || 1
  );
  const [fromLocation, setFromLocation] = useState(
    searchParams.get("from") ? decodeURIComponent(searchParams.get("from")!) : ""
  );
  const [toLocation, setToLocation] = useState(
    searchParams.get("to") ? decodeURIComponent(searchParams.get("to")!) : ""
  );
  const [searchDate, setSearchDate] = useState(
    searchParams.get("date") || (() => {
      // Default to tomorrow instead of today since trips are scheduled for future dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    })()
  );
  const [returnDate, setReturnDate] = useState(
    searchParams.get("returnDate") || ""
  );
  const [trips, setTrips] = useState<Trip[]>([]);
  const [returnTrips, setReturnTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ⭐ Round trip states
  const [selectedOutboundTrip, setSelectedOutboundTrip] = useState<Trip | null>(null);
  const [selectedReturnTrip, setSelectedReturnTrip] = useState<Trip | null>(null);
  const [showReturnTrips, setShowReturnTrips] = useState(false);

  // Filter states
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [selectedSeatGrades, setSelectedSeatGrades] = useState<string[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);

  // Filtered trips based on selected filters
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Filter by time slots - Fixed logic to match real time ranges
    if (selectedTimeSlots.length > 0) {
      result = result.filter(trip => {
        const departureTime = new Date(trip.departureTime);
        const hour = departureTime.getHours();
        const minute = departureTime.getMinutes();
        const totalMinutes = hour * 60 + minute;

        return selectedTimeSlots.some(slot => {
          // Sáng sớm: 00:00 - 05:59 (strictly before 6am)
          if (slot === "early") return totalMinutes >= 0 && totalMinutes < 360;
          // Buổi sáng: 06:00 - 11:59 (from 6am to before noon)
          if (slot === "morning") return totalMinutes >= 360 && totalMinutes < 720;
          // Buổi chiều: 12:00 - 17:59 (from noon to before 6pm)
          if (slot === "afternoon") return totalMinutes >= 720 && totalMinutes < 1080;
          // Buổi tối: 18:00 - 23:59 (from 6pm to end of day)
          if (slot === "evening") return totalMinutes >= 1080 && totalMinutes < 1440;
          return false;
        });
      });
    }

    // Filter by vehicle type - Fixed to properly match limousine
    if (selectedVehicleTypes.length > 0) {
      result = result.filter(trip => {
        const vehicleType = trip.vehicle?.vehicleType?.toLowerCase() || '';
        return selectedVehicleTypes.some(type => {
          if (type === "standard") return vehicleType === "standard" || vehicleType === "ghế";
          if (type === "bed") return vehicleType === "bed" || vehicleType === "sleeper" || vehicleType === "giường" || vehicleType === "giường nằm";
          if (type === "vip") return vehicleType === "vip" || vehicleType === "limousine";
          return false;
        });
      });
    }

    // Filter by seat row (hàng ghế) - Based on available seats
    // Note: This is a simplified filter. In real scenario, we'd check actual seat availability by row
    if (selectedSeatGrades.length > 0) {
      result = result.filter(trip => {
        // For now, assume all trips have all rows available
        // This would require checking trip_seats data to know which specific rows have available seats
        return selectedSeatGrades.length > 0; // Keep all trips if any row filter is selected
      });
    }

    // Filter by floor (tầng) - Based on seat letters
    // Note: This is a simplified filter. In real scenario, we'd check trip_seats for A seats (lower) and B seats (upper)
    if (selectedFloors.length > 0) {
      result = result.filter(trip => {
        // For now, assume all double-decker buses have both floors
        // This would require checking trip_seats data for availability on each floor
        return selectedFloors.length > 0; // Keep all trips if any floor filter is selected
      });
    }

    return result;
  }, [trips, selectedTimeSlots, selectedVehicleTypes, selectedSeatGrades, selectedFloors]);

  // Count trips by time slot - Fixed to match filter logic
  const getTimeSlotCount = (slot: string) => {
    return trips.filter(trip => {
      const departureTime = new Date(trip.departureTime);
      const hour = departureTime.getHours();
      const minute = departureTime.getMinutes();
      const totalMinutes = hour * 60 + minute;

      // Sáng sớm: 00:00 - 05:59
      if (slot === "early") return totalMinutes >= 0 && totalMinutes < 360;
      // Buổi sáng: 06:00 - 11:59
      if (slot === "morning") return totalMinutes >= 360 && totalMinutes < 720;
      // Buổi chiều: 12:00 - 17:59
      if (slot === "afternoon") return totalMinutes >= 720 && totalMinutes < 1080;
      // Buổi tối: 18:00 - 23:59
      if (slot === "evening") return totalMinutes >= 1080 && totalMinutes < 1440;
      return false;
    }).length;
  };

  // Count trips by vehicle type - Fixed to properly count limousine
  const getVehicleTypeCount = (type: string) => {
    return trips.filter(trip => {
      const vehicleType = trip.vehicle?.vehicleType?.toLowerCase() || '';
      if (type === "standard") return vehicleType === "standard" || vehicleType === "ghế";
      if (type === "bed") return vehicleType === "bed" || vehicleType === "sleeper" || vehicleType === "giường" || vehicleType === "giường nằm";
      if (type === "vip") return vehicleType === "vip" || vehicleType === "limousine";
      return false;
    }).length;
  };

  // Toggle filter functions
  const toggleTimeSlot = (value: string) => {
    setSelectedTimeSlots(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleVehicleType = (value: string) => {
    setSelectedVehicleTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  // ⭐ Use ALL_PROVINCES constant instead of API routes for consistency with MainPage
  const availableFromLocations = useMemo(() => {
    return ALL_PROVINCES.map(p => p.name);
  }, []);

  const availableToLocations = useMemo(() => {
    if (!fromLocation) return [];
    return getAvailableDestinations(fromLocation).map(p => p.name);
  }, [fromLocation]);

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // ⭐ Auto-search when coming from external link with URL params
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    console.log("🔍 URL Params:", { fromParam, toParam });
    console.log("📍 Current State:", { fromLocation, toLocation });

    // Only auto-search if we have URL params and haven't searched yet
    if (fromParam && toParam && !hasSearched) {
      console.log("✅ Auto-searching with params...");
      handleSearch();
    }
  }, [searchParams, hasSearched]);

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAllRoutes();
      if (response.success && response.data) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      toast.error("Vui lòng chọn điểm đi và điểm đến");
      return;
    }

    // ⭐ Validate return date for round trip
    if (tripType === "roundTrip" && !returnDate) {
      toast.error("Vui lòng chọn ngày về cho vé khứ hồi");
      return;
    }

    if (tripType === "roundTrip" && returnDate <= searchDate) {
      toast.error("Ngày về phải sau ngày đi ít nhất 1 ngày");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      // Reset selections when searching
      setSelectedOutboundTrip(null);
      setSelectedReturnTrip(null);
      setShowReturnTrips(false);

      const response = await tripService.getAllTrips();

      if (response.success && response.data) {
        // Filter outbound trips
        const filteredTrips = response.data.filter((trip) => {
          const fromMatch = trip.route.fromLocation.toLowerCase().includes(fromLocation.toLowerCase().trim());
          const toMatch = trip.route.toLocation.toLowerCase().includes(toLocation.toLowerCase().trim());
          const matchRoute = fromMatch && toMatch;

          const tripDate = new Date(trip.departureTime).toISOString().split("T")[0];
          const matchDate = tripDate === searchDate;

          const isScheduled = trip.status === "scheduled";

          return matchRoute && matchDate && isScheduled;
        });

        setTrips(filteredTrips);

        if (filteredTrips.length === 0) {
          toast.warning("Không tìm thấy chuyến xe phù hợp");
        } else {
          toast.success(`Tìm thấy ${filteredTrips.length} chuyến xe`);
        }
      }
    } catch (error: any) {
      toast.error("Không thể tìm kiếm chuyến xe");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Handle outbound trip selection
  const handleSelectOutboundTrip = async (trip: Trip) => {
    setSelectedOutboundTrip(trip);

    if (tripType === "roundTrip") {
      // Round trip: Just search for return trips, DON'T navigate yet
      toast.info("Đang tìm chuyến về...");
      await searchReturnTrips();
    } else {
      // One-way: Navigate directly to booking seat
      navigate(`/booking-seat?tripId=${trip.id}`);
    }
  };

  // ⭐ Search return trips (reverse route)
  const searchReturnTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getAllTrips();

      if (response.success && response.data) {
        // Filter return trips (reverse route)
        const filtered = response.data.filter((trip) => {
          const fromMatch = trip.route.fromLocation.toLowerCase().includes(toLocation.toLowerCase().trim());
          const toMatch = trip.route.toLocation.toLowerCase().includes(fromLocation.toLowerCase().trim());
          const matchRoute = fromMatch && toMatch;

          const tripDate = new Date(trip.departureTime).toISOString().split("T")[0];
          const matchDate = tripDate === returnDate;

          const isScheduled = trip.status === "scheduled";

          return matchRoute && matchDate && isScheduled;
        });

        setReturnTrips(filtered);
        setShowReturnTrips(true);

        if (filtered.length === 0) {
          toast.warning("Không tìm thấy chuyến về phù hợp. Vui lòng chọn ngày khác hoặc đặt vé một chiều.");
        } else {
          toast.success(`Tìm thấy ${filtered.length} chuyến về`);
        }
      }
    } catch (error) {
      toast.error("Không thể tìm kiếm chuyến về");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Handle return trip selection
  const handleSelectReturnTrip = (trip: Trip) => {
    setSelectedReturnTrip(trip);
  };

  // ⭐ Continue to booking seat with both trips
  const handleContinueToBooking = () => {
    if (!selectedOutboundTrip || !selectedReturnTrip) {
      toast.error("Vui lòng chọn cả chuyến đi và chuyến về");
      return;
    }

    navigate(`/booking-seat?outboundTripId=${selectedOutboundTrip.id}&returnTripId=${selectedReturnTrip.id}&tripType=roundTrip`);
  };

  // Filtered trips based on selected filters
  const finalFilteredTrips = useMemo(() => {
    let result = [...trips];

    // Apply vehicle type filter
    if (selectedVehicleTypes.length > 0) {
      result = result.filter(trip => {
        const vehicleType = trip.vehicle?.vehicleType?.toLowerCase() || '';
        return selectedVehicleTypes.some(type => {
          if (type === "standard") return vehicleType === "standard" || vehicleType === "ghế";
          if (type === "bed") return vehicleType === "bed" || vehicleType === "sleeper" || vehicleType === "giường" || vehicleType === "giường nằm";
          if (type === "vip") return vehicleType === "vip" || vehicleType === "limousine";
          return false;
        });
      });
    }

    // Apply time slot filter
    if (selectedTimeSlots.length > 0) {
      result = result.filter(trip => {
        const departureTime = new Date(trip.departureTime);
        const hour = departureTime.getHours();
        const minute = departureTime.getMinutes();
        const totalMinutes = hour * 60 + minute;

        return selectedTimeSlots.some(slot => {
          // Sáng sớm: 00:00 - 05:59 (strictly before 6am)
          if (slot === "early") return totalMinutes >= 0 && totalMinutes < 360;
          // Buổi sáng: 06:00 - 11:59 (from 6am to before noon)
          if (slot === "morning") return totalMinutes >= 360 && totalMinutes < 720;
          // Buổi chiều: 12:00 - 17:59 (from noon to before 6pm)
          if (slot === "afternoon") return totalMinutes >= 720 && totalMinutes < 1080;
          // Buổi tối: 18:00 - 23:59 (from 6pm to end of day)
          if (slot === "evening") return totalMinutes >= 1080 && totalMinutes < 1440;
          return false;
        });
      });
    }

    // Apply seat grade filter (hàng ghế)
    if (selectedSeatGrades.length > 0) {
      result = result.filter(trip => {
        // For now, assume all trips have all rows available
        // This would require checking trip_seats data to know which specific rows have available seats
        return selectedSeatGrades.length > 0; // Keep all trips if any row filter is selected
      });
    }

    // Apply floor filter (tầng)
    if (selectedFloors.length > 0) {
      result = result.filter(trip => {
        // For now, assume all double-decker buses have both floors
        // This would require checking trip_seats data for availability on each floor
        return selectedFloors.length > 0; // Keep all trips if any floor filter is selected
      });
    }

    return result;
  }, [trips, selectedVehicleTypes, selectedTimeSlots, selectedSeatGrades, selectedFloors]);

  // Helper functions
  const getVehicleTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      standard: "Ghế",
      vip: "Ghế VIP",
      sleeper: "Giường nằm",
      limousine: "Limousine",
    };
    return labels[type.toLowerCase()] || type;
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getAvailableSeats = (trip: Trip) => {
    if (trip.availableSeats !== undefined && trip.availableSeats !== null) {
      return trip.availableSeats;
    }
    return trip.vehicle?.totalSeats || 40;
  };

  const toggleFilter = (filterArray: string[], setFilter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearFilters = () => {
    setSelectedTimeSlots([]);
    setSelectedVehicleTypes([]);
    setSelectedSeatGrades([]);
    setSelectedFloors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner with buses - FUTA Style */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-green-800 mb-2">24</h1>
              <p className="text-xl font-semibold text-green-700">VỮNG TIN & PHÁT TRIỂN</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-6xl">🚌</div>
              <div className="text-7xl">🚌</div>
              <div className="text-6xl">🚌</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Form - FUTA Style with all options */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            {/* Trip Type */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="oneWay"
                  checked={tripType === "oneWay"}
                  onChange={() => setTripType("oneWay")}
                  className="w-4 h-4"
                />
                <Label htmlFor="oneWay" className="cursor-pointer">Một chiều</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="roundTrip"
                  checked={tripType === "roundTrip"}
                  onChange={() => setTripType("roundTrip")}
                  className="w-4 h-4"
                />
                <Label htmlFor="roundTrip" className="cursor-pointer">Khứ hồi</Label>
              </div>
              <a href="#" className="ml-auto text-orange-600 text-sm hover:underline">Hướng dẫn mua vé</a>
            </div>

            {/* Search Inputs Row - Fixed layout with 6 columns */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              {/* From */}
              <div className="md:col-span-1">
                <Label className="mb-2 block">Điểm đi</Label>
                <Select value={fromLocation} onValueChange={(value) => {
                  setFromLocation(value);
                  // Reset điểm đến nếu không còn hợp lệ
                  if (toLocation && !getAvailableDestinations(value).some(p => p.name === toLocation)) {
                    setToLocation("");
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn điểm đi" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {/* Popular provinces */}
                    <div className="font-semibold text-sm text-gray-500 px-2 py-1.5">
                      Thành phố lớn
                    </div>
                    {POPULAR_PROVINCES.map((province) => (
                      <SelectItem key={province.name} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}

                    {/* Divider */}
                    <div className="border-t my-2"></div>

                    {/* All provinces */}
                    <div className="font-semibold text-sm text-gray-500 px-2 py-1.5">
                      Tất cả tỉnh thành
                    </div>
                    {ALL_PROVINCES.filter(p => !p.isPopular).map((province) => (
                      <SelectItem key={province.name} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap */}
              <div className="flex items-end justify-center md:col-span-1">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleSwapLocations}>
                  <ArrowLeftRight className="h-5 w-5" />
                </Button>
              </div>

              {/* To */}
              <div className="md:col-span-1">
                <Label className="mb-2 block">Điểm đến</Label>
                <Select value={toLocation} onValueChange={setToLocation} disabled={!fromLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder={fromLocation ? "Chọn điểm đến" : "Chọn điểm đi trước"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableToLocations.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-gray-500 text-center">
                        Không có điểm đến khả dụng
                      </div>
                    ) : (
                      availableToLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="md:col-span-1">
                <Label className="mb-2 block">Ngày đi</Label>
                <Input
                  type="date"
                  value={searchDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>

              {/* Return Date - Show for round trip, or empty space for one-way */}
              {tripType === "roundTrip" ? (
                <div className="md:col-span-1">
                  <Label className="mb-2 block text-orange-600">Ngày về</Label>
                  <Input
                    type="date"
                    value={returnDate}
                    min={searchDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    placeholder="Thêm ngày về"
                  />
                </div>
              ) : (
                <div className="hidden md:block md:col-span-1"></div>
              )}

              {/* Passengers - Always in the last column */}
              <div className="md:col-span-1">
                <Label className="mb-2 block">Số vé</Label>
                <Select value={passengers.toString()} onValueChange={(v) => setPassengers(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num} vé</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold rounded-full"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Đang tìm kiếm..." : "Tìm chuyến xe"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section with Filters */}
        {hasSearched && (
          <>
            <h2 className="text-2xl font-bold mb-4">
              {fromLocation} - {toLocation} ({filteredTrips.length})
            </h2>

            <div className="grid grid-cols-12 gap-6">
              {/* Filters Sidebar - FUTA Style */}
              <div className="col-span-12 lg:col-span-3">
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">BỘ LỌC TÌM KIẾM</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-500 text-sm"
                    >
                      Bỏ lọc 🗑️
                    </Button>
                  </div>

                  {/* Time Slots */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Giờ đi</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Sáng sớm 00:00 - 06:00", value: "early" },
                        { label: "Buổi sáng 06:00 - 12:00", value: "morning" },
                        { label: "Buổi chiều 12:00 - 18:00", value: "afternoon" },
                        { label: "Buổi tối 18:00 - 24:00", value: "evening" }
                      ].map((slot) => (
                        <label key={slot.value} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer"
                            checked={selectedTimeSlots.includes(slot.value)}
                            onChange={() => toggleTimeSlot(slot.value)}
                          />
                          <span>{slot.label} ({getTimeSlotCount(slot.value)})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Loại xe</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Ghế", value: "standard" },
                        { label: "Giường", value: "bed" },
                        { label: "Limousine", value: "vip" }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => toggleVehicleType(type.value)}
                          className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                            selectedVehicleTypes.includes(type.value)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {type.label} ({getVehicleTypeCount(type.value)})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seat Row - Based on seat position */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Hàng ghế</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Hàng đầu", value: "front" },
                        { label: "Hàng giữa", value: "middle" },
                        { label: "Hàng cuối", value: "back" }
                      ].map((row) => (
                        <button
                          key={row.value}
                          onClick={() => toggleFilter(selectedSeatGrades, setSelectedSeatGrades, row.value)}
                          className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                            selectedSeatGrades.includes(row.value)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {row.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Floor - Upper/Lower deck */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Tầng</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Tầng dưới", value: "lower" },
                        { label: "Tầng trên", value: "upper" }
                      ].map((floor) => (
                        <button
                          key={floor.value}
                          onClick={() => toggleFilter(selectedFloors, setSelectedFloors, floor.value)}
                          className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                            selectedFloors.includes(floor.value)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {floor.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Trip List - Center Column */}
              <div className="col-span-12 lg:col-span-6">
                {/* ⭐ Selected Outbound Trip Summary (Round Trip Only) */}
                {tripType === "roundTrip" && selectedOutboundTrip && (
                  <Card className="mb-4 bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">✅</div>
                          <div>
                            <div className="font-bold text-green-800">Đã chọn chuyến đi</div>
                            <div className="text-sm text-gray-600">
                              {selectedOutboundTrip.route.fromLocation} → {selectedOutboundTrip.route.toLocation} | {formatTime(selectedOutboundTrip.departureTime)} | {formatPrice(Number(selectedOutboundTrip.route.basePrice))}đ
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOutboundTrip(null);
                            setShowReturnTrips(false);
                            setSelectedReturnTrip(null);
                          }}
                          className="text-red-600"
                        >
                          Chọn lại
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ⭐ Outbound Trips Section */}
                {(!selectedOutboundTrip || tripType === "oneWay") && (
                  <>
                    {tripType === "roundTrip" && (
                      <h3 className="text-xl font-bold mb-3 text-green-800">
                        🚌 CHUYẾN ĐI: {fromLocation} → {toLocation}
                      </h3>
                    )}

                    {loading ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                          <p className="mt-4">Đang tìm kiếm...</p>
                        </CardContent>
                      </Card>
                    ) : finalFilteredTrips.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">📋</div>
                          <p className="text-xl">Không có kết quả được tìm thấy với bộ lọc này.</p>
                          <p className="text-sm mt-2 text-gray-400">Thử bỏ bớt bộ lọc để xem thêm chuyến xe.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {finalFilteredTrips.map((trip) => (
                          <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                {/* Time */}
                                <div className="flex items-center gap-8">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{formatTime(trip.departureTime)}</div>
                                    <div className="text-sm text-gray-500">{trip.route.fromLocation}</div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-sm text-gray-500">{formatDuration(trip.route.estimatedDuration || 0)}</div>
                                    <div className="text-2xl">🚌</div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{formatTime(trip.arrivalTime)}</div>
                                    <div className="text-sm text-gray-500">{trip.route.toLocation}</div>
                                  </div>
                                </div>

                                {/* Info */}
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">{getVehicleTypeLabel(trip.vehicle.vehicleType)}</span>
                                    <span className="text-sm">• {getAvailableSeats(trip)} chỗ trống</span>
                                  </div>
                                  <div className="text-2xl font-bold text-orange-600 mb-2">
                                    {formatPrice(Number(trip.route.basePrice))}đ
                                  </div>
                                  <Button
                                    onClick={() => handleSelectOutboundTrip(trip)}
                                    className="bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full"
                                  >
                                    Chọn chuyến
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ⭐ Return Trips Section (Round Trip Only) */}
                {tripType === "roundTrip" && showReturnTrips && (
                  <>
                    <h3 className="text-xl font-bold mb-3 mt-6 text-blue-800">
                      🔄 CHUYẾN VỀ: {toLocation} → {fromLocation}
                    </h3>

                    {loading ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                          <p className="mt-4">Đang tìm chuyến về...</p>
                        </CardContent>
                      </Card>
                    ) : returnTrips.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">😕</div>
                          <p className="text-xl">Không tìm thấy chuyến về phù hợp</p>
                          <p className="text-sm mt-2 text-gray-400">Vui lòng chọn ngày khác hoặc đặt vé một chiều</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {returnTrips.map((trip) => (
                          <Card
                            key={trip.id}
                            className={`hover:shadow-lg transition-shadow ${
                              selectedReturnTrip?.id === trip.id ? 'border-2 border-blue-500' : ''
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                {/* Time */}
                                <div className="flex items-center gap-8">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{formatTime(trip.departureTime)}</div>
                                    <div className="text-sm text-gray-500">{trip.route.fromLocation}</div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-sm text-gray-500">{formatDuration(trip.route.estimatedDuration || 0)}</div>
                                    <div className="text-2xl">🚌</div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{formatTime(trip.arrivalTime)}</div>
                                    <div className="text-sm text-gray-500">{trip.route.toLocation}</div>
                                  </div>
                                </div>

                                {/* Info */}
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">{getVehicleTypeLabel(trip.vehicle.vehicleType)}</span>
                                    <span className="text-sm">• {getAvailableSeats(trip)} chỗ trống</span>
                                  </div>
                                  <div className="text-2xl font-bold text-orange-600 mb-2">
                                    {formatPrice(Number(trip.route.basePrice))}đ
                                  </div>
                                  <Button
                                    onClick={() => handleSelectReturnTrip(trip)}
                                    className={`rounded-full ${
                                      selectedReturnTrip?.id === trip.id
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
                                    }`}
                                  >
                                    {selectedReturnTrip?.id === trip.id ? '✓ Đã chọn' : 'Chọn chuyến'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ⭐ NEW: Sticky Summary Sidebar (Round Trip Only) - Right Column */}
              {tripType === "roundTrip" && (
                <div className="col-span-12 lg:col-span-3">
                  <div className="sticky top-20">
                    <Card className="shadow-xl border-2 border-orange-200">
                      {/* Header with Progress */}
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <span>📋</span>
                          <span>VÉ KHỨ HỒI</span>
                        </h3>
                        <div className="text-sm mt-1 opacity-90">
                          Bước {selectedOutboundTrip && selectedReturnTrip ? '2' : '1'}/2
                        </div>
                      </div>

                      <CardContent className="p-4">
                        {/* Checklist */}
                        <div className="space-y-3 mb-4">
                          {/* Outbound Status */}
                          <div className={`p-3 rounded-lg border-2 ${selectedOutboundTrip ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start gap-2">
                              <div className="text-2xl">{selectedOutboundTrip ? '✅' : '⬜'}</div>
                              <div className="flex-1">
                                <div className={`font-bold ${selectedOutboundTrip ? 'text-green-800' : 'text-gray-500'}`}>
                                  Chuyến đi
                                </div>
                                {selectedOutboundTrip ? (
                                  <div className="text-xs text-gray-700 mt-1 space-y-0.5">
                                    <div>{selectedOutboundTrip.route.fromLocation} → {selectedOutboundTrip.route.toLocation}</div>
                                    <div>{formatTime(selectedOutboundTrip.departureTime)} | {new Date(selectedOutboundTrip.departureTime).toLocaleDateString('vi-VN')}</div>
                                    <div className="font-semibold text-orange-600">{formatPrice(Number(selectedOutboundTrip.route.basePrice))}đ</div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 mt-1">Chưa chọn</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Return Status */}
                          <div className={`p-3 rounded-lg border-2 ${selectedReturnTrip ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start gap-2">
                              <div className="text-2xl">{selectedReturnTrip ? '✅' : '⬜'}</div>
                              <div className="flex-1">
                                <div className={`font-bold ${selectedReturnTrip ? 'text-blue-800' : 'text-gray-500'}`}>
                                  Chuyến về
                                </div>
                                {selectedReturnTrip ? (
                                  <div className="text-xs text-gray-700 mt-1 space-y-0.5">
                                    <div>{selectedReturnTrip.route.fromLocation} → {selectedReturnTrip.route.toLocation}</div>
                                    <div>{formatTime(selectedReturnTrip.departureTime)} | {new Date(selectedReturnTrip.departureTime).toLocaleDateString('vi-VN')}</div>
                                    <div className="font-semibold text-orange-600">{formatPrice(Number(selectedReturnTrip.route.basePrice))}đ</div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 mt-1">Chưa chọn</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price Summary - Only show when both selected */}
                        {selectedOutboundTrip && selectedReturnTrip && (
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-orange-200 mb-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-700">Tạm tính:</span>
                                <span className="font-semibold">
                                  {formatPrice(Number(selectedOutboundTrip.route.basePrice) + Number(selectedReturnTrip.route.basePrice))}đ
                                </span>
                              </div>
                              <div className="flex justify-between text-green-600 font-bold">
                                <span>🎉 Giảm 10%:</span>
                                <span>
                                  -{formatPrice((Number(selectedOutboundTrip.route.basePrice) + Number(selectedReturnTrip.route.basePrice)) * 0.1)}đ
                                </span>
                              </div>
                              <div className="border-t-2 border-orange-300 pt-2"></div>
                              <div className="flex justify-between text-lg">
                                <span className="font-bold">TỔNG CỘNG:</span>
                                <span className="font-bold text-orange-600">
                                  {formatPrice((Number(selectedOutboundTrip.route.basePrice) + Number(selectedReturnTrip.route.basePrice)) * 0.9)}đ
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        {!selectedOutboundTrip && (
                          <Button disabled className="w-full py-6 text-base" variant="outline">
                            ⬆️ Vui lòng chọn chuyến đi
                          </Button>
                        )}
                        {selectedOutboundTrip && !selectedReturnTrip && (
                          <Button disabled className="w-full py-6 text-base" variant="outline">
                            ⬇️ Vui lòng chọn chuyến về
                          </Button>
                        )}
                        {selectedOutboundTrip && selectedReturnTrip && (
                          <Button
                            onClick={handleContinueToBooking}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-6 text-lg font-semibold animate-pulse"
                          >
                            Tiếp tục chọn ghế →
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Product;

