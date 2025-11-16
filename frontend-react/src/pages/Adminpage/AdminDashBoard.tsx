import { useEffect, useState } from "react"
import LeftTaskBar from "@/components/LeftTaskBar"
import { Card } from "@/components/ui/card"
import { FaUsers, FaCar, FaRoute, FaTicketAlt, FaChartLine, FaMoneyBillWave } from "react-icons/fa"
import api from "@/config/axios"
import ENDPOINTS from "@/config/constants"

interface DashboardStats {
  totalUsers: number
  totalVehicles: number
  totalRoutes: number
  totalTickets: number
  totalRevenue: number
  activeTrips: number
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVehicles: 0,
    totalRoutes: 0,
    totalTickets: 0,
    totalRevenue: 0,
    activeTrips: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      // Fetch data from multiple endpoints
      const [usersRes, vehiclesRes, routesRes, ticketsRes] = await Promise.all([
        api.get(ENDPOINTS.USERS.BASE).catch(() => ({ data: [] })),
        api.get(ENDPOINTS.VEHICLES.BASE).catch(() => ({ data: [] })),
        api.get(ENDPOINTS.ROUTES.BASE).catch(() => ({ data: [] })),
        api.get(ENDPOINTS.TICKETS.BASE).catch(() => ({ data: [] })),
      ])

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalVehicles: vehiclesRes.data?.length || 0,
        totalRoutes: routesRes.data?.length || 0,
        totalTickets: ticketsRes.data?.length || 0,
        totalRevenue: 0, // Calculate from tickets
        activeTrips: 0, // Calculate from trips
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Tổng người dùng",
      value: loading ? "..." : stats.totalUsers,
      icon: <FaUsers className="text-3xl" />,
      color: "from-blue-500 to-blue-950",
      textColor: "text-blue-950",
    },
    {
      title: "Tổng xe",
      value: loading ? "..." : stats.totalVehicles,
      icon: <FaCar className="text-3xl" />,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
    },
    {
      title: "Tổng tuyến đường",
      value: loading ? "..." : stats.totalRoutes,
      icon: <FaRoute className="text-3xl" />,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
    },
    {
      title: "Tổng vé đã bán",
      value: loading ? "..." : stats.totalTickets,
      icon: <FaTicketAlt className="text-3xl" />,
      color: "from-blue-950 to-blue-900",
      textColor: "text-blue-900",
    },
    {
      title: "Doanh thu",
      value: loading ? "..." : `${stats.totalRevenue.toLocaleString("vi-VN")}đ`,
      icon: <FaMoneyBillWave className="text-3xl" />,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
    },
    {
      title: "Chuyến đang chạy",
      value: loading ? "..." : stats.activeTrips,
      icon: <FaChartLine className="text-3xl" />,
      color: "from-red-500 to-red-600",
      textColor: "text-red-600",
    },
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Sidebar */}
      <LeftTaskBar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600 mt-1">Tổng quan hệ thống quản lý xe khách</p>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((card, index) => (
              <Card
                key={index}
                className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-br ${card.color} text-white p-4 rounded-xl shadow-lg`}>
                      {card.icon}
                    </div>
                  </div>
                  <h3 className="text-slate-600 text-sm font-medium mb-2">{card.title}</h3>
                  <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                {/* Decorative gradient */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>
              </Card>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tickets */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaTicketAlt className="text-blue-950" />
                Vé gần đây
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-slate-400">Đang tải dữ liệu...</div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Chưa có dữ liệu vé
                  </div>
                )}
              </div>
            </Card>

            {/* System Status */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaChartLine className="text-green-500" />
                Trạng thái hệ thống
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Backend API</span>
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Database</span>
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Server Load</span>
                  <span className="px-3 py-1 bg-blue-950 text-white text-xs font-semibold rounded-full">
                    Normal
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Welcome Message */}
          <Card className="mt-6 p-6 bg-gradient-to-r from-blue-950 to-blue-900 text-white">
            <h2 className="text-2xl font-bold mb-2">Chào mừng đến với Admin Portal! 👋</h2>
            <p className="text-orange-100">
              Quản lý toàn bộ hệ thống xe khách TPT Bus Lines. Sử dụng menu bên trái để điều hướng đến các chức năng quản lý.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard


