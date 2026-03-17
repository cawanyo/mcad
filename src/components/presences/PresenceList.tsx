"use client"
import { useState } from "react"
import { StatutPresence } from "@prisma/client"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { getStatutPresenceLabel } from "@/lib/utils"
import { Check, X, Clock } from "lucide-react"

interface Presence {
  id: string
  statut: StatutPresence
  user: { id: string; nom: string; prenom: string; image?: string | null }
}

interface PresenceListProps {
  presences: Presence[]
  activiteId: string
  currentUserId: string
  canEdit?: boolean
  onUpdate?: () => void
}

export default function PresenceList({ presences, activiteId, currentUserId, canEdit, onUpdate }: PresenceListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatut = async (userId: string, statut: StatutPresence) => {
    setLoading(userId)
    try {
      await fetch(`/api/activites/${activiteId}/presences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, statut }),
      })
      onUpdate?.()
    } finally {
      setLoading(null)
    }
  }

  const stats = {
    present: presences.filter((p) => p.statut === "PRESENT").length,
    absent: presences.filter((p) => p.statut === "ABSENT").length,
    attente: presences.filter((p) => p.statut === "EN_ATTENTE").length,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
          <p className="text-xs text-green-600">Présents</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
          <p className="text-xs text-red-600">Absents</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.attente}</p>
          <p className="text-xs text-yellow-600">En attente</p>
        </div>
      </div>
      <div className="space-y-2">
        {presences.map((p) => {
          const isMe = p.user.id === currentUserId
          const initials = `${p.user.prenom[0]}${p.user.nom[0]}`.toUpperCase()
          return (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                {initials}
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900">{p.user.prenom} {p.user.nom}</span>
              {(isMe || canEdit) ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => updateStatut(p.user.id, "PRESENT")}
                    disabled={loading === p.user.id}
                    className={`p-1.5 rounded-full transition-colors ${p.statut === "PRESENT" ? "bg-green-100 text-green-700" : "hover:bg-gray-100 text-gray-400"}`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateStatut(p.user.id, "ABSENT")}
                    disabled={loading === p.user.id}
                    className={`p-1.5 rounded-full transition-colors ${p.statut === "ABSENT" ? "bg-red-100 text-red-700" : "hover:bg-gray-100 text-gray-400"}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Badge variant={p.statut === "PRESENT" ? "success" : p.statut === "ABSENT" ? "danger" : "warning"}>
                  {getStatutPresenceLabel(p.statut)}
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
