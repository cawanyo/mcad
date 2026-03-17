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
import { Users, Layers, Plus, Trash2 } from "lucide-react"

export default function MinistereDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const [poleOpen, setPoleOpen] = useState(false)

  const { data: ministere, isLoading } = useQuery({
    queryKey: ["ministere", id],
    queryFn: () => fetch(`/api/ministeres/${id}`).then((r) => r.json()).then((r) => r.data),
  })

  const canManage = session?.user.role === "ADMIN" || session?.user.role === "RESPONSABLE_MINISTERE"

  const createPole = async (data: { nom: string; description?: string; ministereId: string }) => {
    await fetch("/api/poles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    qc.invalidateQueries({ queryKey: ["ministere", id] })
    setPoleOpen(false)
  }

  const removeMembre = async (userId: string) => {
    if (!confirm("Retirer ce membre ?")) return
    await fetch(`/api/ministeres/${id}/membres`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) })
    qc.invalidateQueries({ queryKey: ["ministere", id] })
  }

  if (isLoading) return <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  if (!ministere) return <div className="p-4 text-center text-gray-500">Ministère non trouvé</div>

  return (
    <div>
      <Header title={ministere.nom} back />
      <div className="p-4 space-y-6">
        {ministere.description && <p className="text-gray-600 text-sm">{ministere.description}</p>}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Membres", value: ministere._count.membres },
            { label: "Pôles", value: ministere._count.poles },
            { label: "Activités", value: ministere._count.activites },
          ].map(({ label, value }) => (
            <Card key={label} className="text-center py-3">
              <p className="text-2xl font-bold text-primary-600">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Layers className="h-4 w-4" />Pôles</h3>
            {canManage && <Button size="sm" onClick={() => setPoleOpen(true)}><Plus className="h-4 w-4" />Ajouter</Button>}
          </div>
          <div className="space-y-2">
            {ministere.poles?.map((p: any) => (
              <Card key={p.id} onClick={() => router.push(`/poles/${p.id}`)} className="flex items-center justify-between cursor-pointer hover:border-primary-200">
                <div>
                  <p className="font-medium text-gray-900">{p.nom}</p>
                  <p className="text-xs text-gray-500">{p._count?.membres ?? 0} membres</p>
                </div>
              </Card>
            ))}
            {ministere.poles?.length === 0 && <p className="text-sm text-gray-400 text-center py-3">Aucun pôle</p>}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Users className="h-4 w-4" />Membres ({ministere._count.membres})</h3>
          <div className="space-y-2">
            {ministere.membres?.map((m: any) => (
              <div key={m.user.id} className="flex items-center gap-2">
                <div className="flex-1"><MembreCard user={m.user} onClick={() => router.push(`/membres/${m.user.id}`)} /></div>
                {canManage && (
                  <button onClick={() => removeMembre(m.user.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal open={poleOpen} onClose={() => setPoleOpen(false)} title="Nouveau pôle">
        <PoleForm ministeres={[{ id, nom: ministere.nom }]} defaultValues={{ ministereId: id }} onSubmit={createPole} onCancel={() => setPoleOpen(false)} />
      </Modal>
    </div>
  )
}
