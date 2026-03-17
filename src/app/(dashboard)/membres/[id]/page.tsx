"use client"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { formatDate, getRoleLabel, getStatutPresenceColor, getStatutPresenceLabel } from "@/lib/utils"
import { Church, Layers, Briefcase, Calendar } from "lucide-react"

export default function MembreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading } = useQuery({
    queryKey: ["utilisateur", id],
    queryFn: () => fetch(`/api/utilisateurs/${id}`).then((r) => r.json()).then((r) => r.data),
  })

  if (isLoading) return <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  if (!user) return <div className="p-4 text-center text-gray-500">Membre non trouvé</div>

  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()

  return (
    <div>
      <Header title="Profil membre" back />
      <div className="p-4 space-y-5">
        <Card className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl mx-auto mb-3">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.prenom} {user.nom}</h2>
          <Badge variant="info" className="mt-1">{getRoleLabel(user.role)}</Badge>
          {user.email && <p className="text-sm text-gray-500 mt-1">{user.email}</p>}
          {user.telephone && <p className="text-sm text-gray-500">{user.telephone}</p>}
        </Card>

        {user.ministresMembres?.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Church className="h-4 w-4" />Ministères</h3>
            <div className="flex flex-wrap gap-2">
              {user.ministresMembres.map((m: any) => <Badge key={m.ministere.id} variant="info">{m.ministere.nom}</Badge>)}
            </div>
          </div>
        )}

        {user.polesMembres?.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Layers className="h-4 w-4" />Pôles</h3>
            <div className="flex flex-wrap gap-2">
              {user.polesMembres.map((p: any) => <Badge key={p.pole.id}>{p.pole.nom}</Badge>)}
            </div>
          </div>
        )}

        {user.services?.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Briefcase className="h-4 w-4" />Derniers services</h3>
            <div className="space-y-2">
              {user.services.map((s: any) => (
                <Card key={s.id} className="py-2">
                  <p className="font-medium text-gray-900 text-sm">{s.nom}</p>
                  <p className="text-xs text-gray-500">{s.activite.nom} · {formatDate(s.activite.date)}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {user.presences?.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Calendar className="h-4 w-4" />Historique présences</h3>
            <div className="space-y-2">
              {user.presences.map((p: any) => (
                <Card key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.activite.nom}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.activite.date)}</p>
                  </div>
                  <Badge className={getStatutPresenceColor(p.statut)}>{getStatutPresenceLabel(p.statut)}</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
