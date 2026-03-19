import { User } from "@prisma/client"
import { Mail, Phone, ShieldCheck } from "lucide-react"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { getRoleLabel } from "@/lib/utils"
import { is } from "date-fns/locale"

interface MembreCardProps {
  user: User
  onClick?: () => void
  isResponsable?: boolean
}

export default function MembreCard({ user, onClick, isResponsable }: MembreCardProps) {
  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  
  return (
    <div 
      onClick={onClick} 
      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 bg-white shadow-sm
        ${isResponsable ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 hover:border-blue-200 hover:shadow-md'}`}
    >
      {/* Avatar avec effet d'ombre */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-inner
          ${isResponsable ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {user.image ? (
            <img src={user.image} alt="" className="w-12 h-12 rounded-2xl object-cover" />
          ) : initials}
        </div>
        {isResponsable && (
          <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full border-2 border-white">
            <ShieldCheck className="h-3 w-3" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-bold truncate ${isResponsable ? 'text-blue-900' : 'text-slate-700'}`}>
            {user.prenom} {user.nom}
          </p>
          {isResponsable && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full tracking-tighter">
              Responsable
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 mt-1 overflow-hidden">
          {user.email && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" /> {user.email}
            </span>
          )}
          {user.telephone && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
              <Phone className="h-3 w-3" /> {user.telephone}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}