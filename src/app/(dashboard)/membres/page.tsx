"use client"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Header from "@/components/layout/Header"
import MembreCard from "@/components/membres/MembreCard"
import EmptyState from "@/components/ui/EmptyState"
import { Users, Search } from "lucide-react"

export default function MembresPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: () => fetch("/api/utilisateurs").then((r) => r.json()).then((r) => r.data),
    refetchInterval: 120_000,
  })

  const filtered = data?.filter((u: any) =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div>
      <Header title="Membres" />
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isLoading && <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>}
        {!isLoading && filtered.length === 0 && <EmptyState icon={Users} title="Aucun membre trouvé" />}
        <div className="space-y-2">
          {filtered.map((u: any) => (
            <MembreCard key={u.id} user={u} onClick={() => router.push(`/membres/${u.id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}
