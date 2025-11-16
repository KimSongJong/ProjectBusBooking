import type { News } from "@/types/news.types"

export const newsCategories = [
  { id: "all", name: "Tất cả" },
  { id: "promotion", name: "Khuyến mãi" },
  { id: "route", name: "Tuyến xe" },
  { id: "service", name: "Dịch vụ" },
  { id: "announcement", name: "Thông báo" }
]

export const newsData: News[] = [
  {
    id: 1,
    title: "Khuyến mãi đặc biệt mùa hè 2024 - Giảm đến 30% cho các tuyến đường dài",
    slug: "khuyen-mai-dac-biet-mua-he-2024",
    excerpt: "Chương trình khuyến mãi hấp dẫn trong mùa hè với giảm giá lên đến 30% cho các tuyến xe đường dài. Đặt vé ngay để nhận ưu đãi tốt nhất!",
    content: `
      <h2>Chương trình khuyến mãi hè 2024</h2>
      <p>TPT tự hào công bố chương trình khuyến mãi đặc biệt mùa hè năm 2024, mang đến cơ hội tuyệt vời cho hành khách tiết kiệm chi phí đi lại trong kỳ nghỉ hè.</p>
      
      <h3>Ưu đãi áp dụng:</h3>
      <ul>
        <li><strong>Giảm 30%</strong> cho các tuyến trên 300km</li>
        <li><strong>Giảm 20%</strong> cho các tuyến từ 150-300km</li>
        <li><strong>Giảm 15%</strong> cho các tuyến dưới 150km</li>
      </ul>
      
      <h3>Điều kiện áp dụng:</h3>
      <p>Chương trình áp dụng từ ngày 01/06/2024 đến 31/08/2024. Khách hàng đặt vé online qua website hoặc ứng dụng di động sẽ được hưởng ưu đãi tốt nhất.</p>
      
      <p>Đặt vé ngay hôm nay để tận hưởng kỳ nghỉ hè trọn vẹn với mức giá ưu đãi nhất!</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop",
    publishedDate: "2024-05-20",
    category: "promotion",
    views: 15420
  },
  {
    id: 2,
    title: "Khai trương tuyến xe mới Hà Nội - Đà Nẵng với xe giường nằm cao cấp",
    slug: "khai-truong-tuyen-xe-moi-ha-noi-da-nang",
    excerpt: "TPT chính thức khai trương tuyến xe mới kết nối Hà Nội và Đà Nẵng với dòng xe giường nằm cao cấp, mang đến trải nghiệm di chuyển thoải mái nhất.",
    content: `
      <h2>Tuyến xe mới Hà Nội - Đà Nẵng</h2>
      <p>Sau thời gian chuẩn bị kỹ lưỡng, TPT vô cùng vui mừng thông báo khai trương tuyến xe mới kết nối hai thành phố lớn Hà Nội và Đà Nẵng.</p>
      
      <h3>Đặc điểm nổi bật:</h3>
      <ul>
        <li>Xe giường nằm 40 chỗ cao cấp với đệm êm ái</li>
        <li>Hệ thống điều hòa thông minh, WiFi miễn phí</li>
        <li>Tivi giải trí, cổng sạc USB tại mỗi ghế</li>
        <li>Tài xế chuyên nghiệp, kinh nghiệm lâu năm</li>
        <li>Xuất phát 2 chuyến/ngày vào lúc 20:00 và 21:00</li>
      </ul>
      
      <h3>Giá vé ưu đãi:</h3>
      <p>Trong tháng đầu khai trương, giá vé chỉ từ 450.000đ/người. Đặt vé ngay để đảm bảo chỗ!</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop",
    publishedDate: "2024-05-18",
    category: "route",
    views: 12350
  },
  {
    id: 3,
    title: "TPT nhận giải thưởng 'Thương hiệu xuất sắc năm 2024'",
    slug: "tpt-nhan-giai-thuong-thuong-hieu-xuat-sac",
    excerpt: "TPT vinh dự được trao tặng giải thưởng 'Thương hiệu xuất sắc năm 2024' bởi Hiệp hội Vận tải Việt Nam, ghi nhận những nỗ lực không ngừng nghỉ trong việc nâng cao chất lượng dịch vụ.",
    content: `
      <h2>Vinh dự lớn của TPT</h2>
      <p>Ngày 15/05/2024, trong buổi lễ trao giải thường niên của Hiệp hội Vận tải Việt Nam, TPT đã vinh dự nhận giải thưởng 'Thương hiệu xuất sắc năm 2024'.</p>
      
      <h3>Ý nghĩa của giải thưởng:</h3>
      <p>Giải thưởng này là sự ghi nhận cho những nỗ lực không ngừng nghỉ của TPT trong việc:</p>
      <ul>
        <li>Nâng cao chất lượng dịch vụ vận chuyển</li>
        <li>Đầu tư công nghệ hiện đại</li>
        <li>Đào tạo đội ngũ nhân viên chuyên nghiệp</li>
        <li>Đảm bảo an toàn tuyệt đối cho hành khách</li>
        <li>Bảo vệ môi trường trong hoạt động kinh doanh</li>
      </ul>
      
      <p>Đây là động lực lớn để TPT tiếp tục phát triển và hoàn thiện, mang đến dịch vụ tốt nhất cho khách hàng.</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=600&fit=crop",
    publishedDate: "2024-05-15",
    category: "announcement",
    views: 8920
  },
  {
    id: 4,
    title: "Nâng cấp dịch vụ thanh toán online - Thanh toán nhanh chóng, an toàn",
    slug: "nang-cap-dich-vu-thanh-toan-online",
    excerpt: "Hệ thống thanh toán online của TPT được nâng cấp toàn diện, hỗ trợ đa dạng phương thức thanh toán, mang đến sự tiện lợi tối đa cho khách hàng.",
    content: `
      <h2>Hệ thống thanh toán mới</h2>
      <p>TPT đã hoàn tất việc nâng cấp hệ thống thanh toán online, áp dụng công nghệ bảo mật tiên tiến nhất hiện nay.</p>
      
      <h3>Các phương thức thanh toán được hỗ trợ:</h3>
      <ul>
        <li>Thẻ ATM nội địa (Napas)</li>
        <li>Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard, JCB)</li>
        <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
        <li>Chuyển khoản ngân hàng</li>
        <li>Thanh toán tại văn phòng</li>
      </ul>
      
      <h3>Ưu điểm:</h3>
      <p>Giao dịch nhanh chóng, chỉ mất 30 giây. Bảo mật tuyệt đối với công nghệ mã hóa SSL 256-bit. Xác nhận vé ngay lập tức qua email và SMS.</p>
      
      <p>Trải nghiệm đặt vé trực tuyến tiện lợi ngay hôm nay!</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    publishedDate: "2024-05-10",
    category: "service",
    views: 6780
  },
  {
    id: 5,
    title: "Chương trình tri ân khách hàng thân thiết - Tích điểm nhận quà",
    slug: "chuong-trinh-tri-an-khach-hang-than-thiet",
    excerpt: "TPT ra mắt chương trình khách hàng thân thiết với nhiều ưu đãi hấp dẫn. Tích điểm mỗi chuyến đi để đổi quà và nhận voucher giảm giá.",
    content: `
      <h2>Chương trình khách hàng thân thiết TPT</h2>
      <p>Để tri ân những khách hàng đã và đang đồng hành cùng TPT, chúng tôi chính thức ra mắt chương trình khách hàng thân thiết với nhiều ưu đãi đặc biệt.</p>
      
      <h3>Cách thức tích điểm:</h3>
      <ul>
        <li>Đăng ký tài khoản miễn phí tại website hoặc ứng dụng</li>
        <li>Mỗi 10.000đ chi tiêu = 1 điểm thưởng</li>
        <li>Điểm thưởng được cộng tự động sau mỗi chuyến đi</li>
        <li>Điểm tích lũy không có thời hạn sử dụng</li>
      </ul>
      
      <h3>Quyền lợi hội viên:</h3>
      <ul>
        <li><strong>Hạng Bạc</strong> (0-499 điểm): Giảm 5% mỗi chuyến</li>
        <li><strong>Hạng Vàng</strong> (500-999 điểm): Giảm 10% + ưu tiên chọn chỗ</li>
        <li><strong>Hạng Kim Cương</strong> (1000+ điểm): Giảm 15% + phòng chờ VIP</li>
      </ul>
      
      <p>Đăng ký ngay hôm nay để bắt đầu tích điểm!</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800&h=600&fit=crop",
    publishedDate: "2024-05-05",
    category: "promotion",
    views: 11200
  },
  {
    id: 6,
    title: "Thông báo lịch nghỉ lễ Quốc Khánh 2/9 và điều chỉnh giá vé",
    slug: "thong-bao-lich-nghi-le-quoc-khanh",
    excerpt: "TPT thông báo lịch hoạt động dịp lễ Quốc Khánh 2/9. Các tuyến xe sẽ tăng cường chuyến để phục vụ nhu cầu đi lại của hành khách.",
    content: `
      <h2>Thông báo lịch nghỉ lễ 2/9</h2>
      <p>Nhân dịp kỷ niệm Quốc Khánh 2/9, TPT xin thông báo lịch hoạt động và điều chỉnh như sau:</p>
      
      <h3>Lịch hoạt động:</h3>
      <ul>
        <li>Ngày 31/8 - 3/9: Tăng cường 30% số chuyến xe</li>
        <li>Các tuyến đường dài sẽ có thêm chuyến đêm</li>
        <li>Văn phòng vé hoạt động bình thường</li>
      </ul>
      
      <h3>Điều chỉnh giá vé:</h3>
      <p>Do nhu cầu đi lại tăng cao trong dịp lễ, giá vé sẽ được điều chỉnh tăng 15-20% so với ngày thường. Khách hàng nên đặt vé sớm để có giá tốt nhất.</p>
      
      <h3>Lưu ý:</h3>
      <ul>
        <li>Có mặt tại bến trước 30 phút</li>
        <li>Mang theo CMND/CCCD</li>
        <li>Không mang theo vật phẩm nguy hiểm</li>
      </ul>
      
      <p>Chúc quý khách có một kỳ nghỉ lễ vui vẻ và an toàn!</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
    publishedDate: "2024-08-15",
    category: "announcement",
    views: 9450
  }
]