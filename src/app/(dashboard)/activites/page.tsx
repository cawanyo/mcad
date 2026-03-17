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
import { Plus, Calendar } from "lucide-react"

export default function ActivitesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("GLOBALE")
  const canCreate = session?.user.role !== "MEMBRE"

  const { data: activites, isLoading } = useQuery({
    queryKey: ["activites", filter],
    queryFn: () => fetch(`/api/activites?type=${filter}`).then((r) => r.json()).then((r) => r.data),
    refetchInterval: 30_000,
  })

  const { data: ministeres } = useQuery({
    queryKey: ["ministeres"],
    queryFn: () => fetch("/api/ministeres").then((r) => r.json()).then((r) => r.data),
    refetchInterval: 120_000,
  })

  const { data: poles } = useQuery({
    queryKey: ["poles"],
    queryFn: () => fetch("/api/poles").then((r) => r.json()).then((r) => r.data),
    refetchInterval: 120_000,
  })

  const handleCreate = async (data: any) => {
    await fetch("/api/activites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    qc.invalidateQueries({ queryKey: ["activites"] })
    setOpen(false)
  }

  const filters = [
    { value: "GLOBALE", label: "Globales" },
    { value: "MINISTERE", label: "Ministères" },
    { value: "POLE", label: "Pôles" },
  ]

  return (
    <div>
      <Header
        title="Activités"
        actions={canCreate ? <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nouvelle</Button> : undefined}
      />
      <div className="p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.value ? "bg-primary-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {isLoading && <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>}
        {!isLoading && activites?.length === 0 && (
          <EmptyState icon={Calendar} title="Aucune activité" description="Planifiez la première activité." action={canCreate ? <Button onClick={() => setOpen(true)}>Créer une activité</Button> : undefined} />
        )}
        <div className="space-y-3">
          {activites?.map((a: any) => (
            <ActivityCard key={a.id} activite={a} onClick={() => router.push(`/activites/${a.id}`)} />
          ))}
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle activité" size="lg">
        <ActivityForm ministeres={ministeres ?? []} poles={poles ?? []} onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
