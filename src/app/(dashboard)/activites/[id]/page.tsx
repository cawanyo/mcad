"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import PresenceList from "@/components/presences/PresenceList"
import ServiceList from "@/components/services/ServiceList"
import BilanForm from "@/components/bilans/BilanForm"
import { formatDate, getNiveauColor, getNiveauLabel } from "@/lib/utils"
import { Clock, Calendar, Check, Users, Briefcase, ClipboardList, FileText } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import EventDetailPDF from "@/components/pdf/EventDetailPDF"

export default function ActiviteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [tab, setTab] = useState("details")
  const [bilanOpen, setBilanOpen] = useState(false)

  const { data: activite, isLoading } = useQuery({
    queryKey: ["activite", id],
    queryFn: () => fetch(`/api/activites/${id}`).then((r) => r.json()).then((r) => r.data),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 15_000
      const tabsNeedingFast = ["presences", "taches"]
      return tabsNeedingFast.includes("presences") ? 15_000 : 30_000
    },
  })

  const canManage = session?.user.role !== "MEMBRE"

  const toggleTache = async (tacheId: string, isRealisee: boolean) => {
    if (isRealisee) {
      await fetch(`/api/taches/${tacheId}/realiser`, { method: "DELETE" })
    } else {
      await fetch(`/api/taches/${tacheId}/realiser`, { method: "POST" })
    }
    qc.invalidateQueries({ queryKey: ["activite", id] })
  }

  const assignService = async (serviceId: string, userId: string | null) => {
    await fetch(`/api/services/${serviceId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) })
    qc.invalidateQueries({ queryKey: ["activite", id] })
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm("Supprimer ce service ?")) return
    await fetch(`/api/services/${serviceId}`, { method: "DELETE" })
    qc.invalidateQueries({ queryKey: ["activite", id] })
  }

  const submitBilan = async (data: any) => {
    await fetch("/api/bilans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    qc.invalidateQueries({ queryKey: ["activite", id] })
    setBilanOpen(false)
  }

  if (isLoading) return <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  if (!activite) return <div className="p-4 text-center text-gray-500">Activité non trouvée</div>

  const tabs = [
    { key: "details", label: "Détails", icon: Calendar },
    { key: "services", label: "Services", icon: Briefcase },
    { key: "presences", label: "Présences", icon: Users },
    { key: "taches", label: "Tâches", icon: ClipboardList },
    { key: "bilans", label: "Bilans", icon: FileText },
  ]

  return (
    <div>
      <Header title={activite.nom} back />
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={getNiveauColor(activite.niveauImportance)}>{getNiveauLabel(activite.niveauImportance)}</Badge>
          {activite.ministere && <Badge variant="info">{activite.ministere.nom}</Badge>}
          {activite.pole && <Badge variant="info">{activite.pole.nom}</Badge>}
        </div>
        <div className="flex gap-4 text-sm text-gray-500 mt-2">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(activite.date)}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{activite.heureDebut} – {activite.heureFin}</span>
        </div>
      </div>
      <div className="flex gap-0.5 px-4 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === key ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"}`}
          >
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tab === "details" && (
          <div className="space-y-4">
            {activite.description && <Card><p className="text-gray-700 text-sm">{activite.description}</p></Card>}
            <PDFDownloadLink document={<EventDetailPDF activite={activite} />} fileName={`${activite.nom}.pdf`}>
              {({ loading }) => (
                <Button variant="secondary" className="w-full" disabled={loading}>
                  {loading ? "Préparation..." : "Télécharger PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        )}
        {tab === "services" && (
          <ServiceList
            services={activite.services}
            canEdit={canManage}
            onAssign={assignService}
            onDelete={deleteService}
          />
        )}
        {tab === "presences" && (
          <PresenceList
            presences={activite.presences}
            activiteId={id}
            currentUserId={session?.user.id ?? ""}
            canEdit={canManage}
            onUpdate={() => qc.invalidateQueries({ queryKey: ["activite", id] })}
          />
        )}
        {tab === "taches" && (
          <div className="space-y-2">
            {activite.taches?.map((t: any) => {
              const realise = t.tachesRealisees?.some((r: any) => r.userId === session?.user.id)
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTache(t.id, realise)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${realise ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${realise ? "bg-green-500" : "border-2 border-gray-300"}`}>
                    {realise && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm ${realise ? "line-through text-gray-400" : "text-gray-700"}`}>{t.nom}</span>
                </button>
              )
            })}
            {(!activite.taches || activite.taches.length === 0) && <p className="text-sm text-gray-400 text-center py-4">Aucune tâche</p>}
          </div>
        )}
        {tab === "bilans" && (
          <div className="space-y-4">
            {activite.bilans?.map((b: any) => (
              <Card key={b.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{b.pole.nom}</p>
                  {b.note !== null && <Badge variant="info">{b.note}/10</Badge>}
                </div>
                {b.commentaire && <p className="text-sm text-gray-600 mb-2">{b.commentaire}</p>}
                <div className="space-y-1">
                  {b.checklist?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${item.valide ? "bg-green-500" : "bg-gray-200"}`}>
                        {item.valide && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      {item.label}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            {canManage && (
              <Button variant="secondary" className="w-full" onClick={() => setBilanOpen(true)}>
                <FileText className="h-4 w-4" />Saisir un bilan
              </Button>
            )}
          </div>
        )}
      </div>
      <Modal open={bilanOpen} onClose={() => setBilanOpen(false)} title="Bilan d'activité" size="lg">
        <BilanForm activiteId={id} poleId="" onSubmit={submitBilan} onCancel={() => setBilanOpen(false)} />
      </Modal>
    </div>
  )
}
