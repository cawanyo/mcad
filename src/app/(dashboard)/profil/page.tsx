"use client"
import { useSession, signOut } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import { getRoleLabel, formatDate, getStatutPresenceColor, getStatutPresenceLabel } from "@/lib/utils"
import { LogOut, Plus, Trash2, Calendar, Briefcase } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { indisponibiliteSchema, IndisponibiliteInput } from "@/schemas"

export default function ProfilPage() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [indispoOpen, setIndispoOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: user } = useQuery({
    queryKey: ["profil", session?.user.id],
    queryFn: () => fetch(`/api/utilisateurs/${session?.user.id}`).then((r) => r.json()).then((r) => r.data),
    enabled: !!session?.user.id,
  })

  const { data: indispos, refetch: refetchIndispos } = useQuery({
    queryKey: ["indisponibilites"],
    queryFn: () => fetch("/api/indisponibilites").then((r) => r.json()).then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IndisponibiliteInput>({
    resolver: zodResolver(indisponibiliteSchema),
  })

  const addIndispo = async (data: IndisponibiliteInput) => {
    setLoading(true)
    await fetch("/api/indisponibilites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    setLoading(false)
    refetchIndispos()
    reset()
    setIndispoOpen(false)
  }

  const deleteIndispo = async (id: string) => {
    await fetch(`/api/indisponibilites/${id}`, { method: "DELETE" })
    refetchIndispos()
  }

  if (!session || !user) return null
  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()

  const presentCount = user.presences?.filter((p: any) => p.statut === "PRESENT").length ?? 0
  const totalCount = user.presences?.length ?? 0

  return (
    <div>
      <Header title="Mon profil" />
      <div className="p-4 space-y-5">
        <Card className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl mx-auto mb-3">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.prenom} {user.nom}</h2>
          <Badge variant="info" className="mt-1">{getRoleLabel(user.role)}</Badge>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          {user.telephone && <p className="text-sm text-gray-500">{user.telephone}</p>}
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-3">
            <p className="text-2xl font-bold text-primary-600">{user.ministresMembres?.length ?? 0}</p>
            <p className="text-xs text-gray-500">Ministères</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-bold text-primary-600">{user.services?.length ?? 0}</p>
            <p className="text-xs text-gray-500">Services</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-2xl font-bold text-primary-600">{totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%</p>
            <p className="text-xs text-gray-500">Présence</p>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Calendar className="h-4 w-4" />Indisponibilités</h3>
            <Button size="sm" onClick={() => setIndispoOpen(true)}><Plus className="h-4 w-4" />Ajouter</Button>
          </div>
          <div className="space-y-2">
            {indispos?.map((i: any) => (
              <Card key={i.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(i.dateDebut)} – {formatDate(i.dateFin)}</p>
                  {i.raison && <p className="text-xs text-gray-500">{i.raison}</p>}
                </div>
                <button onClick={() => deleteIndispo(i.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
            {indispos?.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Aucune indisponibilité</p>}
          </div>
        </div>

        {user.presences?.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Briefcase className="h-4 w-4" />Historique présences</h3>
            <div className="space-y-2">
              {user.presences.slice(0, 5).map((p: any) => (
                <Card key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.activite.nom}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.activite.date)}</p>
                  </div>
                  <Badge className={getStatutPresenceColor(p.statut)}>{getStatutPresenceLabel(p.statut)}</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Button variant="danger" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />Se déconnecter
        </Button>
      </div>

      <Modal open={indispoOpen} onClose={() => setIndispoOpen(false)} title="Ajouter une indisponibilité">
        <form onSubmit={handleSubmit(addIndispo)} className="space-y-4">
          <Input label="Date de début" type="date" error={errors.dateDebut?.message} {...register("dateDebut")} />
          <Input label="Date de fin" type="date" error={errors.dateFin?.message} {...register("dateFin")} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raison (optionnelle)</label>
            <input {...register("raison")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex: Voyage, maladie..." />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setIndispoOpen(false)} className="flex-1">Annuler</Button>
            <Button type="submit" loading={loading} className="flex-1">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
