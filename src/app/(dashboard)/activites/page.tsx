"use client"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/Header"
import ActivityCard from "@/components/activites/ActivityCard"
import ActivityForm from "@/components/activites/ActivityForm"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { Plus, Calendar, Search, Filter, Sparkles, Loader2 } from "lucide-react"
import Input from "@/components/ui/Input"

export default function ActivitesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("GLOBALE")
  const [searchTerm, setSearchTerm] = useState("")

  const canCreate = session?.user.role !== "MEMBRE"

  // Fetching data
  const { data: activites, isLoading } = useQuery({
    queryKey: ["activites", filter],
    queryFn: () => fetch(`/api/activites?type=${filter}`).then((r) => r.json()).then((r) => r.data),
    refetchInterval: 30_000,
  })

  const { data: ministeres } = useQuery({ queryKey: ["ministeres"], queryFn: () => fetch("/api/ministeres").then((r) => r.json()).then((r) => r.data) })
  const { data: poles } = useQuery({ queryKey: ["poles"], queryFn: () => fetch("/api/poles").then((r) => r.json()).then((r) => r.data) })

  const handleCreate = async (data: any) => {
    const response = await fetch("/api/activites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    qc.invalidateQueries({ queryKey: ["activites"] })
    setOpen(false)
    const { data: activite } = await response.json()
    router.push(`/activites/${activite.id}`) 
  }

  const filteredActivites = activites?.filter((a: any) => 
    a.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [
    { value: "GLOBALE", label: "Événements Globaux", color: "blue" },
    { value: "MINISTERE", label: "Par Ministère", color: "purple" },
    { value: "POLE", label: "Par Pôle", color: "emerald" },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header
        title="Calendrier des Activités"
        actions={canCreate ? (
          <Button 
            size="sm" 
            onClick={() => setOpen(true)} 
            className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 px-5"
          >
            <Plus className="h-4 w-4 mr-1" /> Planifier
          </Button>
        ) : undefined}
      />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Barre de recherche & Filtres */}
        <section className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Rechercher un événement..." 
              className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-base focus:ring-4 focus:ring-blue-50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {categories.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2
                  ${filter === f.value 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                    : "bg-white text-slate-500 border border-slate-100 hover:border-blue-200"}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${filter === f.value ? 'bg-blue-400' : 'bg-slate-300'}`} />
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Liste des activités */}
        <section className="space-y-4">
          {isLoading && (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && filteredActivites?.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-slate-200" />
               </div>
               <h3 className="text-lg font-bold text-slate-800">Aucun projet trouvé</h3>
               <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                 {searchTerm ? "Essayez d'autres mots-clés." : "Il est temps de planifier quelque chose de génial !"}
               </p>
               {canCreate && (
                 <Button onClick={() => setOpen(true)} className="rounded-full px-8">
                   <Plus className="h-4 w-4 mr-2" /> Créer une activité
                 </Button>
               )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivites?.map((a: any) => (
              <ActivityCard 
                key={a.id} 
                activite={a} 
                onClick={() => router.push(`/activites/${a.id}`)} 
              />
            ))}
          </div>
        </section>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Planification d'activité" size="lg">
        <div className="p-1">
          <div className="bg-blue-50 p-4 rounded-2xl mb-6 flex gap-3 items-center">
            <Sparkles className="h-5 w-5 text-blue-500 shrink-0" />
            <p className="text-xs font-medium text-blue-700">
              Remplissez les détails pour informer tous les membres concernés par ce nouvel événement.
            </p>
          </div>
          <ActivityForm 
            ministeres={ministeres ?? []} 
            poles={poles ?? []} 
            onSubmit={handleCreate} 
            onCancel={() => setOpen(false)} 
          />
        </div>
      </Modal>
    </div>
  )
}