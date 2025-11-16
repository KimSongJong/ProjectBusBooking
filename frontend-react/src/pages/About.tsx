import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

function About() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">

        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-4">
            <span className="text-4xl font-bold text-center text-blue-800 mb-12">Tâm Phúc Tài</span>
          </h1>
          <p className="text-2xl text-center italic">"Chất lượng là danh dự"</p>
        </div>


        {/* About Company */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Tập đoàn <span className="font-bold text-blue-800">Tâm Phúc Tài (TPT)</span> được thành lập năm 2001.
              Với hoạt động kinh doanh chính trong lĩnh vực mua bán xe ô tô, vận tải hành khách, bất động sản
              và kinh doanh dịch vụ. TPT đã trở thành cái tên quen thuộc đồng hành cùng người Việt trên mọi lĩnh vực.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Trải qua hơn 24 năm hình thành và phát triển đặt khách hàng là trọng tâm, chúng tôi tự
              hào trở thành doanh nghiệp vận tải hàng đầu trong nước góp lịch cực vào sự phát triển
              chung của ngành vận tải nội riêng và nền kinh tế đất nước nói chung. Luôn cải tiến mang
              đến chất lượng dịch vụ tối ưu nhất dành cho khách hàng, Công ty TPT được ghi nhận qua
              nhiều giải thưởng danh giá như "Thương hiệu số 1 Việt Nam", "Top 1 Thương hiệu mạnh
              ASEAN 2024", "Top 5 Sản phẩm dịch vụ chất lượng ASEAN 2024", "Top 10 Thương hiệu dẫn
              đầu Việt Nam 2024", "Top 10 Thương hiệu mạnh Quốc gia 2024", "Top 10 thương hiệu uy tín
              hàng đầu ASEAN 2024", "Top 10 Thương hiệu Quốc gia hội nhập Châu Á - Thái Bình Dương 2024"...
            </p>
          </div>
        </div>

        {/* Name Meaning Section */}
        <div className="bg-gray-200 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">
              GIÁ TRỊ CỐT LÕI
            </h2>
            <p className="text-center text-gray-700 texst-lg mb-12">
              Giá trị cốt lõi – <span className="text-blue-800 font-semibold">Tâm Phúc Tài</span>
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Tâm */}
              <Card className="border-blue-200 hover:shadow-xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl font-bold text-blue-800 mb-4">Tâm</div>
                  <p className="text-gray-700 leading-relaxed">
                    Chữ "<span className="font-semibold text-blue-800">Tâm</span>" trong tiếng Hán nghĩa là Vương,
                    vật gì hình thể ngay thẳng đều gọi là phương, thể hiện sự chính trực, phẩm chất đạo đức tốt đẹp.
                    Mọi hành động của Tâm Phúc Tài luôn thể hiện sự minh bạch, công bằng chính trực với đồng nghiệp,
                    khách hàng, đối tác.
                  </p>
                </CardContent>
              </Card>

              {/* Phúc */}
              <Card className="border-blue-200 hover:shadow-xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl font-bold text-blue-800 mb-4">Phúc</div>
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-semibold text-blue-800">Phúc</span>: mang nghĩa Tơ lớn, Tráng lệ.
                    Hướng tới sự thành công vượt bậc, thể hiện ý chí, khát vọng thúc hiện những mục tiêu lớn,
                    đem lại giá trị lớn cho cộng đồng, cho xã hội.
                  </p>
                </CardContent>
              </Card>

              {/* Tài */}
              <Card className="border-blue-200 hover:shadow-xl transition-all">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl font-bold text-blue-800 mb-4">Tài</div>
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-semibold text-blue-800">Tâm Phúc Tài</span> với hàm nghĩa
                    càng phát triển, càng tơ lớn lại càng phải "CHÍNH TRỰC". Luôn là biểu tượng của sự
                    phát triển dựa trên những giá trị đạo đức tốt đẹp nhất.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Philosophy Text */}
            <div>
              <h2 className="text-4xl font-bold text-blue-800 mb-8">TRIẾT LÝ</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Hội nhập và phát triển góp phần vào sự thịnh vượng của đất nước. Nguồn nhân lực
                  chính là nhân tố then chốt, là tài sản lớn nhất của Công ty Tâm Phúc Tài, chủ trọng
                  tạo ra môi trường làm việc hiện đại, năng động, thân thiện và trao cơ hội phát triển
                  nghề nghiệp cho tất cả thành viên. Sự hài lòng của khách hàng là minh chứng cho
                  chất lượng dịch vụ của Tâm Phúc Tài.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Không ngừng hoàn thiện và phát triển năng lực kinh doanh, Tâm Phúc Tài thấu hiểu
                  nhu cầu khách hàng, mang đến sản phẩm dịch vụ hoàn hảo, đáp ứng tối đa mong đợi
                  của khách hàng.
                </p>
              </div>
            </div>

            {/* Right: Philosophy Image */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop"
                alt="Philosophy"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Vision and Mission */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Vision */}
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"
                    alt="Vision"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <h2 className="text-3xl font-bold text-blue-800 mb-4">
                  TẦM NHÌN VÀ SỨ MỆNH
                </h2>
                <div className="bg-blue-100 p-4 rounded-lg mb-4">
                  <p className="text-orange-700 font-semibold">
                    BÁO ĐÁP TỔ QUỐC VÌ MỘT VIỆT NAM HÙNG CƯỜNG.
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Trở thành Tập Đoàn uy tín và chất lượng hàng đầu Việt Nam với cam kết:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-800 mt-1 flex-shrink-0" size={20} />
                    <span>Tạo môi trường làm việc năng động, thân thiện.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-800 mt-1 flex-shrink-0" size={20} />
                    <span>Phát triển từ lòng tin của khách hàng.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-800 mt-1 flex-shrink-0" size={20} />
                    <span>Trở thành tập đoàn dẫn đầu chuyên nghiệp.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-4">
                  <span className="text-blue-800 font-semibold">TPT</span> luôn phấn đấu làm việc
                  hiệu quả nhất, để luôn công hiến, đóng góp hết sức mình vì một Việt Nam hùng cường.
                </p>
              </div>

              {/* Core Values */}
              <div>
                <h2 className="text-3xl font-bold text-blue-800 mb-6">
                  CAM KẾT DỊCH VỤ
                </h2>
                <div className="space-y-6">
                  <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        🎯 Chất lượng là ưu tiên hàng đầu
                      </h3>
                      <p className="text-gray-600">
                        Cam kết mang đến dịch vụ vận chuyển chất lượng cao với đội ngũ lái xe
                        chuyên nghiệp, xe hiện đại và an toàn.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        🤝 Khách hàng là trung tâm
                      </h3>
                      <p className="text-gray-600">
                        Luôn lắng nghe và đáp ứng nhu cầu của khách hàng, mang đến trải nghiệm
                        di chuyển thoải mái và tiện lợi nhất.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        💡 Đổi mới và phát triển
                      </h3>
                      <p className="text-gray-600">
                        Không ngừng cải tiến công nghệ, nâng cấp dịch vụ để đáp ứng xu hướng
                        hiện đại và mong đợi của khách hàng.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        🌟 Trách nhiệm xã hội
                      </h3>
                      <p className="text-gray-600">
                        Đóng góp vào sự phát triển bền vững của cộng đồng và xã hội, bảo vệ
                        môi trường thông qua các hoạt động kinh doanh có trách nhiệm.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            THÀNH TỰU NỔI BẬT
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-800 mb-2">24+</div>
                <p className="text-gray-600">Năm kinh nghiệm</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-800 mb-2">1000+</div>
                <p className="text-gray-600">Xe khách hiện đại</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-800 mb-2">100+</div>
                <p className="text-gray-600">Tuyến đường</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-800 mb-2">10M+</div>
                <p className="text-gray-600">Khách hàng tin dùng</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">
              Hãy để TPT đồng hành cùng bạn trên mọi hành trình
            </h2>
            <p className="text-xl mb-6">
              Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-blue-800 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Liên hệ ngay
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default About
