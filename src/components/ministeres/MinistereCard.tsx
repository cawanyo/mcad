import { Ministere } from "@prisma/client"
import { Users, Layers } from "lucide-react"
import Card from "@/components/ui/Card"

interface MinistereCardProps {
  ministere: Ministere & { _count: { membres: number; poles: number; activites: number } }
  onClick?: () => void
}

export default function MinistereCard({ ministere, onClick }: MinistereCardProps) {
  return (
    <Card onClick={onClick} className="hover:border-primary-200 transition-colors">
      <h3 className="font-semibold text-gray-900 mb-1">{ministere.nom}</h3>
      {ministere.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ministere.description}</p>}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {ministere._count.membres} membre{ministere._count.membres !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          {ministere._count.poles} pôle{ministere._count.poles !== 1 ? "s" : ""}
        </span>
      </div>
    </Card>
  )
}
