import Header from "@/components/header"
import Footer from "@/components/footer"

function MainPage() {
  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 lg:px-12 py-12 bg-gradient-to-br from-orange-50 to-orange-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Welcome to FUTA Bus Lines
          </h1>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default MainPage
