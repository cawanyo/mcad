"use client"
import { useState } from "react"
import { Service, Pole, User, Ministere } from "@prisma/client"
import { UserPlus, Trash2, ChevronRight, LayoutGrid } from "lucide-react"
import { useRouter } from "next/navigation"

// Mise à jour du type pour inclure le ministère et rendre le pôle optionnel
type ServiceWithRelations = Service & { 
  pole: Pole | null; 
  ministere: Ministere; 
  user: User | null 
}

interface ServiceListProps {
  services: ServiceWithRelations[]
  membres?: User[]
  canEdit?: boolean
  onAssign?: (serviceId: string, userId: string | null) => Promise<void>
  onDelete?: (serviceId: string) => Promise<void>
  currentUser: any
}

export default function ServiceList({ services, membres = [], canEdit, onAssign, onDelete }: ServiceListProps) {
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const router = useRouter()
  // Logique de groupement : Ministère > Pôle
  const groupedByMinistere = services.reduce<Record<string, { 
    ministere: Ministere, 
    poles: Record<string, ServiceWithRelations[]> 
  }>>((acc, s) => {
    const mKey = s.ministere.id
    if (!acc[mKey]) {
      acc[mKey] = { ministere: s.ministere, poles: {} }
    }
    
    // Si pas de pôle, on utilise un nom par défaut "Besoins Généraux"/services/route.ts]
    const pKey = s.pole?.nom || "Besoins Généraux"
    if (!acc[mKey].poles[pKey]) {
      acc[mKey].poles[pKey] = []
    }
    
    acc[mKey].poles[pKey].push(s)
    return acc
  }, {})

  console.log(services)
  return (
    <div className="space-y-8">
      {Object.values(groupedByMinistere).map(({ ministere, poles }) => (
        <div key={ministere.id} className="space-y-4">
          {/* Titre du Ministère - Plus visible pour la hiérarchie */}
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <h3 className="font-bold text-gray-900">{ministere.nom}</h3>
          </div>

          <div className="pl-4 space-y-6">
            {Object.entries(poles).map(([poleName, svcs]) => (
              <div key={poleName} className="space-y-2">
                {/* Titre du Pôle (ou Besoins Généraux) */}
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <ChevronRight className="h-3 w-3" />
                  {poleName}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {svcs.map((s) => (
                    <div key={s.id} 
                      onClick={() => router.push(`/activites/${s.activiteId}/assign/${s.id}`)}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex-1">
                        {/* Affichage des besoins textuels au lieu du titre 'nom' */}
                        <p className="text-sm text-gray-700 leading-relaxed italic">
                          "{s.besoins}"
                        </p>
                        
                      </div>

                      {canEdit && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => onDelete?.(s.id)} 
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Supprimer la demande"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <LayoutGrid className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Aucun besoin de service défini pour cette activité</p>
        </div>
      )}
    </div>
  )
}