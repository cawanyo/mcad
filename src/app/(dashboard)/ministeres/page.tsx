"use client"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import Header from "@/components/layout/Header"
import MinistereCard from "@/components/ministeres/MinistereCard"
import MinistereForm from "@/components/ministeres/MinistereForm"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { Plus, Church, Sparkles, LayoutGrid, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Input  from "@/components/ui/Input"

export default function MinisteresPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const canCreate = session?.user.role === "ADMIN" || session?.user.role === "RESPONSABLE_MINISTERE"

  const { data, isLoading } = useQuery({
    queryKey: ["ministeres"],
    queryFn: () => fetch("/api/ministeres").then((r) => r.json()).then((r) => r.data),
    refetchInterval: 120_000,
  })

  const filteredData = data?.filter((m: any) => 
    m.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (formData: { nom: string; description?: string }) => {
    await fetch("/api/ministeres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    qc.invalidateQueries({ queryKey: ["ministeres"] })
    setOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header
        title="Ministères"
        actions={
          canCreate ? (
            <Button 
              size="sm" 
              onClick={() => setOpen(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100"
            >
              <Plus className="h-4 w-4 mr-1" /> Nouveau
            </Button>
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Barre de recherche et filtres */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Rechercher un ministère..." 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-base focus:ring-4 focus:ring-blue-50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* État de chargement */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Aucun résultat (Empty State) */}
        {!isLoading && filteredData?.length === 0 && (
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
             <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Church className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Aucun ministère trouvé</h3>
             <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
               {searchTerm ? "Aucun ministère ne correspond à votre recherche." : "Commencez par créer le premier ministère de votre communauté."}
             </p>
             {canCreate && !searchTerm && (
               <Button onClick={() => setOpen(true)} className="rounded-full">
                 <Plus className="h-4 w-4 mr-2" /> Créer un ministère
               </Button>
             )}
          </div>
        )}

        {/* Grille des Ministères */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredData?.map((m: any) => (
            <MinistereCard 
              key={m.id} 
              ministere={m} 
              onClick={() => router.push(`/ministeres/${m.id}`)} 
            />
          ))}
        </div>
      </div>

      {/* Modal de création */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau ministère">
        <div className="p-1">
          <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Définissez un nouveau pôle d'activité pour votre église.
          </p>
          <MinistereForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
        </div>
      </Modal>
    </div>
  )
}