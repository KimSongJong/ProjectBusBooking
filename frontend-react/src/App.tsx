import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { AdminProtectedRoute } from "./components/ProtectedRoute";
import MainPage from "./pages/Mainpage";
import Product from "./pages/Product";
import BookingSeat from "./pages/BookingSeat";
import Payment from "./pages/Payment";
import PaymentResult from "./pages/PaymentResult"; // ✅ ADD: Import PaymentResult
import Schedule from "./pages/Schedule";
import SearchTicket from "./pages/SearchTicket";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Invoice from "./pages/Invoice";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/Adminpage/AdminLogin";
import AdminDashboard from "./pages/Adminpage/AdminDashBoard";
import AdminAccount from "./pages/Adminpage/AdminAccount";
import AdminDriver from "./pages/Adminpage/AdminDriver";
import AdminVehicles from "./pages/Adminpage/AdminVehicles";
import AdminRoutes from "./pages/Adminpage/AdminRoutes";
import AdminTrips from "./pages/Adminpage/AdminTrips";
import AdminTickets from "./pages/Adminpage/AdminTickets";
import AdminSeats from "./pages/Adminpage/AdminSeats";
import AdminPromotions from "./pages/Adminpage/AdminPromotions";
import AdminPayments from "./pages/Adminpage/AdminPayments";
import AdminStations from "./pages/AdminStations";
import AdminPendingCities from "./pages/Adminpage/AdminPendingCities";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster position="top-right" richColors />
          <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/product" element={<Product />} />
          <Route path="/booking-seat" element={<BookingSeat />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/result" element={<PaymentResult />} /> {/* ✅ ADD: Payment callback route */}
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/search-ticket" element={<SearchTicket />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/account"
            element={
              <AdminProtectedRoute>
                <AdminAccount />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <AdminProtectedRoute>
                <AdminVehicles />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <AdminProtectedRoute>
                <AdminDriver />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/routes"
            element={
              <AdminProtectedRoute>
                <AdminRoutes />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/trips"
            element={
              <AdminProtectedRoute>
                <AdminTrips />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <AdminProtectedRoute>
                <AdminTickets />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/seats"
            element={
              <AdminProtectedRoute>
                <AdminSeats />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/promotions"
            element={
              <AdminProtectedRoute>
                <AdminPromotions />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminProtectedRoute>
                <AdminPayments />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/stations"
            element={
              <AdminProtectedRoute>
                <AdminStations />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/pending-cities"
            element={
              <AdminProtectedRoute>
                <AdminPendingCities />
              </AdminProtectedRoute>
            }
          />
        </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
