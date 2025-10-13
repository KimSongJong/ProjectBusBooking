import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaBus } from "react-icons/fa"
import { IoPhonePortraitOutline } from "react-icons/io5"

interface HeaderProps {
  height?: string
}

function Header({ height = "auto" }: HeaderProps) {
  const [language, setLanguage] = useState<"VI" | "EN">("VI")
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  return (
    <header className="relative z-50">
      {/* Combined Header with Top Bar and Navigation */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white shadow-xl">
        {/* Top Bar Section */}
        <div 
          className="relative"
          style={{ height: height }}
        >
          {/* Decorative angled background */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-br from-orange-400 to-orange-700 transform skew-x-[-20deg] translate-x-1/4"></div>
          
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
              <div className="bg-white rounded-lg px-6 py-3 shadow-lg flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-500 rounded p-1">
                    <FaBus className="text-2xl text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-xl font-bold text-orange-600">FUTA Bus Lines</h1>
                    <p className="text-xs text-gray-600">CHẤT LƯỢNG LÀ DANH DỰ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Login Button */}
            <div className="flex items-center">
              <Button  
                className="bg-transparent hover:bg-white/20 text-white border-2 border-white rounded-full px-6 py-2"
              >
                <span className="mr-2">👤</span>
                Đăng nhập/Đăng ký
              </Button>
            </div>
          </div>
        </div>
        </div>

        {/* Navigation Menu */}
        <nav>
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <ul className="flex items-center justify-center gap-8 text-sm font-semibold">
                <li className="py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200">
                  <a href="/" className="whitespace-nowrap">TRANG CHỦ</a>
                </li>
                <li className="py-4 hover:bg-white/20 px-4 cursor-pointer border-b-4 border-white transition-all duration-200">
                  <a href="#" className="whitespace-nowrap">LỊCH TRÌNH</a>
                </li>
                <li className="py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200">
                  <a href="#" className="whitespace-nowrap">TRA CỨU VÉ</a>
                </li>
                <li className="py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200">
                  <a href="#" className="whitespace-nowrap">TIN TỨC</a>
                </li>
                <li className="py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200">
                  <a href="#" className="whitespace-nowrap">HÓA ĐƠN</a>
                </li>
                <li className="py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200">
                  <a href="#" className="whitespace-nowrap">LIÊN HỆ</a>
                </li>
                <li className="py-4 hover:bg-white/20 px-4 cursor-pointer transition-all duration-200">
                  <a href="#" className="whitespace-nowrap">VỀ CHÚNG TÔI</a>
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
