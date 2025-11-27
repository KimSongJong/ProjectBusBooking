import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Info } from "lucide-react";
import { toast } from "sonner";
import type { RoundTripBookingRequest } from "@/types/ticket.types";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/contexts/AuthContext";
import tripService from "@/services/trip.service";
import tripSeatService from "@/services/tripSeat.service";
import ticketService from "@/services/ticket.service";
import stationService from "@/services/station.service";
import type { Station } from "@/services/station.service";
import type { Trip } from "@/types/trip.types";
import type { TripSeat } from "@/types/tripSeat.types";
import type { PickupPoint, DropoffPoint } from "@/types/route.types";
import BusLayoutRenderer from "@/components/BusLayoutRenderer";

function BookingSeat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // ⭐ Round trip URL params
  const tripId = searchParams.get("tripId");
  const outboundTripId = searchParams.get("outboundTripId");
  const returnTripId = searchParams.get("returnTripId");
  const tripType = searchParams.get("tripType") as "oneWay" | "roundTrip" | null;
  const isRoundTrip = tripType === "roundTrip" && !!outboundTripId && !!returnTripId;

  // One-way trip states
  const [trip, setTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<TripSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // ⭐ Round trip states
  const [outboundTrip, setOutboundTrip] = useState<Trip | null>(null);
  const [returnTrip, setReturnTrip] = useState<Trip | null>(null);
  const [outboundSeats, setOutboundSeats] = useState<TripSeat[]>([]);
  const [returnSeats, setReturnSeats] = useState<TripSeat[]>([]);
  const [selectedOutboundSeats, setSelectedOutboundSeats] = useState<string[]>([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"outbound" | "return">("outbound");

  const [loading, setLoading] = useState(true);

  // Thông tin khách hàng
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Bến xe/VP");
  const [dropoffLocation, setDropoffLocation] = useState("Bến xe/VP");

  // ⭐ One-way: Pickup/Dropoff
  const [pickupType, setPickupType] = useState<'station' | 'transfer'>('station');
  const [dropoffType, setDropoffType] = useState<'station' | 'transfer'>('station');
  const [pickupPoint, setPickupPoint] = useState<string>('');
  const [dropoffPoint, setDropoffPoint] = useState<string>('');
  const [pickupOptions, setPickupOptions] = useState<PickupPoint[]>([]);
  const [dropoffOptions, setDropoffOptions] = useState<DropoffPoint[]>([]);

  // ⭐ Round trip: Separate pickup/dropoff for each trip
  const [outboundPickupPoint, setOutboundPickupPoint] = useState<string>('');
  const [outboundDropoffPoint, setOutboundDropoffPoint] = useState<string>('');
  const [outboundPickupOptions, setOutboundPickupOptions] = useState<PickupPoint[]>([]);
  const [outboundDropoffOptions, setOutboundDropoffOptions] = useState<DropoffPoint[]>([]);

  const [returnPickupPoint, setReturnPickupPoint] = useState<string>('');
  const [returnDropoffPoint, setReturnDropoffPoint] = useState<string>('');
  const [returnPickupOptions, setReturnPickupOptions] = useState<PickupPoint[]>([]);
  const [returnDropoffOptions, setReturnDropoffOptions] = useState<DropoffPoint[]>([]);

  // ⭐ NEW: Notes
  const [notes, setNotes] = useState<string>('');

  // ⭐ NEW: Last refresh timestamp
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ⭐ Function to refresh seat status (for polling)
  const refreshSeats = async () => {
    try {
      if (isRoundTrip) {
        // Refresh both trips
        if (outboundTripId) {
          const outboundSeatsResponse = await tripSeatService.getSeatsByTrip(Number(outboundTripId));
          if (outboundSeatsResponse.success && outboundSeatsResponse.data) {
            setOutboundSeats(outboundSeatsResponse.data);
            console.log("🔄 Refreshed outbound seats");
          }
        }
        if (returnTripId) {
          const returnSeatsResponse = await tripSeatService.getSeatsByTrip(Number(returnTripId));
          if (returnSeatsResponse.success && returnSeatsResponse.data) {
            setReturnSeats(returnSeatsResponse.data);
            console.log("🔄 Refreshed return seats");
          }
        }
      } else {
        // Refresh one-way trip
        if (tripId) {
          const seatsResponse = await tripSeatService.getSeatsByTrip(Number(tripId));
          if (seatsResponse.success && seatsResponse.data) {
            setSeats(seatsResponse.data);
            console.log("🔄 Refreshed seats");
          }
        }
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error("❌ Error refreshing seats:", error);
    }
  };

  // ⭐ Helper function to parse route pickup/dropoff points
  const parseRoutePoints = (route: any) => {
    try {
      const pickupPoints = typeof route.pickupPoints === 'string'
        ? JSON.parse(route.pickupPoints)
        : (route.pickupPoints || []);

      const dropoffPoints = typeof route.dropoffPoints === 'string'
        ? JSON.parse(route.dropoffPoints)
        : (route.dropoffPoints || []);

      return { pickupPoints, dropoffPoints };
    } catch (error) {
      console.error('Error parsing route points:', error);
      return { pickupPoints: [], dropoffPoints: [] };
    }
  };

  useEffect(() => {
    console.log('🔍 BookingSeat useEffect triggered');
    console.log('  tripId:', tripId);
    console.log('  outboundTripId:', outboundTripId);
    console.log('  returnTripId:', returnTripId);
    console.log('  tripType:', tripType);
    console.log('  isRoundTrip:', isRoundTrip);
    console.log('  authLoading:', authLoading);
    console.log('  user:', user);
    console.log('  isAuthenticated:', isAuthenticated);

    // ⭐ FIX: Wait for AuthContext to finish loading
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...');
      return;
    }

    // ⭐ DEBUG: Log user object structure
    console.log('🔍 User object details:');
    console.log('  user keys:', user ? Object.keys(user) : 'null');
    console.log('  user.id:', (user as any)?.id);
    console.log('  user.userId:', (user as any)?.userId);

    // ⭐ FIX: Support both user.id and user.userId
    const userId = (user as any)?.id || (user as any)?.userId;
    console.log('  computed userId:', userId);

    // ⭐ CRITICAL: Check authentication AFTER loading is done
    if (!isAuthenticated || !userId) {
      console.error('❌ User not authenticated or userId missing!');
      console.error('   isAuthenticated:', isAuthenticated);
      console.error('   user:', user);
      console.error('   userId:', userId);
      toast.error("Vui lòng đăng nhập để đặt vé", {
        description: "Bạn cần đăng nhập trước khi chọn ghế.",
        action: {
          label: "Đăng nhập",
          onClick: () => navigate("/login"),
        },
      });
      // Small delay to let user see the toast
      setTimeout(() => navigate("/login"), 500);
      return;
    }

    console.log('✅ User authenticated with userId:', userId, ', proceeding...');

    if (isRoundTrip) {
      console.log('✅ Fetching round trip data...');
      // Round trip: fetch both trips
      fetchRoundTripData();
    } else if (tripId) {
      console.log('✅ Fetching one-way trip data...');
      // One-way: fetch single trip
      fetchTripAndSeats();
    } else {
      console.log('❌ No valid trip params found');
      toast.error("Không tìm thấy thông tin chuyến xe");
      navigate("/product");
    }
  }, [tripId, outboundTripId, returnTripId, user, isAuthenticated, authLoading]);

  // ⭐ NEW: Parse pickup/dropoff points when trip is loaded
  useEffect(() => {
    if (trip?.route) {
      parsePickupDropoffPoints();
    }
  }, [trip]);

  const fetchTripAndSeats = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching trip and seats for tripId:", tripId);

      // Lấy thông tin trip
      console.log("📡 Calling getTripById...");
      const tripResponse = await tripService.getTripById(Number(tripId));
      console.log("📦 Trip response:", tripResponse);

      if (tripResponse.success && tripResponse.data) {
        setTrip(tripResponse.data);
        console.log("✅ Trip loaded:", tripResponse.data);
      } else {
        console.error("❌ Trip not found or API error");
        toast.error("Không tìm thấy thông tin chuyến xe");
        return;
      }

      // Lấy danh sách ghế
      console.log("📡 Calling getSeatsByTrip...");
      const seatsResponse = await tripSeatService.getSeatsByTrip(
        Number(tripId)
      );
      console.log("📦 Seats response:", seatsResponse);

      if (seatsResponse.success && seatsResponse.data) {
        setSeats(seatsResponse.data);
        console.log("✅ Seats loaded:", seatsResponse.data.length, "seats");
      } else {
        console.error("❌ Seats not found or API error");
        toast.warning("Không tải được danh sách ghế");
      }
    } catch (error: any) {
      console.error("❌ Error fetching trip/seats:", error);
      toast.error(error.message || "Không thể tải thông tin chuyến xe");
    } finally {
      setLoading(false);
      console.log("✅ Loading complete");
    }
  };

  // ⭐ NEW: Fetch data for round trip (2 trips)
  const fetchRoundTripData = async () => {
    try {
      setLoading(true);
      console.log("🎫 Fetching round trip data...");
      console.log("Outbound Trip ID:", outboundTripId);
      console.log("Return Trip ID:", returnTripId);

      if (!outboundTripId || !returnTripId) {
        console.error("❌ Missing trip IDs!");
        toast.error("Thiếu thông tin chuyến xe");
        navigate("/product");
        return;
      }

      // Fetch outbound trip
      console.log("📡 Fetching outbound trip ID:", outboundTripId);
      const outboundResponse = await tripService.getTripById(Number(outboundTripId));
      console.log("📦 Outbound response:", outboundResponse);

      if (outboundResponse.success && outboundResponse.data) {
        setOutboundTrip(outboundResponse.data);
        console.log("✅ Outbound trip loaded:", outboundResponse.data);
      } else {
        console.error("❌ Failed to load outbound trip:", outboundResponse);
        toast.error("Không tìm thấy chuyến đi");
        return;
      }

      // Fetch return trip
      console.log("📡 Fetching return trip ID:", returnTripId);
      const returnResponse = await tripService.getTripById(Number(returnTripId));
      console.log("📦 Return response:", returnResponse);

      if (returnResponse.success && returnResponse.data) {
        setReturnTrip(returnResponse.data);
        console.log("✅ Return trip loaded:", returnResponse.data);
      } else {
        console.error("❌ Failed to load return trip:", returnResponse);
        toast.error("Không tìm thấy chuyến về");
        return;
      }

      // Fetch outbound seats
      console.log("📡 Fetching outbound seats for trip:", outboundTripId);
      const outboundSeatsResponse = await tripSeatService.getSeatsByTrip(Number(outboundTripId));
      console.log("📦 Outbound seats response:", outboundSeatsResponse);

      if (outboundSeatsResponse.success && outboundSeatsResponse.data) {
        setOutboundSeats(outboundSeatsResponse.data);
        console.log("✅ Outbound seats loaded:", outboundSeatsResponse.data.length);
      } else {
        console.error("❌ Failed to load outbound seats:", outboundSeatsResponse);
        toast.error("Không tìm thấy danh sách ghế chuyến đi");
        return;
      }

      // Fetch return seats
      console.log("📡 Fetching return seats for trip:", returnTripId);
      const returnSeatsResponse = await tripSeatService.getSeatsByTrip(Number(returnTripId));
      console.log("📦 Return seats response:", returnSeatsResponse);

      if (returnSeatsResponse.success && returnSeatsResponse.data) {
        setReturnSeats(returnSeatsResponse.data);
        console.log("✅ Return seats loaded:", returnSeatsResponse.data.length);
      } else {
        console.error("❌ Failed to load return seats:", returnSeatsResponse);
        toast.error("Không tìm thấy danh sách ghế chuyến về");
        return;
      }

      // ⭐ Load outbound stations by city
      if (outboundResponse.data?.route) {
        const fromCity = outboundResponse.data.route.fromLocation;
        const toCity = outboundResponse.data.route.toLocation;

        try {
          console.log(`🚉 Loading outbound stations: ${fromCity} → ${toCity}`);
          console.log(`🔍 From city type:`, typeof fromCity, `value: "${fromCity}"`);
          console.log(`🔍 To city type:`, typeof toCity, `value: "${toCity}"`);

          // Load pickup stations (from city)
          console.log(`📡 Calling getStationsByCity("${fromCity}")...`);
          const pickupResponse = await stationService.getStationsByCity(fromCity);
          console.log(`📦 Pickup response:`, pickupResponse);
          console.log(`📦 Pickup response type:`, typeof pickupResponse);
          console.log(`📦 Pickup response.success:`, pickupResponse?.success);
          console.log(`📦 Pickup response.data:`, pickupResponse?.data);

          if (pickupResponse.success && pickupResponse.data) {
            console.log(`📋 Raw pickup data:`, pickupResponse.data);
            const pickupStations = pickupResponse.data.map((station: Station) => ({
              name: station.name,
              address: station.address,
              latitude: station.latitude,
              longitude: station.longitude,
            }));
            setOutboundPickupOptions(pickupStations);
            if (pickupStations.length > 0) {
              setOutboundPickupPoint(pickupStations[0].name);
              console.log(`✅ Loaded ${pickupStations.length} outbound pickup stations`);
            } else {
              console.warn(`⚠️ pickupStations array is empty after mapping`);
            }
          } else {
            console.error(`❌ Failed to load pickup stations - success: ${pickupResponse.success}, data:`, pickupResponse.data);
          }

          // Load dropoff stations (to city)
          console.log(`📡 Calling getStationsByCity("${toCity}")...`);
          const dropoffResponse = await stationService.getStationsByCity(toCity);
          console.log(`📦 Dropoff response:`, dropoffResponse);

          if (dropoffResponse.success && dropoffResponse.data) {
            console.log(`📋 Raw dropoff data:`, dropoffResponse.data);
            const dropoffStations = dropoffResponse.data.map((station: Station) => ({
              name: station.name,
              address: station.address,
              latitude: station.latitude,
              longitude: station.longitude,
            }));
            setOutboundDropoffOptions(dropoffStations);
            if (dropoffStations.length > 0) {
              setOutboundDropoffPoint(dropoffStations[0].name);
              console.log(`✅ Loaded ${dropoffStations.length} outbound dropoff stations`);
            } else {
              console.warn(`⚠️ dropoffStations array is empty after mapping`);
            }
          } else {
            console.error(`❌ Failed to load dropoff stations - success: ${dropoffResponse.success}, data:`, dropoffResponse.data);
          }
        } catch (error: any) {
          console.error("❌❌❌ CRITICAL ERROR loading outbound stations:");
          console.error("  Error type:", typeof error);
          console.error("  Error message:", error?.message);
          console.error("  Error stack:", error?.stack);
          console.error("  Full error object:", error);

          console.log("⚠️ Falling back to route pickup/dropoff points");
          const { pickupPoints, dropoffPoints } = parseRoutePoints(outboundResponse.data.route);
          setOutboundPickupOptions(pickupPoints);
          setOutboundDropoffOptions(dropoffPoints);
          if (pickupPoints.length > 0) setOutboundPickupPoint(pickupPoints[0].name);
          if (dropoffPoints.length > 0) setOutboundDropoffPoint(dropoffPoints[0].name);
        }
      }

      // ⭐ Load return stations by city
      if (returnResponse.data?.route) {
        const fromCity = returnResponse.data.route.fromLocation;
        const toCity = returnResponse.data.route.toLocation;

        try {
          console.log(`🚉 Loading return stations: ${fromCity} → ${toCity}`);

          // Load pickup stations (from city)
          console.log(`📡 [RETURN] Calling getStationsByCity("${fromCity}")...`);
          const pickupResponse = await stationService.getStationsByCity(fromCity);
          console.log(`📦 [RETURN] Pickup response:`, pickupResponse);

          if (pickupResponse.success && pickupResponse.data) {
            console.log(`📋 [RETURN] Raw pickup data:`, pickupResponse.data);
            const pickupStations = pickupResponse.data.map((station: Station) => ({
              name: station.name,
              address: station.address,
              latitude: station.latitude,
              longitude: station.longitude,
            }));
            setReturnPickupOptions(pickupStations);
            if (pickupStations.length > 0) {
              setReturnPickupPoint(pickupStations[0].name);
              console.log(`✅ Loaded ${pickupStations.length} return pickup stations`);
            } else {
              console.warn(`⚠️ [RETURN] pickupStations array is empty`);
            }
          } else {
            console.error(`❌ [RETURN] Failed to load pickup stations`);
          }

          // Load dropoff stations (to city)
          console.log(`📡 [RETURN] Calling getStationsByCity("${toCity}")...`);
          const dropoffResponse = await stationService.getStationsByCity(toCity);
          console.log(`📦 [RETURN] Dropoff response:`, dropoffResponse);

          if (dropoffResponse.success && dropoffResponse.data) {
            console.log(`📋 [RETURN] Raw dropoff data:`, dropoffResponse.data);
            const dropoffStations = dropoffResponse.data.map((station: Station) => ({
              name: station.name,
              address: station.address,
              latitude: station.latitude,
              longitude: station.longitude,
            }));
            setReturnDropoffOptions(dropoffStations);
            if (dropoffStations.length > 0) {
              setReturnDropoffPoint(dropoffStations[0].name);
              console.log(`✅ Loaded ${dropoffStations.length} return dropoff stations`);
            }
          }
        } catch (error: any) {
          console.error("❌❌❌ CRITICAL ERROR loading return stations:");
          console.error("  Error type:", typeof error);
          console.error("  Error message:", error?.message);
          console.error("  Error stack:", error?.stack);
          console.error("  Full error object:", error);

          console.log("⚠️ Falling back to route pickup/dropoff points");
          const { pickupPoints, dropoffPoints } = parseRoutePoints(returnResponse.data.route);
          setReturnPickupOptions(pickupPoints);
          setReturnDropoffOptions(dropoffPoints);
          if (pickupPoints.length > 0) setReturnPickupPoint(pickupPoints[0].name);
          if (dropoffPoints.length > 0) setReturnDropoffPoint(dropoffPoints[0].name);
        }
      }

    } catch (error: any) {
      console.error("❌ Error fetching round trip data:", error);
      toast.error("Không thể tải thông tin chuyến khứ hồi");
      navigate("/product");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW: Handle seat click for round trip with temporary locking
  const handleRoundTripSeatClick = async (seat: TripSeat, tripDirection: "outbound" | "return") => {
    // ⭐ FIX: Get userId with debug logging
    const userId = (user as any)?.userId || (user as any)?.id;

    console.log("🔍 DEBUG handleRoundTripSeatClick:");
    console.log("  user object:", user);
    console.log("  userId:", userId);
    console.log("  isAuthenticated:", isAuthenticated);
    console.log("  tripDirection:", tripDirection);

    if (!userId) {
      console.error("❌ No userId found!");
      toast.error("Phiên đăng nhập hết hạn", {
        description: "Vui lòng đăng nhập lại để tiếp tục đặt vé.",
        action: {
          label: "Đăng nhập",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    if (seat.status !== "available") {
      toast.error("Ghế này đã được đặt hoặc đang được giữ chỗ");
      return;
    }

    const selectedList = tripDirection === "outbound" ? selectedOutboundSeats : selectedReturnSeats;
    const setSelectedList = tripDirection === "outbound" ? setSelectedOutboundSeats : setSelectedReturnSeats;
    const seatsList = tripDirection === "outbound" ? outboundSeats : returnSeats;

    if (selectedList.includes(seat.seatNumber)) {
      // ⭐ DESELECT: Remove from local state only
      setSelectedList(selectedList.filter((s) => s !== seat.seatNumber));
      console.log("🔓 Deselected seat:", seat.seatNumber, tripDirection);

      // ⚠️ WORKAROUND: Backend API not implemented yet
      // try {
      //   await tripSeatService.unlockSeat(seat.id, userId);
      //   await refreshSeats();
      // } catch (error) {
      //   console.error("❌ Error unlocking seat:", error);
      // }
    } else {
      // ⭐ SELECT: Add to local state only
      if (selectedList.length >= 5) {
        toast.warning("Bạn chỉ được chọn tối đa 5 ghế mỗi chuyến");
        return;
      }

      setSelectedList([...selectedList, seat.seatNumber]);
      console.log("🔒 Selected seat:", seat.seatNumber, tripDirection);
      toast.success(`Đã chọn ghế ${seat.seatNumber} (${tripDirection === 'outbound' ? 'Chuyến đi' : 'Chuyến về'})`, { duration: 2000 });

      // ⚠️ WORKAROUND: Backend API not implemented yet
      // try {
      //   await tripSeatService.lockSeatTemporarily(seat.id, userId);
      //   await refreshSeats();
      // } catch (error) {
      //   console.error("❌ Error locking seat:", error);
      //   // Rollback
      //   setSelectedList(prev => prev.filter(s => s !== seat.seatNumber));
      //   toast.error("Không thể chọn ghế. Vui lòng thử lại.");
      // }
    }
  };

  // ⭐ NEW: Get seat status for round trip
  const getRoundTripSeatStatus = (seat: TripSeat, tripDirection: "outbound" | "return") => {
    const selectedList = tripDirection === "outbound" ? selectedOutboundSeats : selectedReturnSeats;
    if (selectedList.includes(seat.seatNumber)) return "selected";
    return seat.status;
  };

  // ⭐ NEW: Calculate total for round trip
  const calculateRoundTripTotal = () => {
    if (!outboundTrip || !returnTrip) return { subtotal: 0, discount: 0, total: 0 };

    const outboundTotal = selectedOutboundSeats.length * Number(outboundTrip.route.basePrice);
    const returnTotal = selectedReturnSeats.length * Number(returnTrip.route.basePrice);
    const subtotal = outboundTotal + returnTotal;
    const discount = subtotal * 0.1; // 10% discount
    const total = subtotal - discount;

    return { subtotal, discount, total, outboundTotal, returnTotal };
  };

  // Helper function to parse pickup/dropoff from route
  const parsePickupDropoffPointsFromRoute = (route: any) => {
    try {
      if (route.pickupPoints) {
        const parsed = typeof route.pickupPoints === 'string'
          ? JSON.parse(route.pickupPoints)
          : route.pickupPoints;
        setPickupOptions(Array.isArray(parsed) ? parsed : []);
        if (parsed.length > 0) setPickupPoint(parsed[0].name);
      }
      if (route.dropoffPoints) {
        const parsed = typeof route.dropoffPoints === 'string'
          ? JSON.parse(route.dropoffPoints)
          : route.dropoffPoints;
        setDropoffOptions(Array.isArray(parsed) ? parsed : []);
        if (parsed.length > 0) setDropoffPoint(parsed[0].name);
      }
    } catch (error) {
      console.error("Error parsing pickup/dropoff points:", error);
    }
  };

  const handleSeatClick = async (seat: TripSeat) => {
    // ⭐ FIX: Get userId with fallback (support both LoginResponse.userId and UserResponse.id)
    const userId = (user as any)?.userId || (user as any)?.id;

    console.log("🔍 DEBUG handleSeatClick:");
    console.log("  user object:", user);
    console.log("  userId:", userId);
    console.log("  isAuthenticated:", isAuthenticated);

    if (!userId) {
      console.error("❌ No userId found!");
      toast.error("Phiên đăng nhập hết hạn", {
        description: "Vui lòng đăng nhập lại để tiếp tục đặt vé.",
        action: {
          label: "Đăng nhập",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    // ✅ CHECK: Seat must be available
    if (seat.status !== "available") {
      toast.error(`Ghế ${seat.seatNumber} đã được đặt hoặc không khả dụng. Vui lòng chọn ghế khác.`, {
        description: "Trạng thái ghế có thể đã thay đổi. Trang sẽ tự động cập nhật.",
      });
      return;
    }

    if (selectedSeats.includes(seat.seatNumber)) {
      // ⭐ DESELECT: Remove from local state only
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatNumber));
      console.log("🔓 Deselected seat:", seat.seatNumber);

      // ⚠️ WORKAROUND: Backend API /trip-seats/{id}/unlock not implemented yet
      // TODO: Implement temporary seat locking in backend
      // try {
      //   await tripSeatService.unlockSeat(seat.id, userId);
      //   await refreshSeats();
      // } catch (error) {
      //   console.error("❌ Error unlocking seat:", error);
      // }
    } else {
      // ⭐ SELECT: Add to local state only
      if (selectedSeats.length >= 5) {
        toast.warning("Bạn chỉ được chọn tối đa 5 ghế mỗi lần đặt");
        return;
      }

      setSelectedSeats([...selectedSeats, seat.seatNumber]);
      console.log("🔒 Selected seat:", seat.seatNumber);
      toast.success(`Đã chọn ghế ${seat.seatNumber}`, { duration: 2000 });

      // ⚠️ WORKAROUND: Backend API /trip-seats/{id}/lock-temporary not implemented yet
      // TODO: Implement temporary seat locking (5 min timeout) in backend
      // try {
      //   await tripSeatService.lockSeatTemporarily(seat.id, userId);
      //   console.log("🔒 Locked seat:", seat.seatNumber, "for 5 minutes");
      //   toast.success(`Đã giữ ghế ${seat.seatNumber} trong 5 phút`);
      //   await refreshSeats();
      // } catch (error) {
      //   console.error("❌ Error locking seat:", error);
      //   // Rollback selection
      //   setSelectedSeats(prev => prev.filter(s => s !== seat.seatNumber));
      //   toast.error("Không thể chọn ghế. Vui lòng thử lại.");
      // }
    }
  };

  const getSeatStatus = (seat: TripSeat) => {
    if (selectedSeats.includes(seat.seatNumber)) return "selected";
    return seat.status;
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-gray-200 hover:bg-blue-100 cursor-pointer";
      case "selected":
        return "bg-orange-500 text-white cursor-pointer";
      case "booked":
        return "bg-gray-400 text-gray-600 cursor-not-allowed";
      case "locked":
        return "bg-yellow-200 text-gray-600 cursor-not-allowed";
      default:
        return "bg-gray-200";
    }
  };

  const calculateTotal = () => {
    if (!trip) return 0;
    return selectedSeats.length * Number(trip.route.basePrice);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ⭐ NEW: Load ALL stations by city (not just from route)
  const loadStationsByCity = async (fromCity: string, toCity: string) => {
    try {
      console.log(`🚉 Loading stations for ${fromCity} → ${toCity}`);

      // Load pickup stations (from city)
      const pickupResponse = await stationService.getStationsByCity(fromCity);
      if (pickupResponse.success && pickupResponse.data) {
        const pickupStations = pickupResponse.data.map((station: Station) => ({
          name: station.name,
          address: station.address,
          latitude: station.latitude,
          longitude: station.longitude,
        }));
        setPickupOptions(pickupStations);
        console.log(`✅ Loaded ${pickupStations.length} pickup stations for ${fromCity}`);

        // Set default first option
        if (pickupStations.length > 0 && !pickupPoint) {
          setPickupPoint(pickupStations[0].name);
        }
      }

      // Load dropoff stations (to city)
      const dropoffResponse = await stationService.getStationsByCity(toCity);
      if (dropoffResponse.success && dropoffResponse.data) {
        const dropoffStations = dropoffResponse.data.map((station: Station) => ({
          name: station.name,
          address: station.address,
          latitude: station.latitude,
          longitude: station.longitude,
        }));
        setDropoffOptions(dropoffStations);
        console.log(`✅ Loaded ${dropoffStations.length} dropoff stations for ${toCity}`);

        // Set default first option
        if (dropoffStations.length > 0 && !dropoffPoint) {
          setDropoffPoint(dropoffStations[0].name);
        }
      }
    } catch (error) {
      console.error("❌ Error loading stations by city:", error);
      toast.error("Không thể tải danh sách trạm xe");
    }
  };

  // ⭐ FALLBACK: Parse pickup/dropoff points from route JSON (if stations not available)
  const parsePickupDropoffPoints = () => {
    if (!trip?.route) return;

    try {
      // Parse pickupPoints
      if (trip.route.pickupPoints) {
        let pickup: PickupPoint[] = [];
        if (typeof trip.route.pickupPoints === 'string') {
          pickup = JSON.parse(trip.route.pickupPoints);
        } else if (Array.isArray(trip.route.pickupPoints)) {
          pickup = trip.route.pickupPoints;
        }
        setPickupOptions(pickup);

        // Set default first option
        if (pickup.length > 0 && !pickupPoint) {
          setPickupPoint(pickup[0].name);
        }
      }

      // Parse dropoffPoints
      if (trip.route.dropoffPoints) {
        let dropoff: DropoffPoint[] = [];
        if (typeof trip.route.dropoffPoints === 'string') {
          dropoff = JSON.parse(trip.route.dropoffPoints);
        } else if (Array.isArray(trip.route.dropoffPoints)) {
          dropoff = trip.route.dropoffPoints;
        }
        setDropoffOptions(dropoff);

        // Set default first option
        if (dropoff.length > 0 && !dropoffPoint) {
          setDropoffPoint(dropoff[0].name);
        }
      }
    } catch (error) {
      console.error("❌ Error parsing pickup/dropoff points:", error);
    }
  };

  // ⭐ NEW: useEffect to load stations when trip loads
  useEffect(() => {
    if (trip?.route) {
      const fromCity = trip.route.fromLocation;
      const toCity = trip.route.toLocation;

      // Try to load stations by city first
      loadStationsByCity(fromCity, toCity).catch(() => {
        // Fallback to parsing from route if city-based loading fails
        console.log("⚠️ Falling back to route-based pickup/dropoff points");
        parsePickupDropoffPoints();
      });
    }
  }, [trip]);

  // ⭐ NEW: Setup polling to refresh seats every 30 seconds
  useEffect(() => {
    if (!loading && (trip || (outboundTrip && returnTrip))) {
      const interval = setInterval(() => {
        console.log("🔄 Auto-refreshing seat status...");
        refreshSeats();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [loading, trip, outboundTrip, returnTrip]);

  // ⭐ ADD: Early return with loading/error UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-xl">Đang tải thông tin chuyến xe...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // ⭐ Fix: Check for both one-way and round trip
  const hasValidData = isRoundTrip
    ? (outboundTrip && returnTrip && outboundSeats.length > 0 && returnSeats.length > 0)
    : (trip && seats.length > 0);

  if (!hasValidData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-xl font-semibold mb-2">Không tìm thấy thông tin chuyến xe</p>
              <p className="text-gray-500 mb-6">Chuyến xe này có thể đã hết chỗ hoặc không còn tồn tại</p>
              <Button onClick={() => navigate("/product")} className="bg-orange-500 hover:bg-orange-600">
                Quay lại tìm chuyến xe khác
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleContinue = async () => {
    // ✅ CHECK: User must be logged in
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để đặt vé");
      navigate("/login", { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    // ⭐ ROUND TRIP: Validate both trips
    if (isRoundTrip) {
      if (selectedOutboundSeats.length === 0 || selectedReturnSeats.length === 0) {
        toast.error("Vui lòng chọn ghế cho cả chuyến đi và chuyến về");
        return;
      }
    } else {
      if (selectedSeats.length === 0) {
        toast.error("Vui lòng chọn ít nhất một ghế");
        return;
      }
    }

    // ⭐ NEW: Refresh seats before submitting to verify availability
    console.log("🔄 Refreshing seats before booking...");
    const refreshToast = toast.loading("Đang kiểm tra trạng thái ghế...");
    await refreshSeats();
    toast.dismiss(refreshToast);

    // ⭐ NEW: Verify selected seats are still available after refresh
    if (isRoundTrip) {
      // Check outbound seats
      for (const seatNumber of selectedOutboundSeats) {
        const seat = outboundSeats.find(s => s.seatNumber === seatNumber);
        if (!seat || seat.status !== 'available') {
          toast.error(`Ghế ${seatNumber} (chuyến đi) đã được đặt bởi người khác. Vui lòng chọn ghế khác.`);
          setSelectedOutboundSeats(prev => prev.filter(s => s !== seatNumber));
          return;
        }
      }
      // Check return seats
      for (const seatNumber of selectedReturnSeats) {
        const seat = returnSeats.find(s => s.seatNumber === seatNumber);
        if (!seat || seat.status !== 'available') {
          toast.error(`Ghế ${seatNumber} (chuyến về) đã được đặt bởi người khác. Vui lòng chọn ghế khác.`);
          setSelectedReturnSeats(prev => prev.filter(s => s !== seatNumber));
          return;
        }
      }
    } else {
      // Check one-way seats
      for (const seatNumber of selectedSeats) {
        const seat = seats.find(s => s.seatNumber === seatNumber);
        if (!seat || seat.status !== 'available') {
          toast.error(`Ghế ${seatNumber} đã được đặt bởi người khác. Vui lòng chọn ghế khác.`);
          setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
          return;
        }
      }
    }

    if (!customerName || !customerPhone || !customerEmail) {
      toast.error("Vui lòng điền đầy đủ thông tin khách hàng");
      return;
    }

    // ⭐ Validate pickup/dropoff based on booking mode
    if (!isRoundTrip) {
      // ONE-WAY: Validate pickupPoint and dropoffPoint
      if (!pickupPoint || pickupPoint === '') {
        toast.error("Vui lòng chọn điểm đón");
        return;
      }

      if (!dropoffPoint || dropoffPoint === '') {
        toast.error("Vui lòng chọn điểm trả");
        return;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    // Validate phone (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      toast.error("Số điện thoại phải có 10 chữ số");
      return;
    }

    // Extract userId with detailed debugging
    console.log("🔍 DEBUG user object:", user);
    console.log("🔍 user.userId:", (user as any)?.userId);
    console.log("🔍 user.id:", (user as any)?.id);
    console.log("🔍 isAuthenticated:", isAuthenticated);

    const userId = (user as any)?.userId || (user as any)?.id || null;

    if (!userId) {
      console.error("❌ No userId found!");
      console.error("   user object:", JSON.stringify(user, null, 2));
      console.error("   isAuthenticated:", isAuthenticated);
      toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login", { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    console.log("✅ Found userId:", userId);

    // ⭐ ROUND TRIP: Call round trip API
    if (isRoundTrip && outboundTrip && returnTrip) {
      // Validate round trip pickup/dropoff
      if (!outboundPickupPoint || !outboundDropoffPoint) {
        toast.error("Vui lòng chọn điểm đón/trả cho chuyến đi");
        return;
      }
      if (!returnPickupPoint || !returnDropoffPoint) {
        toast.error("Vui lòng chọn điểm đón/trả cho chuyến về");
        return;
      }

      try {
        const loadingToast = toast.loading("Đang tạo vé...");

        const roundTripRequest: RoundTripBookingRequest = {
          userId: Number(userId),
          tripType: 'round_trip',
          outboundTripId: Number(outboundTripId),
          outboundSeats: selectedOutboundSeats,
          outboundPickupLocation: outboundPickupPoint,   // ⭐ Separate for outbound
          outboundDropoffLocation: outboundDropoffPoint, // ⭐ Separate for outbound
          returnTripId: Number(returnTripId),
          returnSeats: selectedReturnSeats,
          returnPickupLocation: returnPickupPoint,       // ⭐ Separate for return
          returnDropoffLocation: returnDropoffPoint,     // ⭐ Separate for return
          customerName,
          customerPhone,
          customerEmail,
          notes,
        };

        console.log("🎫 Creating round trip booking:", roundTripRequest);
        console.log("⏰ [STEP 1] Sending request to backend...");

        const response = await ticketService.createRoundTripBooking(roundTripRequest);

        console.log("⏰ [STEP 2] Received response from backend");
        console.log("📦 Round trip response:", response);
        console.log("📦 Response type:", typeof response);
        console.log("📦 Response keys:", response ? Object.keys(response) : 'null/undefined');
        console.log("📦 Response.success:", response?.success, "(type:", typeof response?.success, ")");
        console.log("📦 Response.bookingGroupId:", response?.bookingGroupId);

        toast.dismiss(loadingToast);

        // ✅ Check if response exists and has bookingGroupId (most important indicator)
        if (!response || !response.bookingGroupId) {
          console.error("❌ [STEP 3] Response invalid - Missing bookingGroupId!");
          console.error("❌ Full response:", JSON.stringify(response, null, 2));
          throw new Error(response?.message || "Không nhận được phản hồi từ server");
        }

        console.log("✅ [STEP 3] Response valid - Has bookingGroupId:", response.bookingGroupId);

        // ✅ Check success flag (can be boolean true or string 'true')
        const isSuccess = response.success === true ||
                         response.success === 'true' ||
                         Boolean(response.bookingGroupId); // If has bookingGroupId, consider success

        console.log("🔍 [STEP 4] Is Success?", isSuccess);
        console.log("🔍   - response.success === true:", response.success === true);
        console.log("🔍   - response.success === 'true':", response.success === 'true');
        console.log("🔍   - Boolean(bookingGroupId):", Boolean(response.bookingGroupId));
        console.log("🔍   - BookingGroupId:", response.bookingGroupId);

        if (isSuccess) {
          console.log("✅ [STEP 5] Success condition met! Preparing navigation...");

          toast.success(`Đã tạo vé khứ hồi thành công! Giảm ${formatPrice(response.discountAmount || 0)}đ`);

          // Save booking data for payment
          const paymentData = {
            bookingGroupId: response.bookingGroupId,
            tripType: 'roundTrip',
            outboundTrip,
            returnTrip,
            outboundTickets: response.outboundTickets,
            returnTickets: response.returnTickets,
            selectedOutboundSeats,
            selectedReturnSeats,
            // ⭐ Add pickup/dropoff locations
            outboundPickupLocation: outboundPickupPoint,
            outboundDropoffLocation: outboundDropoffPoint,
            returnPickupLocation: returnPickupPoint,
            returnDropoffLocation: returnDropoffPoint,
            customerName,
            customerPhone,
            customerEmail,
            totalPrice: response.totalPrice,
            discountAmount: response.discountAmount || 0,
            finalPrice: response.finalPrice || response.totalPrice,
          };

          console.log("💾 [STEP 6] Saving payment data to sessionStorage...");
          console.log("💾 Payment data:", paymentData);
          sessionStorage.setItem("bookingData", JSON.stringify(paymentData));

          console.log("✅ [STEP 7] Payment data saved. Navigating to /payment in 2 seconds...");
          console.log("🚀 ABOUT TO NAVIGATE TO /payment");

          // Add delay to see logs
          await new Promise(resolve => setTimeout(resolve, 2000));

          console.log("🚀🚀🚀 NAVIGATING NOW! Current URL:", window.location.href);
          navigate("/payment");
          console.log("🚀🚀🚀 navigate() called. New URL should be:", window.location.origin + "/payment");
        } else {
          console.error("❌ [STEP 5] Success condition NOT met!");
          console.error("❌ This should NOT happen if bookingGroupId exists!");
          throw new Error(response.message || "Không thể tạo vé khứ hồi");
        }
      } catch (error: any) {
        console.error("🔥🔥🔥 [CATCH BLOCK] Error creating round trip booking!");
        console.error("🔥 Error object:", error);
        console.error("🔥 Error message:", error.message);
        console.error("🔥 Error stack:", error.stack);
        console.error("🔥 Error type:", typeof error);
        console.error("🔥 Error constructor:", error?.constructor?.name);

        // Check if this error is causing page reload
        console.error("🔥 THIS ERROR MIGHT BE CAUSING PAGE RELOAD!");
        console.error("🔥 Current URL:", window.location.href);

        // ✅ DON'T clear selected seats - let user see what they selected
        // setSelectedOutboundSeats([]);
        // setSelectedReturnSeats([]);

        // Refresh seats to show updated status (but keep selection UI)
        const refreshToast = toast.loading("Đang cập nhật trạng thái ghế...");
        await refreshSeats();
        toast.dismiss(refreshToast);

        // ✅ Better error message - specific to the issue
        const errorMessage = error.message || "Không thể tạo vé khứ hồi";
        if (errorMessage.includes("not available") || errorMessage.includes("đã được đặt")) {
          toast.error("⚠️ Một số ghế đã được người khác đặt", {
            description: "Ghế màu đỏ đã hết. Vui lòng chọn ghế khác (màu xanh) và thử lại.",
            duration: 5000,
          });
        } else {
          toast.error(errorMessage, {
            description: "Vui lòng kiểm tra lại thông tin và thử lại.",
            duration: 5000,
          });
        }
      }
      return; // Exit after round trip
    }

    // ⭐ ONE-WAY: Original flow
    try {
      const loadingToast = toast.loading("Đang tạo vé...");

      // Fetch seats information to get seatId
      const seatsResponse = await tripSeatService.getSeatsByTrip(Number(tripId));
      if (!seatsResponse.success || !seatsResponse.data) {
        throw new Error("Không thể tải thông tin ghế");
      }

      const allSeats = seatsResponse.data;
      const ticketIds: number[] = [];
      let firstTicketBookingGroupId: string | null = null; // ⭐ Track booking_group_id from first ticket

      // Create tickets for each selected seat with status='booked'
      console.log("🎫 Creating tickets with status='booked' for seats:", selectedSeats);
      console.log("🔍 All seats from API:", allSeats);

      for (const seatNumber of selectedSeats) {
        const tripSeat = allSeats.find((s: any) => s.seatNumber === seatNumber);

        console.log(`🔍 Found tripSeat for ${seatNumber}:`, tripSeat);
        console.log(`   - tripSeat.id: ${tripSeat?.id}`);
        console.log(`   - tripSeat.seatId: ${tripSeat?.seatId}`);

        if (!tripSeat) {
          throw new Error(`Không tìm thấy thông tin ghế ${seatNumber}`);
        }

        // ✅ FIX: Use tripSeatId (always exists) instead of seatId (may be null)
        console.log(`✅ Creating ticket with tripSeatId=${tripSeat.id} for seat ${seatNumber}`);

        const ticketRequest = {
          userId: Number(userId),
          tripId: Number(tripId),
          tripSeatId: tripSeat.id,          // ✅ Use trip_seats.id (always exists)
          seatId: tripSeat.seatId || null,  // ✅ Optional: seats.id (may be null)
          pickupPoint: pickupPoint,
          dropoffPoint: dropoffPoint,
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          notes: notes,
          price: Number(trip?.route?.basePrice || 0),
          bookingMethod: "online" as const,
          status: "booked" as const,        // ⭐ TẠO VÉ VỚI STATUS 'BOOKED'
        };

        console.log("📝 Creating ticket:", ticketRequest);

        // Call API to create ticket
        const result = await ticketService.createTicket(ticketRequest);

        if (result.success && result.data?.id) {
          ticketIds.push(result.data.id);

          // ⭐ NEW: Capture booking_group_id from first ticket
          if (!firstTicketBookingGroupId && result.data.bookingGroupId) {
            firstTicketBookingGroupId = result.data.bookingGroupId;
            console.log("📦 Captured booking_group_id from ticket:", firstTicketBookingGroupId);
          }

          console.log("✅ Ticket created with ID:", result.data.id, "status:", result.data.status);
        } else {
          throw new Error(`Không thể tạo vé cho ghế ${seatNumber}`);
        }
      }

      toast.dismiss(loadingToast);
      toast.success(`Đã tạo ${ticketIds.length} vé với trạng thái 'Đã đặt'. Vui lòng thanh toán để xác nhận vé.`);

      // Lưu thông tin để thanh toán và update status sau
      const paymentData = {
        bookingGroupId: firstTicketBookingGroupId, // ⭐ NEW: Include booking_group_id for payment matching
        ticketIds, // ⭐ Lưu ticket IDs để update status sau khi thanh toán
        userId: Number(userId),
        tripId: Number(tripId),
        trip: trip,
        selectedSeats: selectedSeats,
        customerName,
        customerPhone,
        customerEmail,
        pickupLocation,
        dropoffLocation,
        totalPrice: calculateTotal(),
        price: trip?.route?.basePrice || 0,
      };

      console.log("💾 Payment data to save:", paymentData);
      console.log("📦 Booking Group ID being saved:", firstTicketBookingGroupId);

      if (!firstTicketBookingGroupId) {
        console.warn("⚠️ WARNING: No booking_group_id captured! This will cause payment-ticket mismatch!");
      }

      sessionStorage.setItem("bookingData", JSON.stringify(paymentData));

      // Chuyển sang trang thanh toán
      navigate("/payment");
    } catch (error: any) {
      console.error("❌ Error creating tickets:", error);

      // ✅ DON'T clear selected seats - let user see what they selected
      // setSelectedSeats([]);

      // Refresh seats to show updated status (but keep selection UI)
      const refreshToast = toast.loading("Đang cập nhật trạng thái ghế...");
      await refreshSeats();
      toast.dismiss(refreshToast);

      // ✅ Better error message - specific to the issue
      const errorMessage = error.message || "Có lỗi xảy ra khi tạo vé";
      if (errorMessage.includes("not available") || errorMessage.includes("đã được đặt")) {
        toast.error("⚠️ Một số ghế đã được người khác đặt", {
          description: "Ghế màu đỏ đã hết. Vui lòng chọn ghế khác (màu xanh) và thử lại.",
          duration: 5000,
        });
      } else {
        toast.error(errorMessage, {
          description: "Vui lòng kiểm tra lại thông tin và thử lại.",
          duration: 5000,
        });
      }
    }
  };

  // Tách ghế thành tầng dưới và tầng trên
  const lowerSeats = seats.filter((seat) => seat.seatNumber.startsWith("A"));
  const upperSeats = seats.filter((seat) => seat.seatNumber.startsWith("B"));

  // ⭐ NEW: Helper function to render seat map (reusable for round trip)
  // Use BusLayoutRenderer instead of custom seat map (matching AdminSeats design)
  const renderSeatMap = (seatsList: TripSeat[], direction?: "outbound" | "return", tripData?: Trip) => {
    // For round trip, handle seat click based on direction
    const handleSeatClickWrapper = (seat: TripSeat) => {
      if (isRoundTrip && direction) {
        handleRoundTripSeatClick(seat, direction);
      } else {
        handleSeatClick(seat);
      }
    };

    // Get selected seats for this direction
    const selectedSeatsForDirection = isRoundTrip && direction
      ? (direction === "outbound" ? selectedOutboundSeats : selectedReturnSeats)
      : selectedSeats;

    return (
      <BusLayoutRenderer
        seats={seatsList}
        onSeatClick={handleSeatClickWrapper}
        selectedSeats={selectedSeatsForDirection}
        viewMode="customer"
        direction={direction}
      />
    );
  };

  // ⚠️ REMOVED OLD ERROR CHECK - Using hasValidData check above instead
  // Old check: if (!trip) caused error for round trips!

  // ⭐ Show loading screen while auth is loading or data is being fetched
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">
            {authLoading ? '🔐 Đang xác thực...' : '🚌 Đang tải thông tin chuyến xe...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Compact Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                title="Quay lại"
              >
                <span className="text-lg">←</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  {isRoundTrip ? '🔄 Vé khứ hồi' : '🎫 Chọn ghế'}
                  {isRoundTrip && <span className="text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full font-bold">-10%</span>}
                </h1>
                <div className="text-white/90 text-sm mt-0.5">
                  {isRoundTrip && outboundTrip ? (
                    <span>{outboundTrip.route.fromLocation} ⇄ {outboundTrip.route.toLocation} • {formatDate(outboundTrip.departureTime)} - {returnTrip && formatDate(returnTrip.departureTime)}</span>
                  ) : trip && (
                    <span>{trip.route.fromLocation} → {trip.route.toLocation} • {formatDate(trip.departureTime)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sơ đồ ghế - Bên trái - Style Phương Trang */}
          <div className="lg:col-span-2">
            {/* ⭐ ROUND TRIP: Show Tabs UI */}
            {isRoundTrip && outboundTrip && returnTrip ? (
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Chọn ghế khứ hồi</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          toast.loading("Đang cập nhật trạng thái ghế...");
                          await refreshSeats();
                          toast.success("Đã cập nhật trạng thái ghế");
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        title="Làm mới trạng thái ghế"
                      >
                        🔄 Làm mới
                      </button>
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        🎉 Giảm 10% vé khứ hồi
                      </div>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outbound" className="text-sm py-3">
                        <div className="flex items-center gap-2">
                          <span>🚌 Chuyến đi</span>
                          {selectedOutboundSeats.length > 0 && (
                            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                              {selectedOutboundSeats.length}
                            </span>
                          )}
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="return" className="text-sm py-3">
                        <div className="flex items-center gap-2">
                          <span>🔄 Chuyến về</span>
                          {selectedReturnSeats.length > 0 && (
                            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                              {selectedReturnSeats.length}
                            </span>
                          )}
                        </div>
                      </TabsTrigger>
                    </TabsList>

                    {/* Outbound Tab Content */}
                    <TabsContent value="outbound" className="mt-0 space-y-4">
                      {/* Compact Trip Info */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-600">{formatTime(outboundTrip.departureTime)}</span>
                          <span className="mx-2">•</span>
                          <span className="font-semibold">{outboundTrip.vehicle.model}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-600">Đã chọn: </span>
                          <span className="text-lg font-bold text-orange-600">{selectedOutboundSeats.length} ghế</span>
                        </div>
                      </div>

                      {renderSeatMap(outboundSeats, "outbound", outboundTrip)}

                      {/* Compact Pickup/Dropoff */}
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                            📍 Điểm đón/trả
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Pickup */}
                            <div>
                              <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Điểm đón</Label>
                              {outboundPickupOptions.length > 0 ? (
                                <Select value={outboundPickupPoint} onValueChange={setOutboundPickupPoint}>
                                  <SelectTrigger className="h-10 text-sm">
                                    <SelectValue placeholder="Chọn điểm đón" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {outboundPickupOptions.map((point: any, index: number) => (
                                      <SelectItem key={index} value={point.name}>
                                        {point.name} - {point.address}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                                  BX {outboundTrip.route.fromLocation}
                                </div>
                              )}
                            </div>

                            {/* Dropoff */}
                            <div>
                              <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Điểm trả</Label>
                              {outboundDropoffOptions.length > 0 ? (
                                <Select value={outboundDropoffPoint} onValueChange={setOutboundDropoffPoint}>
                                  <SelectTrigger className="h-10 text-sm">
                                    <SelectValue placeholder="Chọn điểm trả" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {outboundDropoffOptions.map((point: any, index: number) => (
                                      <SelectItem key={index} value={point.name}>
                                        {point.name} - {point.address}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                                  BX {outboundTrip.route.toLocation}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Return Tab Content */}
                    <TabsContent value="return" className="mt-0 space-y-4">
                      {/* Compact Trip Info */}
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-600">{formatTime(returnTrip.departureTime)}</span>
                          <span className="mx-2">•</span>
                          <span className="font-semibold">{returnTrip.vehicle.model}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-600">Đã chọn: </span>
                          <span className="text-lg font-bold text-orange-600">{selectedReturnSeats.length} ghế</span>
                        </div>
                      </div>

                      {renderSeatMap(returnSeats, "return", returnTrip)}

                      {/* Compact Pickup/Dropoff */}
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                            📍 Điểm đón/trả
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Pickup */}
                            <div>
                              <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Điểm đón</Label>
                              {returnPickupOptions.length > 0 ? (
                                <Select value={returnPickupPoint} onValueChange={setReturnPickupPoint}>
                                  <SelectTrigger className="h-10 text-sm">
                                    <SelectValue placeholder="Chọn điểm đón" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {returnPickupOptions.map((point: any, index: number) => (
                                      <SelectItem key={index} value={point.name}>
                                        {point.name} - {point.address}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                                  BX {returnTrip.route.fromLocation}
                                </div>
                              )}
                            </div>

                            {/* Dropoff */}
                            <div>
                              <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Điểm trả</Label>
                              {returnDropoffOptions.length > 0 ? (
                                <Select value={returnDropoffPoint} onValueChange={setReturnDropoffPoint}>
                                  <SelectTrigger className="h-10 text-sm">
                                    <SelectValue placeholder="Chọn điểm trả" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {returnDropoffOptions.map((point: any, index: number) => (
                                      <SelectItem key={index} value={point.name}>
                                        {point.name} - {point.address}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                                  BX {returnTrip.route.toLocation}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Round Trip Summary */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
                    <h3 className="font-bold text-lg mb-4">📋 Tổng kết vé khứ hồi</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>🚌 Chuyến đi ({selectedOutboundSeats.length} ghế):</span>
                        <span className="font-semibold">{formatPrice(calculateRoundTripTotal().outboundTotal)}đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔄 Chuyến về ({selectedReturnSeats.length} ghế):</span>
                        <span className="font-semibold">{formatPrice(calculateRoundTripTotal().returnTotal)}đ</span>
                      </div>
                      <div className="border-t pt-2"></div>
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span className="font-semibold">{formatPrice(calculateRoundTripTotal().subtotal)}đ</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>🎉 Giảm giá (10%):</span>
                        <span className="font-semibold">-{formatPrice(calculateRoundTripTotal().discount)}đ</span>
                      </div>
                      <div className="border-t pt-2"></div>
                      <div className="flex justify-between text-xl">
                        <span className="font-bold">TỔNG CỘNG:</span>
                        <span className="font-bold text-orange-600">{formatPrice(calculateRoundTripTotal().total)}đ</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* ONE-WAY: Original seat map */
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Sơ đồ chỗ ngồi</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          toast.loading("Đang cập nhật trạng thái ghế...");
                          await refreshSeats();
                          toast.success("Đã cập nhật trạng thái ghế");
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        title="Làm mới trạng thái ghế"
                      >
                        🔄 Làm mới
                      </button>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-2xl">🚌</span>
                        <span className="font-semibold">{trip.vehicle.model}</span>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Use BusLayoutRenderer - same as round trip */}
                  {renderSeatMap(seats, undefined, trip)}
              </CardContent>
            </Card>
            )}

            {/* Thông tin khách hàng */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Thông tin khách hàng</h2>
                  <p className="text-sm text-red-600 font-semibold">
                    ĐIỀU KHOẢN & LƯU Ý
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      maxLength={10}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Nhập email"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Điều khoản */}
                <div className="mt-6 p-4 bg-red-50 rounded-lg text-sm text-gray-700">
                  <p className="font-semibold text-red-600 mb-2">
                    Quý khách vui lòng Đăng ký/Đăng nhập tài khoản để nhận
                    chương trình khuyến mãi.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      Quý khách vui lòng có mặt tại bến xuất phát trước ít nhất
                      30 phút để hoàn tất thủ tục.
                    </li>
                    <li>
                      Liên hệ tổng đài{" "}
                      <span className="text-red-600 font-semibold">
                        1900 6067
                      </span>{" "}
                      để được hỗ trợ.
                    </li>
                    <li>Không mang hành lý quá quy định tại bến xe.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* ⭐ Pickup/Dropoff Selection Card - ONLY FOR ONE-WAY */}
            {!isRoundTrip && (
            <Card className="mt-6 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-800">Thông tin đón trả</h3>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">(*)</span> Quý khách vui lòng có mặt tại
                    Bến xe/Văn Phòng <span className="font-bold">trước ít nhất 30 phút</span> để
                    được trung chuyển hoặc kiểm tra thông tin trước khi lên xe.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ĐIỂM ĐÓN */}
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      ĐIỂM ĐÓN <span className="text-red-500">*</span>
                    </Label>

                    <RadioGroup value={pickupType} onValueChange={(val: any) => setPickupType(val)} className="flex gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="station" id="pickup-station" />
                        <Label htmlFor="pickup-station" className="cursor-pointer font-normal">
                          Bến xe/VP
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transfer" id="pickup-transfer" />
                        <Label htmlFor="pickup-transfer" className="cursor-pointer font-normal">
                          Trung chuyển
                        </Label>
                      </div>
                    </RadioGroup>

                    {pickupType === 'station' ? (
                      pickupOptions.length > 0 ? (
                        <Select value={pickupPoint} onValueChange={setPickupPoint}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn điểm đón" />
                          </SelectTrigger>
                          <SelectContent>
                            {pickupOptions.map((point) => (
                              <SelectItem key={point.name} value={point.name}>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{point.name}</span>
                                  <span className="text-xs text-gray-500">{point.address}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md border">
                          Không có điểm đón khả dụng
                        </div>
                      )
                    ) : (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                        Vui lòng liên hệ <span className="font-bold text-orange-600">1900 6067</span> để
                        được hỗ trợ trung chuyển
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Quý khách vui lòng có mặt tại bến xe/VP trước ít nhất 30 phút giờ xe khởi hành
                    </p>
                  </div>

                  {/* ĐIỂM TRẢ */}
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      ĐIỂM TRẢ <span className="text-red-500">*</span>
                    </Label>

                    <RadioGroup value={dropoffType} onValueChange={(val: any) => setDropoffType(val)} className="flex gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="station" id="dropoff-station" />
                        <Label htmlFor="dropoff-station" className="cursor-pointer font-normal">
                          Bến xe/VP
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transfer" id="dropoff-transfer" />
                        <Label htmlFor="dropoff-transfer" className="cursor-pointer font-normal">
                          Trung chuyển
                        </Label>
                      </div>
                    </RadioGroup>

                    {dropoffType === 'station' ? (
                      dropoffOptions.length > 0 ? (
                        <Select value={dropoffPoint} onValueChange={setDropoffPoint}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn điểm trả" />
                          </SelectTrigger>
                          <SelectContent>
                            {dropoffOptions.map((point) => (
                              <SelectItem key={point.name} value={point.name}>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{point.name}</span>
                                  <span className="text-xs text-gray-500">{point.address}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md border">
                          Không có điểm trả khả dụng
                        </div>
                      )
                    ) : (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                        Vui lòng liên hệ <span className="font-bold text-orange-600">1900 6918</span> trước
                        khi đặt vé
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Chúng tôi không đón/trung chuyển tại những điểm xe trung chuyển không thể tới được
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* ⭐ NEW: Policies & Terms Card */}
            <Card className="mt-6 shadow-lg border-red-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-red-600">ĐIỀU KHOẢN & LƯU Ý</h3>
                </div>

                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      Quý khách vui lòng <span className="font-semibold">Đăng ký/Đăng nhập</span> tài khoản
                      để nhận chương trình khuyến mãi.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      Quý khách vui lòng có mặt tại bến xe/VP trước ít nhất <span className="font-semibold">30 phút</span>
                      giờ xe khởi hành, mang theo thông báo đã thanh toán vé thành công có chứa mã vé được
                      gửi từ hệ thống <span className="font-semibold text-orange-600">TPT BUS LINES</span>.
                      Vui lòng liên hệ Tổng đài{" "}
                      <a href="tel:19006067" className="font-semibold text-orange-600 hover:underline">
                        1900 6067
                      </a>{" "}
                      để được hỗ trợ.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      Nếu quý khách có nhu cầu <span className="font-semibold">trung chuyển</span>, vui lòng
                      liên hệ Tổng đài trung chuyển{" "}
                      <a href="tel:19006918" className="font-semibold text-orange-600 hover:underline">
                        1900 6918
                      </a>{" "}
                      trước khi đặt vé. Chúng tôi không đón/trung chuyển tại những điểm xe trung chuyển
                      không thể tới được.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      Nếu quý khách có nhu cầu đi chuyến chặng đường ngắn hơn so với hành trình, vui lòng
                      gọi Tổng đài{" "}
                      <a href="tel:19006067" className="font-semibold text-orange-600 hover:underline">
                        1900 6067
                      </a>{" "}
                      để được hướng dẫn chính sách giá vé tốt nhất.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      <span className="font-semibold">Trẻ em dưới 6 tuổi:</span> Miễn phí vé nếu ngồi chung ghế
                      với người lớn. Mua vé <span className="font-semibold">75% giá vé người lớn</span> nếu ngồi riêng ghế.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      <span className="font-semibold">Trẻ em từ 6 tuổi trở lên:</span> Mua vé như người lớn
                      (100% giá vé).
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      Không mang theo hành lý quá quy định. Hành lý cồng kềnh hoặc quá khổ sẽ bị từ chối
                      hoặc tính phí bổ sung.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-base flex-shrink-0">(*)</span>
                    <span>
                      Vui lòng giữ gìn vệ sinh chung và tuân thủ các quy định an toàn trên xe. Không hút thuốc,
                      không mang theo vật phẩm dễ cháy nổ.
                    </span>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 Lưu ý:</span> Vé đã thanh toán không được hoàn lại.
                    Quý khách có thể đổi vé trước giờ khởi hành{" "}
                    <span className="font-semibold">ít nhất 24 giờ</span> với phí đổi vé theo quy định.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Thông tin lượt đi - Bên phải */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {/* ⭐ ROUND TRIP: Show both trips info */}
                {isRoundTrip && outboundTrip && returnTrip ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xl font-bold">Vé khứ hồi</h2>
                      <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        -10%
                      </div>
                    </div>

                    <div className="space-y-4 text-sm">
                      {/* Outbound Info */}
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-semibold text-green-800 mb-2">🚌 Chuyến đi</div>
                        <div className="space-y-1 text-xs">
                          <div>{outboundTrip.route.fromLocation} → {outboundTrip.route.toLocation}</div>
                          <div>{formatTime(outboundTrip.departureTime)} - {formatDate(outboundTrip.departureTime)}</div>
                          <div className="font-semibold text-blue-600">
                            Ghế: {selectedOutboundSeats.length > 0 ? selectedOutboundSeats.join(", ") : "Chưa chọn"}
                          </div>
                          <div className="font-bold text-orange-600">
                            {formatPrice(calculateRoundTripTotal().outboundTotal)}đ
                          </div>
                        </div>
                      </div>

                      {/* Return Info */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-800 mb-2">🔄 Chuyến về</div>
                        <div className="space-y-1 text-xs">
                          <div>{returnTrip.route.fromLocation} → {returnTrip.route.toLocation}</div>
                          <div>{formatTime(returnTrip.departureTime)} - {formatDate(returnTrip.departureTime)}</div>
                          <div className="font-semibold text-blue-600">
                            Ghế: {selectedReturnSeats.length > 0 ? selectedReturnSeats.join(", ") : "Chưa chọn"}
                          </div>
                          <div className="font-bold text-orange-600">
                            {formatPrice(calculateRoundTripTotal().returnTotal)}đ
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2 text-sm">
                      <h3 className="font-bold">Chi tiết giá</h3>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tạm tính</span>
                        <span className="font-semibold">{formatPrice(calculateRoundTripTotal().subtotal)}đ</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>🎉 Giảm giá (10%)</span>
                        <span className="font-semibold">-{formatPrice(calculateRoundTripTotal().discount)}đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí thanh toán</span>
                        <span className="font-semibold">0đ</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Tổng tiền</span>
                        <span className="font-bold text-orange-600 text-xl">
                          {formatPrice(calculateRoundTripTotal().total)}đ
                        </span>
                      </div>
                    </div>

                    {/* ✅ Fixed Button - Always show payment button, just enable/disable */}
                    <Button
                      onClick={handleContinue}
                      disabled={
                        selectedOutboundSeats.length === 0 ||
                        selectedReturnSeats.length === 0 ||
                        !customerName ||
                        !customerPhone ||
                        !customerEmail
                      }
                      className={`w-full mt-6 py-6 text-lg font-semibold transition-all ${
                        selectedOutboundSeats.length === 0 ||
                        selectedReturnSeats.length === 0 ||
                        !customerName ||
                        !customerPhone ||
                        !customerEmail
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                      }`}
                    >
                      {selectedOutboundSeats.length === 0 || selectedReturnSeats.length === 0
                        ? '⚠️ Vui lòng chọn ghế cho cả 2 chuyến'
                        : !customerName || !customerPhone || !customerEmail
                        ? '⚠️ Vui lòng nhập đầy đủ thông tin'
                        : '✅ Đặt vé khứ hồi'}
                    </Button>
                  </>
                ) : (
                  /* ONE-WAY: Original sidebar */
                  <>
                    <h2 className="text-xl font-bold mb-4">Thông tin lượt đi</h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tuyến xe</span>
                        <span className="font-semibold text-right">
                          {trip.route.fromLocation} - {trip.route.toLocation}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian xuất bến</span>
                        <span className="font-semibold">
                          {formatTime(trip.departureTime)}{" "}
                          {formatDate(trip.departureTime)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Số lượng ghế</span>
                        <span className="font-semibold">
                          {selectedSeats.length} Ghế
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Số ghế</span>
                        <span className="font-semibold text-blue-600">
                          {selectedSeats.length > 0
                            ? selectedSeats.join(", ")
                            : "---"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Điểm trả khách</span>
                        <span className="font-semibold">---</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền lượt đi</span>
                        <span className="font-bold text-orange-600 text-lg">
                          {formatPrice(calculateTotal())}đ
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3 text-sm">
                      <h3 className="font-bold flex items-center gap-2">
                        Chi tiết giá
                        <span className="text-orange-600">ⓘ</span>
                      </h3>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá vé lượt đi</span>
                        <span className="font-semibold text-orange-600">
                          {formatPrice(calculateTotal())}đ
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí thanh toán</span>
                        <span className="font-semibold">0đ</span>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-base">
                        <span className="font-bold">Tổng tiền</span>
                        <span className="font-bold text-orange-600 text-xl">
                          {formatPrice(calculateTotal())}đ
                        </span>
                      </div>
                    </div>

                    {/* ✅ Fixed Button - Always show payment button, just enable/disable */}
                    <Button
                      onClick={handleContinue}
                      disabled={
                        selectedSeats.length === 0 ||
                        !customerName ||
                        !customerPhone ||
                        !customerEmail
                      }
                      className={`w-full mt-6 py-6 text-lg font-semibold transition-all ${
                        selectedSeats.length === 0 ||
                        !customerName ||
                        !customerPhone ||
                        !customerEmail
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {selectedSeats.length === 0
                        ? '⚠️ Vui lòng chọn ghế'
                        : !customerName || !customerPhone || !customerEmail
                        ? '⚠️ Vui lòng nhập đầy đủ thông tin'
                        : '✅ Thanh toán'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookingSeat;
