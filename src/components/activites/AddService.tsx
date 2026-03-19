"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import Select  from "@/components/ui/Select"
import Button from "../ui/Button"

export function AddServiceForm({ activityId, onSuccess }: { activityId: string, onSuccess: () => void }) {
  const { register, handleSubmit, watch, setValue } = useForm()
  const [ministeres, setMinisteres] = useState([])
  const [poles, setPoles] = useState<any>([])
  const [loading, setLoading] = useState(false)

  const selectedMinistere = watch("ministereId") // Surveille le changement de ministère

  // 1. Charger tous les ministères au montage
  useEffect(() => {
    fetch("/api/ministeres").then(res => res.json()).then(json => setMinisteres(json.data || []))
  }, [])

  // 2. Charger les pôles quand le ministère change
  useEffect(() => {
    if (selectedMinistere && selectedMinistere !== "") {
      setLoading(true)
      fetch(`/api/poles?ministereId=${selectedMinistere}`)
        .then(res => res.json())
        .then(json => {
          setPoles(json.data || [])
          setValue("selectedPoles", []) // Reset la sélection si on change de ministère
        })
        .finally(() => setLoading(false))
    } else {
      setPoles([])
    }
  }, [selectedMinistere, setValue])

  const onSubmit = async (data: any) => {
    // Filtrer uniquement les IDs des pôles cochés
    const selectedPoles = data.polesCheck ?  Object.keys(data.polesCheck)
      .filter(id => data.polesCheck[id] === true) : []

    const response = await fetch(`/api/activites/${activityId}/services/ministere`, {
      method: "POST",
      body: JSON.stringify({
        besoins: data.besoins,
        ministereId: data.ministereId,
        poleIds: selectedPoles
      })
    })
    if (!response.ok) {
        const error = await response.json()
        console.log(error)
      alert("Erreur lors de la création du service", error)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Champ textuel pour les besoins */}
      <div>
        <label className="block text-sm font-medium">Besoins spécifiques</label>
        <textarea 
          {...register("besoins")} 
          className="w-full p-2 border rounded"
          placeholder="Détaillez vos besoins ici..."
        />
      </div>

      {/* Liste déroulante des ministères */}
      <div>
        <label className="block text-sm font-medium">Ministère</label>
        <select {...register("ministereId")} className="w-full p-2 border rounded">
          <option value="">Sélectionnez un ministère</option>
          {ministeres.map((m:any) => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </select>
      </div>

      {/* Liste des pôles avec cases à cocher */}
      {poles.length > 0 && (
        <div className="p-3 border rounded bg-gray-50">
          <label className="block text-sm font-bold mb-2">Pôles concernés</label>
          <div className="grid grid-cols-2 gap-2">
            {poles.map((pole:any) => (
              <div key={pole.id} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  defaultChecked={true}
                  {...register(`polesCheck.${pole.id}`)} 
                  id={`pole-${pole.id}`}
                />
                <label htmlFor={`pole-${pole.id}`} className="text-sm">
                  {pole.nom}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full">Enregistrer le service</Button>
    </form>
  )
}