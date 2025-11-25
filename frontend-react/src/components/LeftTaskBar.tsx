import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FaCar, FaUserTie, FaRoute, FaMapMarkedAlt, FaTicketAlt, FaChair, FaGift, FaSignOutAlt, FaTachometerAlt, FaUserCircle, FaDollarSign, FaMapMarkerAlt } from "react-icons/fa"

interface MenuItem {
  title: string
  icon: React.ReactNode
  path: string
  badge?: number
}

function LeftTaskBar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Đăng xuất thành công")
      navigate("/admin/login")
    } catch (error) {
      toast.error("Đăng xuất thất bại")
    }
  }

  const isActive = (path: string) => location.pathname === path

  // Menu items mapped from backend modules
  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin/dashboard",
    },
    {
      title: "Tài khoản",
      icon: <FaUserCircle />,
      path: "/admin/account",
    },
    {
      title: "Quản lý xe",
      icon: <FaCar />,
      path: "/admin/vehicles",
    },
    {
      title: "Quản lý tài xế",
      icon: <FaUserTie />,
      path: "/admin/drivers",
    },
    {
      title: "Quản lý trạm xe",
      icon: <FaMapMarkerAlt />,
      path: "/admin/stations",
    },
    {
      title: "Quản lý tuyến đường",
      icon: <FaRoute />,
      path: "/admin/routes",
    },
    {
      title: "Quản lý chuyến xe",
      icon: <FaMapMarkedAlt />,
      path: "/admin/trips",
    },
    {
      title: "Quản lý vé",
      icon: <FaTicketAlt />,
      path: "/admin/tickets",
    },
    {
      title: "Quản lý thanh toán",
      icon: <FaDollarSign />,
      path: "/admin/payments",
    },
    {
      title: "Quản lý ghế",
      icon: <FaChair />,
      path: "/admin/seats",
    },
    {
      title: "Quản lý khuyến mãi",
      icon: <FaGift />,
      path: "/admin/promotions",
    },
  ]

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl">
      {/* Header - User Info Only */}
      <div className="p-5 bg-slate-900 border-b border-slate-700">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-950 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              {user.fullName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Body - Navigation Menu */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200
              ${
                isActive(item.path)
                  ? "bg-blue-950 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }
            `}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-xs font-medium flex-1">{item.title}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-3 border-t border-slate-700">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 shadow-lg py-2 text-xs"
        >
          <FaSignOutAlt className="text-sm" />
          <span>Đăng xuất</span>
        </Button>
        
        <p className="text-center text-[10px] text-slate-500 mt-2">
          © 2025 TPT Bus Lines
        </p>
      </div>
    </div>
  )
}

export default LeftTaskBar
