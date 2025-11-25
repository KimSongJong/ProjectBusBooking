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
import type { Trip } from "@/types/trip.types";
import type { TripSeat } from "@/types/tripSeat.types";
import type { PickupPoint, DropoffPoint } from "@/types/route.types";

function BookingSeat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

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
  }, [tripId, outboundTripId, returnTripId]);

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

      // ⭐ Parse outbound route pickup/dropoff points
      if (outboundResponse.data?.route) {
        console.log("📍 Parsing outbound route points...");
        const { pickupPoints, dropoffPoints } = parseRoutePoints(outboundResponse.data.route);
        setOutboundPickupOptions(pickupPoints);
        setOutboundDropoffOptions(dropoffPoints);

        // Set default selections
        if (pickupPoints.length > 0) {
          setOutboundPickupPoint(pickupPoints[0].name);
          console.log("✅ Default outbound pickup:", pickupPoints[0].name);
        }
        if (dropoffPoints.length > 0) {
          setOutboundDropoffPoint(dropoffPoints[0].name);
          console.log("✅ Default outbound dropoff:", dropoffPoints[0].name);
        }
      }

      // ⭐ Parse return route pickup/dropoff points
      if (returnResponse.data?.route) {
        console.log("📍 Parsing return route points...");
        const { pickupPoints, dropoffPoints } = parseRoutePoints(returnResponse.data.route);
        setReturnPickupOptions(pickupPoints);
        setReturnDropoffOptions(dropoffPoints);

        // Set default selections
        if (pickupPoints.length > 0) {
          setReturnPickupPoint(pickupPoints[0].name);
          console.log("✅ Default return pickup:", pickupPoints[0].name);
        }
        if (dropoffPoints.length > 0) {
          setReturnDropoffPoint(dropoffPoints[0].name);
          console.log("✅ Default return dropoff:", dropoffPoints[0].name);
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

  // ⭐ NEW: Handle seat click for round trip
  const handleRoundTripSeatClick = (seat: TripSeat, tripDirection: "outbound" | "return") => {
    if (seat.status !== "available") {
      toast.error("Ghế này đã được đặt hoặc đang được giữ chỗ");
      return;
    }

    if (tripDirection === "outbound") {
      if (selectedOutboundSeats.includes(seat.seatNumber)) {
        setSelectedOutboundSeats(selectedOutboundSeats.filter((s) => s !== seat.seatNumber));
      } else {
        if (selectedOutboundSeats.length >= 5) {
          toast.warning("Bạn chỉ được chọn tối đa 5 ghế mỗi chuyến");
          return;
        }
        setSelectedOutboundSeats([...selectedOutboundSeats, seat.seatNumber]);
      }
    } else {
      if (selectedReturnSeats.includes(seat.seatNumber)) {
        setSelectedReturnSeats(selectedReturnSeats.filter((s) => s !== seat.seatNumber));
      } else {
        if (selectedReturnSeats.length >= 5) {
          toast.warning("Bạn chỉ được chọn tối đa 5 ghế mỗi chuyến");
          return;
        }
        setSelectedReturnSeats([...selectedReturnSeats, seat.seatNumber]);
      }
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

  const handleSeatClick = (seat: TripSeat) => {
    if (seat.status !== "available") {
      toast.error("Ghế này đã được đặt hoặc đang được giữ chỗ");
      return;
    }

    if (selectedSeats.includes(seat.seatNumber)) {
      // Bỏ chọn ghế
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatNumber));
    } else {
      // Kiểm tra giới hạn 5 ghế
      if (selectedSeats.length >= 5) {
        toast.warning("Bạn chỉ được chọn tối đa 5 ghế mỗi lần đặt");
        return;
      }
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
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

  // ⭐ NEW: Parse pickup/dropoff points from route JSON
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

  // ⭐ NEW: useEffect to parse when trip loads
  useEffect(() => {
    if (trip) {
      parsePickupDropoffPoints();
    }
  }, [trip]);

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

    // Extract userId
    const userId = (user as any).userId || (user as any).id || null;
    if (!userId) {
      console.error("❌ Cannot find userId in user object:", user);
      toast.error("Không thể xác định ID người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const loadingToast = toast.loading("Đang tạo vé...");

      // ⭐ ROUND TRIP: Call round trip API
      if (isRoundTrip && outboundTrip && returnTrip) {
        // Validate round trip pickup/dropoff
        if (!outboundPickupPoint || !outboundDropoffPoint) {
          toast.error("Vui lòng chọn điểm đón/trả cho chuyến đi");
          toast.dismiss(loadingToast);
          return;
        }
        if (!returnPickupPoint || !returnDropoffPoint) {
          toast.error("Vui lòng chọn điểm đón/trả cho chuyến về");
          toast.dismiss(loadingToast);
          return;
        }

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

        const response = await ticketService.createRoundTripBooking(roundTripRequest);

        toast.dismiss(loadingToast);

        if (response.success) {
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

          sessionStorage.setItem("bookingData", JSON.stringify(paymentData));
          navigate("/payment");
        } else {
          throw new Error(response.message || "Không thể tạo vé khứ hồi");
        }
        return;
      }

      // ⭐ ONE-WAY: Original flow
      // Fetch seats information to get seatId
      const seatsResponse = await tripSeatService.getSeatsByTrip(Number(tripId));
      if (!seatsResponse.success || !seatsResponse.data) {
        throw new Error("Không thể tải thông tin ghế");
      }

      const allSeats = seatsResponse.data;
      const ticketIds: number[] = [];

      // Create tickets for each selected seat with status='booked'
      console.log("🎫 Creating tickets with status='booked' for seats:", selectedSeats);

      for (const seatNumber of selectedSeats) {
        const tripSeat = allSeats.find((s: any) => s.seatNumber === seatNumber);

        if (!tripSeat || !tripSeat.seatId) {
          throw new Error(`Không tìm thấy thông tin ghế ${seatNumber}`);
        }

        const ticketRequest = {
          userId: Number(userId),
          tripId: Number(tripId),
          seatId: tripSeat.seatId,
          pickupPoint: pickupPoint,         // ⭐ NEW
          dropoffPoint: dropoffPoint,       // ⭐ NEW
          customerName: customerName,       // ⭐ NEW
          customerPhone: customerPhone,     // ⭐ NEW
          customerEmail: customerEmail,     // ⭐ NEW
          notes: notes,                     // ⭐ NEW
          price: Number(trip?.route?.basePrice || 0),
          bookingMethod: "online" as const,
          status: "booked" as const, // ⭐ TẠO VÉ VỚI STATUS 'BOOKED'
        };

        console.log("📝 Creating ticket:", ticketRequest);

        // Call API to create ticket
        const result = await ticketService.createTicket(ticketRequest);

        if (result.success && result.data?.id) {
          ticketIds.push(result.data.id);
          console.log("✅ Ticket created with ID:", result.data.id, "status:", result.data.status);
        } else {
          throw new Error(`Không thể tạo vé cho ghế ${seatNumber}`);
        }
      }

      toast.dismiss(loadingToast);
      toast.success(`Đã tạo ${ticketIds.length} vé với trạng thái 'Đã đặt'. Vui lòng thanh toán để xác nhận vé.`);

      // Lưu thông tin để thanh toán và update status sau
      const paymentData = {
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
      sessionStorage.setItem("bookingData", JSON.stringify(paymentData));

      // Chuyển sang trang thanh toán
      navigate("/payment");
    } catch (error: any) {
      console.error("❌ Error creating tickets:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo vé. Vui lòng thử lại.");
    }
  };

  // Tách ghế thành tầng dưới và tầng trên
  const lowerSeats = seats.filter((seat) => seat.seatNumber.startsWith("A"));
  const upperSeats = seats.filter((seat) => seat.seatNumber.startsWith("B"));

  // ⭐ NEW: Helper function to render seat map (reusable for round trip)
  const renderSeatMap = (seatsList: TripSeat[], direction: "outbound" | "return", tripData: Trip) => {
    const lower = seatsList.filter((seat) => seat.seatNumber.startsWith("A"));
    const upper = seatsList.filter((seat) => seat.seatNumber.startsWith("B"));

    return (
      <>
        {/* Chú thích */}
        <div className="flex flex-wrap gap-6 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-md flex items-center justify-center text-sm font-semibold">
              A01
            </div>
            <span className="text-sm font-medium text-gray-700">Còn trống</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 border-2 border-orange-600 rounded-md flex items-center justify-center text-white text-sm font-semibold">
              A02
            </div>
            <span className="text-sm font-medium text-gray-700">Đang chọn</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 text-sm font-semibold">
              A03
            </div>
            <span className="text-sm font-medium text-gray-700">Đã bán</span>
          </div>
        </div>

        {/* Tầng dưới */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-orange-500 rounded"></div>
            <h3 className="text-lg font-bold text-gray-800">Tầng dưới</h3>
          </div>

          <div className="mb-4 flex justify-end pr-4">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🚗</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg">
            {lower.map((seat) => {
              const status = isRoundTrip
                ? getRoundTripSeatStatus(seat, direction)
                : getSeatStatus(seat);

              return (
                <button
                  key={seat.seatNumber}
                  onClick={() => isRoundTrip
                    ? handleRoundTripSeatClick(seat, direction)
                    : handleSeatClick(seat)
                  }
                  disabled={seat.status !== "available"}
                  className={`
                    relative h-14 rounded-lg font-bold text-sm transition-all transform
                    ${status === "available"
                      ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:shadow-md hover:scale-105"
                      : ""}
                    ${status === "selected"
                      ? "bg-orange-500 border-2 border-orange-600 text-white shadow-lg scale-105"
                      : ""}
                    ${seat.status === "booked" || seat.status === "locked"
                      ? "bg-gray-300 border-2 border-gray-400 text-gray-600 cursor-not-allowed"
                      : ""}
                  `}
                >
                  <span className="text-sm font-bold">{seat.seatNumber}</span>
                  {status === "selected" && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tầng trên */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-blue-500 rounded"></div>
            <h3 className="text-lg font-bold text-gray-800">Tầng trên</h3>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg">
            {upper.map((seat) => {
              const status = isRoundTrip
                ? getRoundTripSeatStatus(seat, direction)
                : getSeatStatus(seat);

              return (
                <button
                  key={seat.seatNumber}
                  onClick={() => isRoundTrip
                    ? handleRoundTripSeatClick(seat, direction)
                    : handleSeatClick(seat)
                  }
                  disabled={seat.status !== "available"}
                  className={`
                    relative h-14 rounded-lg font-bold text-sm transition-all transform
                    ${status === "available"
                      ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:shadow-md hover:scale-105"
                      : ""}
                    ${status === "selected"
                      ? "bg-orange-500 border-2 border-orange-600 text-white shadow-lg scale-105"
                      : ""}
                    ${seat.status === "booked" || seat.status === "locked"
                      ? "bg-gray-300 border-2 border-gray-400 text-gray-600 cursor-not-allowed"
                      : ""}
                  `}
                >
                  <span className="text-sm font-bold">{seat.seatNumber}</span>
                  {status === "selected" && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ⚠️ REMOVED OLD ERROR CHECK - Using hasValidData check above instead
  // Old check: if (!trip) caused error for round trips!

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner - Support both one-way and round trip */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isRoundTrip ? "Thông tin vé khứ hồi" : "Thông tin chuyến đi"}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                {isRoundTrip && outboundTrip ? (
                  <>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {outboundTrip.route.fromLocation} ⇄ {outboundTrip.route.toLocation}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Đi: {formatDate(outboundTrip.departureTime)} | Về: {returnTrip ? formatDate(returnTrip.departureTime) : '---'}
                    </span>
                  </>
                ) : trip ? (
                  <>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {trip.route.fromLocation} → {trip.route.toLocation}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatTime(trip.departureTime)} - {formatDate(trip.departureTime)}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              ← Quay lại
            </button>
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
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      🎉 Giảm 10% vé khứ hồi
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="outbound" className="text-base">
                        🚌 Chuyến đi ({new Date(outboundTrip.departureTime).toLocaleDateString('vi-VN')})
                      </TabsTrigger>
                      <TabsTrigger value="return" className="text-base">
                        🔄 Chuyến về ({new Date(returnTrip.departureTime).toLocaleDateString('vi-VN')})
                      </TabsTrigger>
                    </TabsList>

                    {/* Outbound Tab Content */}
                    <TabsContent value="outbound" className="mt-0">
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">Chuyến đi</div>
                            <div className="font-bold text-lg">{outboundTrip.route.fromLocation} → {outboundTrip.route.toLocation}</div>
                            <div className="text-sm text-gray-600">{formatTime(outboundTrip.departureTime)} | {outboundTrip.vehicle.model}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Đã chọn</div>
                            <div className="text-2xl font-bold text-orange-600">{selectedOutboundSeats.length} ghế</div>
                          </div>
                        </div>
                      </div>
                      {renderSeatMap(outboundSeats, "outbound", outboundTrip)}

                      {/* ⭐ Outbound Pickup/Dropoff Section */}
                      <Card className="mt-6">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4">Thông tin đón trả - Chuyến đi</h3>

                          <div className="space-y-4">
                            {/* Pickup */}
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">ĐIỂM ĐÓN</Label>
                              {outboundPickupOptions.length > 0 ? (
                                <Select value={outboundPickupPoint} onValueChange={setOutboundPickupPoint}>
                                  <SelectTrigger className="w-full">
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
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                                  BX {outboundTrip.route.fromLocation}
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Vui lòng có mặt trước {formatTime(outboundTrip.departureTime)}
                              </p>
                            </div>

                            {/* Dropoff */}
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">ĐIỂM TRẢ</Label>
                              {outboundDropoffOptions.length > 0 ? (
                                <Select value={outboundDropoffPoint} onValueChange={setOutboundDropoffPoint}>
                                  <SelectTrigger className="w-full">
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
                    <TabsContent value="return" className="mt-0">
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">Chuyến về</div>
                            <div className="font-bold text-lg">{returnTrip.route.fromLocation} → {returnTrip.route.toLocation}</div>
                            <div className="text-sm text-gray-600">{formatTime(returnTrip.departureTime)} | {returnTrip.vehicle.model}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Đã chọn</div>
                            <div className="text-2xl font-bold text-orange-600">{selectedReturnSeats.length} ghế</div>
                          </div>
                        </div>
                      </div>
                      {renderSeatMap(returnSeats, "return", returnTrip)}

                      {/* ⭐ Return Pickup/Dropoff Section */}
                      <Card className="mt-6">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4">Thông tin đón trả - Chuyến về</h3>

                          <div className="space-y-4">
                            {/* Pickup */}
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">ĐIỂM ĐÓN</Label>
                              {returnPickupOptions.length > 0 ? (
                                <Select value={returnPickupPoint} onValueChange={setReturnPickupPoint}>
                                  <SelectTrigger className="w-full">
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
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                                  BX {returnTrip.route.fromLocation}
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Vui lòng có mặt trước {formatTime(returnTrip.departureTime)}
                              </p>
                            </div>

                            {/* Dropoff */}
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">ĐIỂM TRẢ</Label>
                              {returnDropoffOptions.length > 0 ? (
                                <Select value={returnDropoffPoint} onValueChange={setReturnDropoffPoint}>
                                  <SelectTrigger className="w-full">
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-2xl">🚌</span>
                      <span className="font-semibold">{trip.vehicle.model}</span>
                    </div>
                  </div>

                {/* Chú thích - Style Phương Trang */}
                <div className="flex flex-wrap gap-6 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-md flex items-center justify-center text-sm font-semibold">
                      A01
                    </div>
                    <span className="text-sm font-medium text-gray-700">Còn trống</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 border-2 border-orange-600 rounded-md flex items-center justify-center text-white text-sm font-semibold">
                      A02
                    </div>
                    <span className="text-sm font-medium text-gray-700">Đang chọn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 text-sm font-semibold">
                      A03
                    </div>
                    <span className="text-sm font-medium text-gray-700">Đã bán</span>
                  </div>
                </div>

                {/* Tầng dưới - Improved Layout */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-orange-500 rounded"></div>
                    <h3 className="text-lg font-bold text-gray-800">Tầng dưới</h3>
                  </div>

                  {/* Driver seat indicator */}
                  <div className="mb-4 flex justify-end pr-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🚗</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg">
                    {lowerSeats.map((seat) => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status !== "available"}
                        className={`
                          relative h-14 rounded-lg font-bold text-sm transition-all transform
                          ${getSeatStatus(seat) === "available"
                            ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:shadow-md hover:scale-105"
                            : ""}
                          ${getSeatStatus(seat) === "selected"
                            ? "bg-orange-500 border-2 border-orange-600 text-white shadow-lg scale-105"
                            : ""}
                          ${seat.status === "booked" || seat.status === "locked"
                            ? "bg-gray-300 border-2 border-gray-400 text-gray-600 cursor-not-allowed"
                            : ""}
                        `}
                      >
                        <span className="text-sm font-bold">{seat.seatNumber}</span>
                        {getSeatStatus(seat) === "selected" && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tầng trên - Improved Layout */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                    <h3 className="text-lg font-bold text-gray-800">Tầng trên</h3>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg">
                    {upperSeats.map((seat) => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status !== "available"}
                        className={`
                          relative h-14 rounded-lg font-bold text-sm transition-all transform
                          ${getSeatStatus(seat) === "available"
                            ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:shadow-md hover:scale-105"
                            : ""}
                          ${getSeatStatus(seat) === "selected"
                            ? "bg-orange-500 border-2 border-orange-600 text-white shadow-lg scale-105"
                            : ""}
                          ${seat.status === "booked" || seat.status === "locked"
                            ? "bg-gray-300 border-2 border-gray-400 text-gray-600 cursor-not-allowed"
                            : ""}
                        `}
                      >
                        <span className="text-sm font-bold">{seat.seatNumber}</span>
                        {getSeatStatus(seat) === "selected" && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
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

                    {/* Button */}
                    {selectedOutboundSeats.length === 0 && selectedReturnSeats.length === 0 ? (
                      <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="w-full mt-6 py-6 text-lg font-semibold"
                      >
                        ← Quay về
                      </Button>
                    ) : (
                      <Button
                        onClick={handleContinue}
                        disabled={
                          selectedOutboundSeats.length === 0 ||
                          selectedReturnSeats.length === 0 ||
                          !customerName ||
                          !customerPhone ||
                          !customerEmail
                        }
                        className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-6 text-lg font-semibold"
                      >
                        Đặt vé khứ hồi
                      </Button>
                    )}
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

                    {/* Button */}
                    {selectedSeats.length === 0 ? (
                      <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="w-full mt-6 py-6 text-lg font-semibold"
                      >
                        ← Quay về
                      </Button>
                    ) : (
                      <Button
                        onClick={handleContinue}
                        disabled={
                          !customerName ||
                          !customerPhone ||
                          !customerEmail
                        }
                        className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                      >
                        Đặt vé
                      </Button>
                    )}
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
