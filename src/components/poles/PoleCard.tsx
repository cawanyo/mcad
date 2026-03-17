import { Pole, Ministere } from "@prisma/client"
import { Users } from "lucide-react"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"

interface PoleCardProps {
  pole: Pole & { ministere: Ministere; _count: { membres: number } }
  onClick?: () => void
}

export default function PoleCard({ pole, onClick }: PoleCardProps) {
  return (
    <Card onClick={onClick} className="hover:border-primary-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-gray-900">{pole.nom}</h3>
        <Badge variant="info">{pole.ministere.nom}</Badge>
      </div>
      {pole.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pole.description}</p>}
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <Users className="h-3.5 w-3.5" />
        {pole._count.membres} membre{pole._count.membres !== 1 ? "s" : ""}
      </span>
    </Card>
  )
}
