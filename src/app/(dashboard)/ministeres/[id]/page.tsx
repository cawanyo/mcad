"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import PoleForm from "@/components/poles/PoleForm"
import MembreCard from "@/components/membres/MembreCard"
import { Users, Layers, Plus, Trash2, UserPlus, ShieldCheck, ShieldAlert, Info } from "lucide-react"
import { AddMemberModal } from "@/components/ministeres/AddMembre"

export default function MinistereDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const [poleOpen, setPoleOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: ministere, isLoading } = useQuery({
    queryKey: ["ministere", id],
    queryFn: () => fetch(`/api/ministeres/${id}`).then((r) => r.json()).then((r) => r.data),
  })

  const createPole = async (data: { nom: string; description?: string; ministereId: string }) => {
    await fetch("/api/poles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    qc.invalidateQueries({ queryKey: ["ministere", id] })
    setPoleOpen(false)
  }
  
  const isUserResponsable = (userId: string) => ministere?.responsables?.some((r: any) => r.userId === userId);
  const canManage = session?.user.role === "ADMIN" || isUserResponsable(session?.user.id ?? "")

  // Actions API
  const handleToggleResponsable = async (userId: string, isResponsable: boolean) => {
    const res = await fetch(`/api/ministeres/${id}/membres`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: isResponsable ? "DEMOTE" : "PROMOTE" })
    })
    if (res.ok) qc.invalidateQueries({ queryKey: ["ministere", id] })
  }

  const removeMembre = async (userId: string) => {
    if (!confirm("Retirer ce membre du ministère ?")) return
    await fetch(`/api/ministeres/${id}/membres`, { 
      method: "DELETE", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ userId }) 
    })
    qc.invalidateQueries({ queryKey: ["ministere", id] })
  }

  if (isLoading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
  if (!ministere) return <div className="p-10 text-center text-slate-500 font-medium">Ministère non trouvé</div>

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header title={ministere.nom} back />
      
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Section Infos & Stats */}
        <section className="space-y-4">
          {ministere.description && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-blue-900/80 text-sm leading-relaxed">{ministere.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Membres", value: ministere._count.membres, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pôles", value: ministere._count.poles, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Activités", value: ministere._count.activites, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((stat) => (
              <Card key={stat.label} className="border-none shadow-sm flex flex-col items-center justify-center py-5 transition-transform hover:scale-[1.02]">
                <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">{stat.label}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Section Pôles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" /> Pôles opérationnels
            </h3>
            {canManage && (
              <Button  size="sm" onClick={() => setPoleOpen(true)} className="rounded-full border-purple-200 text-purple-700 bg-purple-50">
                <Plus className="h-4 w-4 mr-1" /> Nouveau pôle
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ministere.poles?.map((p: any) => (
              <Card key={p.id} onClick={() => router.push(`/poles/${p.id}`)} className="group cursor-pointer border-slate-100 hover:border-purple-300 hover:shadow-md transition-all p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700 group-hover:text-purple-700 transition-colors">{p.nom}</p>
                  <p className="text-xs text-slate-400">{p._count?.membres ?? 0} personnes actives</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-purple-500" />
                </div>
              </Card>
            ))}
            {ministere.poles?.length === 0 && (
              <div className="col-span-full py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                Aucun pôle configuré pour le moment
              </div>
            )}
          </div>
        </section>

        {/* Section Membres de l'équipe */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Équipe du ministère
            </h3>
            {canManage && (
              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg">
                <UserPlus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {ministere.membres?.map((m: any) => {
              const isResp = isUserResponsable(m.userId);
              return (
                <div key={m.user.id} className="relative group">
                  <MembreCard 
                    user={m.user} 
                    isResponsable={isResp} 
                    onClick={() => router.push(`/membres/${m.user.id}`)} 
                  />
                  
                  {canManage && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleResponsable(m.userId, isResp); }}
                        className={`p-2 rounded-md transition-colors ${isResp ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
                        title={isResp ? "Rétrograder en membre" : "Nommer responsable"}
                      >
                        {isResp ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMembre(m.user.id); }} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Retirer de l'équipe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Modals */}
      <AddMemberModal ministereId={id} isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <Modal open={poleOpen} onClose={() => setPoleOpen(false)} title="Nouveau pôle">
        <PoleForm ministeres={[{ id, nom: ministere.nom }]} defaultValues={{ ministereId: id }} onSubmit={createPole} onCancel={() => setPoleOpen(false)} />
      </Modal>
    </div>
  )
}

// Petit composant utilitaire interne
function ChevronRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
}