import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="text-center hover:shadow-xl transition-shadow border-t-4 border-orange-500">
      <CardContent className="p-8">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-full">
            <Icon className="h-12 w-12 text-orange-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
