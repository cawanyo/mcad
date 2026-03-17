"use client"
import { useState } from "react"
import { Service, Pole, User } from "@prisma/client"
import Badge from "@/components/ui/Badge"
import { UserPlus, Trash2 } from "lucide-react"

type ServiceWithRelations = Service & { pole: Pole; user: User | null }

interface ServiceListProps {
  services: ServiceWithRelations[]
  membres?: User[]
  canEdit?: boolean
  onAssign?: (serviceId: string, userId: string | null) => Promise<void>
  onDelete?: (serviceId: string) => Promise<void>
}

export default function ServiceList({ services, membres = [], canEdit, onAssign, onDelete }: ServiceListProps) {
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const grouped = services.reduce<Record<string, ServiceWithRelations[]>>((acc, s) => {
    const key = s.pole.nom
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([poleName, svcs]) => (
        <div key={poleName}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{poleName}</p>
          <div className="space-y-2">
            {svcs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{s.nom}</p>
                  {s.user ? (
                    <p className="text-xs text-gray-500">{s.user.prenom} {s.user.nom}</p>
                  ) : (
                    <p className="text-xs text-orange-500">Non assigné</p>
                  )}
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    {assigningId === s.id ? (
                      <select
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        onChange={async (e) => {
                          await onAssign?.(s.id, e.target.value || null)
                          setAssigningId(null)
                        }}
                        defaultValue=""
                      >
                        <option value="">Aucun</option>
                        {membres.map((m) => (
                          <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                        ))}
                      </select>
                    ) : (
                      <button onClick={() => setAssigningId(s.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                        <UserPlus className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => onDelete?.(s.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {services.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Aucun service défini</p>
      )}
    </div>
  )
}
