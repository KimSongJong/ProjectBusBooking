import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FaBus } from "react-icons/fa"
import { IoPhonePortraitOutline } from "react-icons/io5"
import { useAuth } from "@/contexts/AuthContext"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface HeaderProps {
  height?: string
}

function Header({ height = "auto" }: HeaderProps) {
  const [language, setLanguage] = useState<"VI" | "EN">("VI")
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  
  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Đăng xuất thành công")
      navigate("/")
    } catch (error) {
      toast.error("Đăng xuất thất bại")
    }
  }
  
  return (
    <header className="relative z-50 ">
      {/* Combined Header with Top Bar and Navigation */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-xl">
        {/* Top Bar Section */}
        <div 
          className="relative"
          style={{ height: height }}
        >
          {/* Decorative angled background */}

          
          <div className="relative z-10 w-full px-4 md:px-8 lg:px-12 h-full">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-full py-4">
            {/* Left - Language & App */}
            <div className="flex items-center gap-6">
              {/* Language Selector */}
              <div className="relative z-[9999]">
                <div 
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/10 px-3 py-2 rounded"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                    {language === "VI" ? (
                      <div className="w-full h-full flex items-center justify-center bg-red-600">
                        <span className="text-yellow-400 text-lg">★</span>
                      </div>
                    ) : (
                      <span className="text-lg">🇬🇧</span>
                    )}
                  </div>
                  <span className="font-medium">{language}</span>
                  <span className="text-xs">▼</span>
                </div>

                {/* Dropdown Menu */}
                {showLangDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl overflow-visible z-[10000] w-32">
                    <div 
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 ${language === "VI" ? "bg-orange-50" : ""}`}
                      onClick={() => {
                        setLanguage("VI")
                        setShowLangDropdown(false)
                      }}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-red-600 border border-gray-300">
                        <span className="text-yellow-400 text-lg">★</span>
                      </div>
                      <span className="font-medium text-gray-800">VI</span>
                    </div>
                    <div 
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 ${language === "EN" ? "bg-orange-50" : ""}`}
                      onClick={() => {
                        setLanguage("EN")
                        setShowLangDropdown(false)
                      }}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                        <span className="text-lg">🇬🇧</span>
                      </div>
                      <span className="font-medium text-gray-800">EN</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex items-center gap-2 cursor-pointer">
                <IoPhonePortraitOutline className="text-2xl" />
                <div className="text-sm">
                  <div>Tải ứng dụng</div>
                </div>
                <span>▼</span>
              </div>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-white rounded-xl px-8 py-4 shadow-2xl flex items-center gap-3 hover:shadow-3xl transition-shadow border-2 border-orange-400">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-2">
                    <FaBus className="text-3xl text-orange-400" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-900 bg-clip-text text-transparent">TPT Bus Lines</h1>
                    <p className="text-xs text-gray-600 font-medium">CHẤT LƯỢNG LÀ DANH DỰ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Login Button or User Menu */}
            <div className="flex items-center">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-transparent hover:bg-white/20 text-white border-2 border-white rounded-full px-6 py-2"
                    >
                      <span className="mr-2">👤</span>
                      <span>{user.fullName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email || user.username}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <span>Thông tin cá nhân</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/search-ticket")}>
                      <span>Vé của tôi</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  className="bg-transparent hover:bg-white/20 text-white border-2 border-white rounded-full px-6 py-2"
                >
                  <Link to="/login" className="flex items-center gap-2">
                    <span className="mr-2">👤</span>
                    <span>Đăng nhập/Đăng ký</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* tion Menu */}
        <nav>
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <ul className="flex items-center justify-center gap-8 text-sm font-semibold">
                <li className={`py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200 ${isActive('/') ? 'border-b-4 border-white' : ''}`}>
                  <Link to="/" className="whitespace-nowrap">TRANG CHỦ</Link>
                </li>
                <li className={`py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200 ${isActive('/schedule') ? 'border-b-4 border-white' : ''}`}>
                  <Link to="/schedule" className="whitespace-nowrap">LỊCH TRÌNH</Link>
                </li>
                <li className={`py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200 ${isActive('/search-ticket') ? 'border-b-4 border-white' : ''}`}>
                  <Link to="/search-ticket" className="whitespace-nowrap">TRA CỨU VÉ</Link>
                </li>
                <li className={`py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200 ${isActive('/news') ? 'border-b-4 border-white' : ''}`}>
                  <Link to="/news" className="whitespace-nowrap">TIN TỨC</Link>
                </li>
                <li className={`py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200 ${isActive('/contact') ? 'border-b-4 border-white' : ''}`}>
                  <Link to="/contact" className="whitespace-nowrap">LIÊN HỆ</Link>
                </li>
                <li className={`py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200 ${isActive('/about') ? 'border-b-4 border-white' : ''}`}>
                  <Link to="/about" className="whitespace-nowrap">VỀ CHÚNG TÔI</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
