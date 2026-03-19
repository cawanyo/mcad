"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search, Check, UserPlus, ArrowLeft, Loader2, Save } from "lucide-react"
import Header from "@/components/layout/Header"
import Button from "@/components/ui/Button"
import  Input  from "@/components/ui/Input"

export default function AssignmentPage() {
  const { id: activiteId, serviceId } = useParams()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [members, setMembers] = useState<any[]>([]) 
  const [selectedIds, setSelectedIds] = useState<string[]>([]) 
  const [initalSelectedIds, setInitialSelectedIds] = useState<string[]>([]) 
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/services/${serviceId}/assignment-data`)
      const json = await res.json()
    
      setMembers(json.poleMembers)
      // On pré-coche ceux qui sont déjà assignés (si vous gérez le multi-assignement)
      setSelectedIds(json.currentlyAssignedIds || [])
      setInitialSelectedIds(json.currentlyAssignedIds || [])

      setLoading(false)
    }
    fetchData()
  }, [serviceId])

  const toggleMember = (userId: string) => {
    setSelectedIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }
 
 
  

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/services/${serviceId}/assignment-data`, {
      method: "POST",
      body: JSON.stringify({ userIds: selectedIds })
    })
    setLoading(false)
  }

   const filteredMembers = members.filter((m:any) => `${m.prenom} ${m.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))


    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Affectation des membres" back />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Barre de recherche fixe en haut */}
        <div className="sticky top-16 z-10 bg-slate-50 pt-2 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input 
              placeholder="Rechercher un membre..." 
              className="pl-12 h-14 rounded-2xl border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">
            Membres du pôle ({filteredMembers.length})
          </p>
          
          {filteredMembers.map((member) => {
            const isSelected = selectedIds.includes(member.id)
            return (
              <div 
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                  ${isSelected ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100" : "bg-white border-slate-100"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold
                    ${isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {member.prenom[0]}{member.nom[0]}
                  </div>
                  <p className={`font-bold ${isSelected ? "text-white" : "text-slate-700"}`}>
                    {member.prenom} {member.nom}
                  </p>
                </div>
                
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected ? "bg-white border-white text-blue-600" : "border-slate-200"}`}>
                  {isSelected && <Check className="h-4 w-4" strokeWidth={4} />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bouton de validation flottant en bas */}
        <div className="fixed bottom-20 left-0 w-full px-6 max-w-2xl mx-auto">
          <Button 
            onClick={handleSave}
            disabled ={selectedIds.length === 0 || (selectedIds.length === initalSelectedIds.length && selectedIds.every(id => initalSelectedIds.includes(id)))}
            className="w-full h-14 rounded-2xl shadow-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest"
          >
            <Save className="mr-2 h-5 w-5" />
            Valider l'affectation ({selectedIds.length})
          </Button>
        </div>
      </div>
    </div>
  )
}