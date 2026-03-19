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
import { 
  Clock, Calendar, Check, Users, Briefcase, 
  ClipboardList, FileText, Plus, Download, 
  MapPin, AlertCircle, ChevronRight, Sparkles, 
  Info
} from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import EventDetailPDF from "@/components/pdf/EventDetailPDF"
import { AddServiceForm } from "@/components/activites/AddService"

export default function ActiviteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [tab, setTab] = useState("details")
  const [bilanOpen, setBilanOpen] = useState(false)
  const [showAddService, setShowAddService] = useState(false)

  const { data: activite, isLoading } = useQuery({
    queryKey: ["activite", id],
    queryFn: () => fetch(`/api/activites/${id}`).then((r) => r.json()).then((r) => r.data),
    refetchInterval: 30_000,
  })

  const canManage = session?.user.role !== "MEMBRE"

  if (isLoading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-[2rem] animate-pulse" />)}</div>
  if (!activite) return <div className="p-20 text-center text-slate-400 font-medium">Activité introuvable</div>

  const tabs = [
    { key: "details", label: "Infos", icon: Calendar },
    { key: "services", label: "Besoins", icon: Briefcase },
    { key: "presences", label: "Équipe", icon: Users },
    { key: "taches", label: "Checklist", icon: ClipboardList },
    { key: "bilans", label: "Retours", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <Header title={activite.nom} back />

      {/* Hero Section - Résumé visuel */}
      <div className="bg-white border-b border-slate-100 pb-6 pt-2">
        <div className="px-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${getNiveauColor(activite.niveauImportance)} rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
              {getNiveauLabel(activite.niveauImportance)}
            </Badge>
            {activite.ministere && (
              <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                {activite.ministere.nom}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Date</p>
                <p className="text-sm font-black text-slate-700">{formatDate(activite.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Horaire</p>
                <p className="text-sm font-black text-slate-700">{activite.heureDebut}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'onglets flottante / moderne */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-2 flex flex-wrap gap-0.5 md:gap-1 overflow-x-auto no-scrollbar py-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center flex-wrap gap-1 px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all whitespace-nowrap
              ${tab === key 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                : "text-slate-500 hover:bg-slate-100"}`}
          >
            <Icon className={`h-4 w-4 ${tab === key ? "text-blue-400" : ""}`} />
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Contenu - Détails */}
        {tab === "details" && (
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" /> À propos de l&apos;événement
              </h3>
              <p className="text-slate-600 leading-relaxed italic text-sm">
                {activite.description || "Aucune description détaillée n'a été ajoutée."}
              </p>
              {/* <div className="pt-4 flex gap-3">
                 <PDFDownloadLink document={<EventDetailPDF activite={activite} />} fileName={`${activite.nom}.pdf`} className="flex-1">
                  {({ loading }) => (
                    <Button className="w-full rounded-2xl h-12 border-slate-200 text-slate-600 hover:bg-slate-50" disabled={loading}>
                      <Download className="h-4 w-4 mr-2" />
                      {loading ? "Génération..." : "Rapport PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div> */}
            </section>
          </div>
        )}

        {/* Contenu - Services (Besoins) */}
        {tab === "services" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-md md:text-lg font-black text-slate-800">Ressources requises</h3>
              {canManage && (
                <Button size="sm" onClick={() => setShowAddService(true)} className="rounded-md bg-blue-600 shadow-blue-100 shadow-lg px-3 h-8 ">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              )}
            </div>
            
            <ServiceList
              services={activite.services}
              currentUser={session?.user}
              canEdit={canManage}
              onAssign={async (sId, uId) => {
                await fetch(`/api/services/${sId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: uId }) })
                qc.invalidateQueries({ queryKey: ["activite", id] })
              }}
              onDelete={async (sId) => {
                if(confirm("Supprimer ?")) {
                  await fetch(`/api/services/${sId}`, { method: "DELETE" })
                  qc.invalidateQueries({ queryKey: ["activite", id] })
                }
              }}
            />
          </div>
        )}

        {/* Contenu - Présences */}
        {tab === "presences" && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-2">
            <PresenceList
              presences={activite.presences}
              activiteId={id}
              currentUserId={session?.user.id ?? ""}
              canEdit={canManage}
              onUpdate={() => qc.invalidateQueries({ queryKey: ["activite", id] })}
            />
          </div>
        )}

        {/* Contenu - Tâches */}
        {tab === "taches" && (
          <div className="space-y-4 px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Liste de contrôle</h3>
            {activite.taches?.map((t: any) => {
              const realise = t.tachesRealisees?.some((r: any) => r.userId === session?.user.id)
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    const method = realise ? "DELETE" : "POST"
                    fetch(`/api/taches/${t.id}/realiser`, { method }).then(() => qc.invalidateQueries({ queryKey: ["activite", id] }))
                  }}
                  className={`group w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left shadow-sm
                    ${realise ? "bg-emerald-50 border-emerald-100 opacity-70" : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors
                    ${realise ? "bg-emerald-500" : "border-2 border-slate-200 bg-slate-50 group-hover:border-blue-300"}`}>
                    {realise && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`font-bold ${realise ? "line-through text-emerald-700/50" : "text-slate-700"}`}>
                    {t.nom}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Contenu - Bilans */}
        {tab === "bilans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-slate-800">Évaluations</h3>
              {canManage && (
                <Button size="sm" onClick={() => setBilanOpen(true)} className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 px-6 h-10">
                  <FileText className="h-4 w-4 mr-2" /> Nouveau bilan
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activite.bilans?.map((b: any) => (
                <Card key={b.id} className="border-none shadow-sm p-6 rounded-[2rem] bg-white group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                        {b.pole.nom.charAt(0)}
                      </div>
                      <p className="font-black text-slate-800">{b.pole.nom}</p>
                    </div>
                    {b.note !== null && (
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-black">
                        <Sparkles className="h-3 w-3" /> {b.note}/10
                      </div>
                    )}
                  </div>
                  {b.commentaire && (
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed bg-slate-50 p-4 rounded-2xl italic">
                      &ldquo;{b.commentaire}&rdquo;
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {b.checklist?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <div className={`h-4 w-4 rounded flex items-center justify-center shrink-0 ${item.valide ? "bg-emerald-500" : "bg-slate-200"}`}>
                          {item.valide && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals de gestion */}
      <Modal open={showAddService} onClose={() => setShowAddService(false)} title="Nouveau besoin logistique">
        <AddServiceForm activityId={id} onSuccess={() => { setShowAddService(false); qc.invalidateQueries({ queryKey: ["activite", id] }); }} />
      </Modal>

      <Modal open={bilanOpen} onClose={() => setBilanOpen(false)} title="Évaluation de l'activité" size="lg">
        <BilanForm 
          activiteId={id} 
          poleId="" 
          onSubmit={async (data) => {
            await fetch("/api/bilans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
            qc.invalidateQueries({ queryKey: ["activite", id] }); setBilanOpen(false);
          }} 
          onCancel={() => setBilanOpen(false)} 
        />
      </Modal>
    </div>
  )
}