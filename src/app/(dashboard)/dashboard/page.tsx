import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { formatDate, getStatutPresenceColor, getStatutPresenceLabel } from "@/lib/utils"
import { Calendar, Clock, Users, Church, Layers, Activity } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const userId = session.user.id
  const role = session.user.role
  const now = new Date()

  const [prochesActivites, mesServices, mesPresences, stats] = await Promise.all([
    prisma.activite.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: { ministere: true, pole: true },
    }),
    prisma.service.findMany({
      where: { userId, activite: { date: { gte: now } } },
      orderBy: { activite: { date: "asc" } },
      take: 5,
      include: { activite: true, pole: true },
    }),
    prisma.presence.findMany({
      where: { userId },
      orderBy: { activite: { date: "desc" } },
      take: 5,
      include: { activite: true },
    }),
    role === "ADMIN"
      ? prisma.$transaction([
          prisma.user.count(),
          prisma.ministere.count(),
          prisma.pole.count(),
          prisma.activite.count(),
        ])
      : Promise.resolve(null),
  ])

  return (
    <div>
      <Header title="Tableau de bord" />
      <div className="p-4 space-y-6">
        <div>
          <p className="text-gray-500 text-sm">Bonjour,</p>
          <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
          <Badge variant="info" className="mt-1">{role === "ADMIN" ? "Administrateur" : role === "RESPONSABLE_MINISTERE" ? "Resp. ministère" : role === "RESPONSABLE_POLE" ? "Resp. pôle" : "Membre"}</Badge>
        </div>

        {stats && Array.isArray(stats) && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Membres", value: stats[0], icon: Users, color: "text-blue-600 bg-blue-50" },
              { label: "Ministères", value: stats[1], icon: Church, color: "text-purple-600 bg-purple-50" },
              { label: "Pôles", value: stats[2], icon: Layers, color: "text-green-600 bg-green-50" },
              { label: "Activités", value: stats[3], icon: Activity, color: "text-orange-600 bg-orange-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value as number}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Prochaines activités</h3>
            <Link href="/activites" className="text-sm text-primary-600 font-medium">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {prochesActivites.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucune activité à venir</p>}
            {prochesActivites.map((a) => (
              <Link key={a.id} href={`/activites/${a.id}`}>
                <Card className="hover:border-primary-200 transition-colors mb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-700">{new Date(a.date).getDate()}</span>
                      <span className="text-[10px] text-primary-500">{new Date(a.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{a.nom}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {a.heureDebut} – {a.heureFin}
                        {(a.ministere || a.pole) && ` · ${a.pole?.nom ?? a.ministere?.nom}`}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {mesServices.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Mes prochains services</h3>
            <div className="space-y-2">
              {mesServices.map((s) => (
                <Card key={s.id}>
                  <p className="font-medium text-gray-900">{s.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.activite.nom} · {formatDate(s.activite.date)}</p>
                  <Badge variant="info" className="mt-1">{s.pole.nom}</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
