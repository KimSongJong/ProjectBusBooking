import { Card, CardContent } from "@/components/ui/card"

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
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <img 
        src={image} 
        alt={from} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Tuyến xe từ <span className="text-orange-600">{from}</span>
        </h3>
        <div className="space-y-3">
          {routes.map((route, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-semibold text-gray-800">{route.to}</div>
                <div className="text-sm text-gray-500">{route.distance} - {route.duration}</div>
              </div>
              <div className="text-orange-600 font-bold">{route.price}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
