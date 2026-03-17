"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import MembreCard from "@/components/membres/MembreCard"
import { Users, Plus, Trash2 } from "lucide-react"

export default function PoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()

  const { data: pole, isLoading } = useQuery({
    queryKey: ["pole", id],
    queryFn: () => fetch(`/api/poles/${id}`).then((r) => r.json()).then((r) => r.data),
  })

  const canManage = session?.user.role !== "MEMBRE"

  const removeMembre = async (userId: string) => {
    if (!confirm("Retirer ce membre ?")) return
    await fetch(`/api/poles/${id}/membres`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) })
    qc.invalidateQueries({ queryKey: ["pole", id] })
  }

  if (isLoading) return <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  if (!pole) return <div className="p-4 text-center text-gray-500">Pôle non trouvé</div>

  return (
    <div>
      <Header title={pole.nom} back />
      <div className="p-4 space-y-5">
        {pole.description && <p className="text-gray-600 text-sm">{pole.description}</p>}
        <div className="flex gap-3">
          <Card className="flex-1 text-center py-3">
            <p className="text-2xl font-bold text-primary-600">{pole._count.membres}</p>
            <p className="text-xs text-gray-500">Membres</p>
          </Card>
          <Card className="flex-1 text-center py-3">
            <p className="text-2xl font-bold text-primary-600">{pole._count.activites}</p>
            <p className="text-xs text-gray-500">Activités</p>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Users className="h-4 w-4" />Membres</h3>
          <div className="space-y-2">
            {pole.membres?.map((m: any) => (
              <div key={m.user.id} className="flex items-center gap-2">
                <div className="flex-1"><MembreCard user={m.user} onClick={() => router.push(`/membres/${m.user.id}`)} /></div>
                {canManage && (
                  <button onClick={() => removeMembre(m.user.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {pole.membres?.length === 0 && <p className="text-sm text-gray-400 text-center py-3">Aucun membre</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
