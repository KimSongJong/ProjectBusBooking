  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import MainPage from './pages/Mainpage'
import Product from './pages/Product'
import Schedule from './pages/Schedule'
import SearchTicket from './pages/SearchTicket'
import News from './pages/News'
import Invoice from './pages/Invoice'
import Contact from './pages/Contact'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/Adminpage/AdminLogin'
import AdminDashboard from './pages/Adminpage/AdminDashBoard'
import AdminAccount from './pages/Adminpage/AdminAccount'
import AdminDriver from './pages/Adminpage/AdminDriver'
import AdminVehicles from './pages/Adminpage/AdminVehicles'
import AdminRoutes from './pages/Adminpage/AdminRoutes'
import AdminTrips from './pages/Adminpage/AdminTrips'
import AdminTickets from './pages/Adminpage/AdminTickets'
import AdminSeats from './pages/Adminpage/AdminSeats'
import AdminPromotions from './pages/Adminpage/AdminPromotions'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/product" element={<Product />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/search-ticket" element={<SearchTicket />} />
          <Route path="/news" element={<News />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/account" element={<AdminAccount />} />
            <Route path="/admin/vehicles" element={<AdminVehicles />} />
            <Route path="/admin/drivers" element={<AdminDriver />} />
            <Route path="/admin/routes" element={<AdminRoutes />} />
            <Route path="/admin/trips" element={<AdminTrips />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/seats" element={<AdminSeats />} />
            <Route path="/admin/promotions" element={<AdminPromotions />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
