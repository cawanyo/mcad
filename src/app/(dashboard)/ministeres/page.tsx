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
import { Plus, Church } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MinisteresPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const canCreate = session?.user.role === "ADMIN" || session?.user.role === "RESPONSABLE_MINISTERE"

  const { data, isLoading } = useQuery({
    queryKey: ["ministeres"],
    queryFn: () => fetch("/api/ministeres").then((r) => r.json()).then((r) => r.data),
    refetchInterval: 120_000,
  })

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
    <div>
      <Header
        title="Ministères"
        actions={canCreate ? <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nouveau</Button> : undefined}
      />
      <div className="p-4">
        {isLoading && <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>}
        {!isLoading && data?.length === 0 && (
          <EmptyState icon={Church} title="Aucun ministère" description="Créez le premier ministère de votre église." action={canCreate ? <Button onClick={() => setOpen(true)}>Créer un ministère</Button> : undefined} />
        )}
        <div className="space-y-3">
          {data?.map((m: any) => (
            <MinistereCard key={m.id} ministere={m} onClick={() => router.push(`/ministeres/${m.id}`)} />
          ))}
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau ministère">
        <MinistereForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
