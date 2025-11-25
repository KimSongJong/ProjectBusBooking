import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"

interface RouteCardProps {
  from: string
  routes: Array<{
    to: string
    price: string
    distance: string
    duration: string
  }>
  image: string
}

export const RouteCard = ({ from, routes, image }: RouteCardProps) => {
  const navigate = useNavigate()

  const handleRouteClick = (to: string) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Navigate to product page with search parameters
    navigate(`/product?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${today}&passengers=1`)
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <img 
        src={image} 
        alt={from} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Tuyến xe từ <span className="text-orange-500">{from}</span>
        </h3>
        <div className="space-y-3">
          {routes.map((route, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b pb-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
              onClick={() => handleRouteClick(route.to)}
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
                  {route.to}
                </div>
                <div className="text-sm text-gray-500">{route.distance} - {route.duration}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-orange-500 font-bold">{route.price}</div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
