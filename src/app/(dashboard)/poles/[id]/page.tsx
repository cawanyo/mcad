"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import MembreCard from "@/components/membres/MembreCard"
import { Users, Trash2, UserPlus, ShieldCheck, ShieldAlert, Target, CalendarDays, Info, ChevronRight } from "lucide-react"
import { AddPoleMemberModal } from "@/components/poles/AddMembre"

export default function PoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: pole, isLoading } = useQuery({
    queryKey: ["pole", id],
    queryFn: () => fetch(`/api/poles/${id}`).then((r) => r.json()).then((r) => r.data),
  })

  const isPoleResponsable = (userId: string) => {
    return pole?.responsables?.some((r: any) => r.userId === userId)
  }

  const canManage = session?.user.role !== "MEMBRE"

  const handleToggleResponsable = async (userId: string, isResponsable: boolean) => {
    const res = await fetch(`/api/poles/${id}/responsables`, {
      method: "POST",
      body: JSON.stringify({ userId, action: isResponsable ? "DEMOTE" : "PROMOTE" })
    })
    if (res.ok) qc.invalidateQueries({ queryKey: ["pole", id] })
  }

  const removeMembre = async (userId: string) => {
    if (!confirm("Retirer ce membre du pôle ?")) return
    await fetch(`/api/poles/${id}/membres`, { 
      method: "DELETE", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ userId }) 
    })
    qc.invalidateQueries({ queryKey: ["pole", id] })
  }

  if (isLoading) return <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
  if (!pole) return <div className="p-10 text-center text-slate-500 font-medium">Pôle non trouvé</div>

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header title={pole.nom} back />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Banner / Description */}
        <section className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Description du pôle</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {pole.description || "Aucune description fournie pour ce pôle opérationnel."}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex items-center gap-4 p-5 border-none shadow-sm transition-transform hover:scale-[1.02]">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{pole._count.membres}</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Équipiers</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5 border-none shadow-sm transition-transform hover:scale-[1.02]">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{pole._count.activites}</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Activités</p>
            </div>
          </Card>
        </div>

        {/* Team Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800">Équipiers du Pôle</h3>
              <p className="text-xs text-slate-400">Gérez les membres et les responsabilités</p>
            </div>
            {canManage && (
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full bg-blue-600 shadow-lg shadow-blue-100 hover:bg-blue-700 h-10 px-6">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
          {
            pole.membres?.map((m: any) => {
              const isResp = isPoleResponsable(m.userId);
              return (
                <div key={m.user.id} className="group relative">

                    <MembreCard 
                      user={m.user} 
                      isResponsable={isResp}
                      onClick={() => router.push(`/membres/${m.user.id}`)} 
                    />

                    {canManage && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-xl border shadow-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleResponsable(m.userId, isResp); }}
                          className={`p-2 rounded-lg transition-colors ${isResp ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
                          title={isResp ? "Retirer des responsables" : "Nommer Chef de Pôle"}
                        >
                          {isResp ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeMembre(m.user.id); }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                </div>
              )
            })

          }
            
            {pole.membres?.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Users className="h-10 w-10 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Aucun membre n'a encore rejoint ce pôle</p>
              </div>
            )}
          </div>
        </section>

        {/* Lien vers le ministère parent */}
        <section className="pt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-between h-14 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 px-6"
            onClick={() => router.push(`/ministeres/${pole.ministereId}`)}
          >
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-bold">Voir le ministère parent</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Button>
        </section>

        <AddPoleMemberModal
          poleId={id} 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </div>
    </div>
  )
}
