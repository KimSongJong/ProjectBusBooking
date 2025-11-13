  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AdminProtectedRoute } from './components/ProtectedRoute'
import MainPage from './pages/Mainpage'
import Product from './pages/Product'
import Schedule from './pages/Schedule'
import SearchTicket from './pages/SearchTicket'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
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
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/account" element={
            <AdminProtectedRoute>
              <AdminAccount />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/vehicles" element={
            <AdminProtectedRoute>
              <AdminVehicles />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/drivers" element={
            <AdminProtectedRoute>
              <AdminDriver />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/routes" element={
            <AdminProtectedRoute>
              <AdminRoutes />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/trips" element={
            <AdminProtectedRoute>
              <AdminTrips />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/tickets" element={
            <AdminProtectedRoute>
              <AdminTickets />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/seats" element={
            <AdminProtectedRoute>
              <AdminSeats />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/promotions" element={
            <AdminProtectedRoute>
              <AdminPromotions />
            </AdminProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
