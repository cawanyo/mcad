import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { formatDate } from "@/lib/utils"
import { 
  Calendar, Clock, Users, Church, Layers, 
  Activity, ArrowUpRight, Sparkles, CheckCircle2,
  CalendarDays, LayoutDashboard, Briefcase
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { id: userId, role, name } = session.user
  const now = new Date()

  // On enrichit les requêtes pour avoir un dashboard vraiment informatif
  const [prochesActivites, mesServices, stats, totalSignalements] = await Promise.all([
    // 5 Prochaines activités globales
    prisma.activite.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: { ministere: true, pole: true },
    }),
    prisma.service.findMany({
      where: { 
        // On cherche les services où l'utilisateur est présent dans la table de jointure
        assignations: {
          some: {
            userId: userId
          }
        },
        // On garde le filtre sur les activités futures
        activite: { 
          date: { gte: now } 
        } 
      },
      orderBy: { 
        activite: { date: "asc" } 
      },
      take: 3,
      include: { 
        activite: true, 
        pole: true, 
        ministere: true 
      },
    }),
    // Stats pour Admin ou Responsables
    (role === "ADMIN" || role === "RESPONSABLE_MINISTERE")
      ? prisma.$transaction([
          prisma.user.count(),
          prisma.ministere.count(),
          prisma.pole.count(),
          prisma.activite.count({ where: { date: { gte: now } } }),
        ])
      : Promise.resolve(null),
    // Petit bonus : compter les bilans à faire (si applicable)
    prisma.bilan.count({ where: { userId: userId } }).catch(() => 0)
  ])

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header title="Tableau de bord" />
      
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Section Bienvenue */}
        <section className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="absolute -right-4 -top-4 text-blue-50/50">
            <LayoutDashboard size={140} />
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Espace Personnel</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">
              Ravi de vous voir,<br /> {name?.split(' ')[0]} !
            </h2>
            <div className="mt-4">
              <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {role === "ADMIN" ? "🛡️ Administrateur" : "👤 " + role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </section>

        {/* Stats Admin : Uniquement si autorisé */}
        {stats && (
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Vue d&apos;ensemble Église</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Membres", value: stats[0], icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Ministères", value: stats[1], icon: Church, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Pôles", value: stats[2], icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Activités", value: stats[3], icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="border-none shadow-sm flex flex-col items-center py-6 group transition-all hover:scale-[1.05]">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${bg} ${color} group-hover:rotate-6 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section Activités */}
          <section className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Agenda Global</h3>
              <Link href="/activites" className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                TOUT VOIR <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {prochesActivites.length === 0 && (
                <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                  Aucun événement prévu
                </div>
              )}
              {prochesActivites.map((a) => (
                <Link key={a.id} href={`/activites/${a.id}`}>
                  <div className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                      <span className="text-lg font-black text-slate-800 group-hover:text-white leading-none">{new Date(a.date).getDate()}</span>
                      <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-100 uppercase">{new Date(a.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate group-hover:text-blue-700">{a.nom}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> {a.heureDebut}
                        </span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase">
                          {a.pole?.nom || a.ministere?.nom || "Général"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Section Engagement Personnel (Services) */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Mon Engagement</h3>
            
            {mesServices.length > 0 ? (
              <div className="space-y-3">
                {mesServices.map((s) => (
                  <Link key={s.id} href={`/activites/${s.activite.id}`}>
                    <div className="bg-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-100 relative overflow-hidden group">
                      <Briefcase className="absolute -right-2 -bottom-2 h-20 w-20 text-blue-500 opacity-30 group-hover:scale-110 transition-transform" />
                      <div className="relative z-10">
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Service Assigné</p>
                        <h4 className="text-white font-bold text-lg mb-2 leading-tight">{s.activite.nom}</h4>
                        <div className="flex items-center gap-2">
                          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                             <CheckCircle2 className="h-3 w-3 text-white" />
                             <span className="text-white text-[10px] font-bold">{s.pole?.nom || s.ministere?.nom}</span>
                          </div>
                          <span className="text-blue-100 text-[10px] font-medium italic">
                            {formatDate(s.activite.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <CalendarDays className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">Aucune assignation</p>
                <p className="text-[11px] text-slate-300">Vous n&apos;avez pas de service prévu pour le moment.</p>
              </div>
            )}
            
            {/* Quick Action ou Bilan */}
            {totalSignalements > 0 && (
               <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <ShieldAlert className="h-5 w-5 text-amber-500" />
                   <p className="text-xs font-bold text-amber-900">Vous avez des bilans en attente</p>
                 </div>
                 <Link href="/profil" className="text-[10px] font-black text-amber-600 hover:underline">GÉRER</Link>
               </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

function ShieldAlert(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
}