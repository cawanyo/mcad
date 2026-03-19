"use client"
import { useSession, signOut } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input  from "@/components/ui/Input"
import { getRoleLabel, formatDate, getStatutPresenceColor, getStatutPresenceLabel } from "@/lib/utils"
import { 
  LogOut, Plus, Trash2, Calendar, Briefcase, 
  Mail, Phone, ShieldCheck, Clock, User as UserIcon,
  ChevronRight, AlertCircle, Sparkles
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { indisponibiliteSchema, type IndisponibiliteInput } from "@/schemas"

export default function ProfilPage() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [indispoOpen, setIndispoOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ["profil", session?.user.id],
    queryFn: () => fetch(`/api/utilisateurs/${session?.user.id}`).then((r) => r.json()).then((r) => r.data),
    enabled: !!session?.user.id,
  })

  const addIndispo = async (data: IndisponibiliteInput) => {
    setLoading(true)
    await fetch("/api/indisponibilites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    setLoading(false)
    refetchIndispos()
    reset()
    setIndispoOpen(false)
  }

  const deleteIndispo = async (id: string) => {
    await fetch(`/api/indisponibilites/${id}`, { method: "DELETE" })
    refetchIndispos()
  }
  
  const { data: indispos, refetch: refetchIndispos } = useQuery({
    queryKey: ["indisponibilites"],
    queryFn: () => fetch("/api/indisponibilites").then((r) => r.json()).then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IndisponibiliteInput>({
    resolver: zodResolver(indisponibiliteSchema),
  })

  if (isLoading) return <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />)}</div>
  if (!session || !user) return null

  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  const presentCount = user.presences?.filter((p: any) => p.statut === "PRESENT").length ?? 0
  const totalCount = user.presences?.length ?? 0
  const ratioPresence = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header title="Mon Espace" />
      
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Carte de Profil Principal */}
        <section className="relative overflow-hidden bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5" />
          
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-xl shadow-blue-200 ring-4 ring-white">
              {user.image ? <img src={user.image} className="w-24 h-24 rounded-3xl object-cover" /> : initials}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900">{user.prenom} {user.nom}</h2>
            <div className="mt-2 flex justify-center gap-2">
              <Badge className="bg-slate-900 text-white border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                {getRoleLabel(user.role)}
              </Badge>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 text-slate-500">
              <span className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> {user.email}</span>
              {user.telephone && <span className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {user.telephone}</span>}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Ministères", value: user.ministeresMembres?.length ?? 0, color: "text-blue-600" },
            { label: "Services", value: user.services?.length ?? 0, color: "text-purple-600" },
            { label: "Fidélité", value: `${ratioPresence}%`, color: "text-emerald-600" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm flex flex-col items-center py-6 rounded-3xl transition-transform hover:scale-105">
              <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{stat.label}</span>
            </Card>
          ))}
        </div>

        {/* Section Indisponibilités */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Absent prochainement ?
            </h3>
            <Button size="sm" onClick={() => setIndispoOpen(true)} className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 h-9 px-5">
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </div>

          <div className="grid gap-3">
            {indispos?.map((i: any) => (
              <div key={i.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Du {formatDate(i.dateDebut)} au {formatDate(i.dateFin)}</p>
                    {i.raison && <p className="text-[11px] text-slate-400 italic font-medium">"{i.raison}"</p>}
                  </div>
                </div>
                <button 
                  onClick={() => deleteIndispo(i.id)} 
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {indispos?.length === 0 && (
              <div className="py-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
                Aucune absence déclarée
              </div>
            )}
          </div>
        </section>

        {/* Historique de Présence */}
        {user.presences?.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Historique des Présences</h3>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
              {user.presences.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${p.statut === 'PRESENT' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{p.activite.nom}</p>
                      <p className="text-[10px] font-medium text-slate-400">{formatDate(p.activite.date)}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatutPresenceColor(p.statut)} border-none rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-tighter`}>
                    {getStatutPresenceLabel(p.statut)}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bouton Déconnexion */}
        <Button 
          variant="ghost" 
          className="w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-all"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Se déconnecter de la plateforme
        </Button>
      </div>

      {/* Modal Indisponibilité */}
      <Modal open={indispoOpen} onClose={() => setIndispoOpen(false)} title="Signaler une absence">
        <div className="p-1 space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl flex gap-3">
             <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
             <p className="text-xs text-amber-800 leading-relaxed font-medium">
               Signaler votre absence permet aux responsables de mieux organiser les services pour les activités à venir.
             </p>
          </div>
          <form onSubmit={handleSubmit(addIndispo)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date de début" type="date" {...register("dateDebut")} error={errors.dateDebut?.message} className="rounded-2xl border-slate-200 h-12" />
              <Input label="Date de fin" type="date" {...register("dateFin")} error={errors.dateFin?.message} className="rounded-2xl border-slate-200 h-12" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Raison (optionnelle)</label>
              <textarea 
                {...register("raison")} 
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all resize-none"
                placeholder="Ex: Vacances annuelles, raison familiale..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIndispoOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">Annuler</Button>
              <Button type="submit" loading={loading} className="flex-1 h-12 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">Enregistrer</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}