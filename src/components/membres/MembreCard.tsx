import { User } from "@prisma/client"
import { Mail, Phone } from "lucide-react"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { getRoleLabel } from "@/lib/utils"

interface MembreCardProps {
  user: User
  onClick?: () => void
}

export default function MembreCard({ user, onClick }: MembreCardProps) {
  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  return (
    <Card onClick={onClick} className="hover:border-primary-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
          {user.image ? <img src={user.image} alt={initials} className="w-10 h-10 rounded-full object-cover" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900">{user.prenom} {user.nom}</p>
            <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "MEMBRE" ? "default" : "info"}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
          <div className="flex gap-3 mt-0.5">
            {user.email && <span className="text-xs text-gray-500 flex items-center gap-1 truncate"><Mail className="h-3 w-3 flex-shrink-0" />{user.email}</span>}
            {user.telephone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" />{user.telephone}</span>}
          </div>
        </div>
      </div>
    </Card>
  )
}
