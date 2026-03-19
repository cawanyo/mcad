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
export default function ActivityCard({ activite, onClick }: { activite: any, onClick: () => void }) {
  const dateObj = new Date(activite.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all cursor-pointer overflow-hidden flex"
    >
      {/* Date "Ticket" Side */}
      <div className="w-20 bg-slate-50 border-r border-slate-50 flex flex-col items-center justify-center p-2 group-hover:bg-blue-600 transition-colors">
        <span className="text-2xl font-black text-slate-800 group-hover:text-white leading-none">{day}</span>
        <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-100 mt-1">{month}</span>
      </div>

      {/* Content Side */}
      <div className="flex-1 p-5 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors line-clamp-1">
            {activite.nom}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <Clock className="h-3 w-3" /> {activite.heureDebut} - {activite.heureFin}
          </div>
          {activite.lieu && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              <MapPin className="h-3 w-3" /> {activite.lieu}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-tighter">
            {activite.pole?.nom || activite.ministere?.nom || "Communauté"}
          </span>
          <div className="flex -space-x-2">
            {/* Si vous avez les avatars des responsables, affichez-les ici */}
            <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold">
              +{activite._count?.services || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}