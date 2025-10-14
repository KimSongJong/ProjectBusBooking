import Header from "@/components/header"
import Footer from "@/components/footer"

function Invoice() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
              Hóa Đơn
            </h1>
            <p className="text-center text-gray-600">
              Trang hóa đơn đang được phát triển...
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Invoice
