import { Activite, Ministere, Pole } from "@prisma/client"
import { Calendar, Clock, MapPin } from "lucide-react"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { formatDate, getNiveauColor, getNiveauLabel } from "@/lib/utils"

type ActiviteWithRelations = Activite & { ministere: Ministere | null; pole: Pole | null }

interface ActivityCardProps {
  activite: ActiviteWithRelations
  onClick?: () => void
}

export default function ActivityCard({ activite, onClick }: ActivityCardProps) {
  return (
    <Card onClick={onClick} className="hover:border-primary-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 leading-tight">{activite.nom}</h3>
        <Badge className={getNiveauColor(activite.niveauImportance)}>
          {getNiveauLabel(activite.niveauImportance)}
        </Badge>
      </div>
      {activite.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{activite.description}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(activite.date)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {activite.heureDebut} – {activite.heureFin}
        </span>
        {(activite.ministere || activite.pole) && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {activite.pole?.nom ?? activite.ministere?.nom}
          </span>
        )}
      </div>
    </Card>
  )
}
