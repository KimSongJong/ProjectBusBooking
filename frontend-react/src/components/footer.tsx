import { Separator } from "@/components/ui/separator"
import { Phone, Mail, MapPinIcon } from "lucide-react"
import { FaBus } from "react-icons/fa"

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-600 rounded-lg p-2">
                <FaBus className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">FUTA Bus Lines</h3>
                <p className="text-xs text-gray-400">Chất lượng là danh dự</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Công ty vận tải hàng đầu Việt Nam với 24 năm kinh nghiệm
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-orange-400">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Giới thiệu</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Lịch sử phát triển</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Tuyển dụng</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Đối tác</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-orange-400">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Hướng dẫn đặt vé</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Chính sách & Quy định</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-orange-400">Liên hệ</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-orange-400 font-bold text-lg">1900 6067</div>
                  <p className="text-gray-400">Hotline 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <a href="mailto:hotro@futa.vn" className="text-gray-400 hover:text-orange-400">
                    hotro@futa.vn
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-orange-400 mt-1 flex-shrink-0" />
                <p className="text-gray-400">
                  Số 01 Tô Hiến Thành, Phường 3, TP. Đà Lạt, Lâm Đồng
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2025 FUTA Bus Lines. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-orange-400 transition">Facebook</a>
            <a href="#" className="hover:text-orange-400 transition">YouTube</a>
            <a href="#" className="hover:text-orange-400 transition">Zalo</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
