import { Card } from "@/components/ui/card"

interface PromotionCardProps {
  id: number
  image: string
}

export const PromotionCard = ({ id, image }: PromotionCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      <img 
        src={image} 
        alt={`Promotion ${id}`}
        className="w-full h-48 object-cover"
      />
    </Card>
  )
}
