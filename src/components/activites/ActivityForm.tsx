"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { activiteSchema, ActiviteInput } from "@/schemas"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"
import { useState } from "react"

interface ActivityFormProps {
  defaultValues?: Partial<ActiviteInput>
  ministeres?: { id: string; nom: string }[]
  poles?: { id: string; nom: string }[]
  onSubmit: (data: ActiviteInput) => Promise<void>
  onCancel?: () => void
}

export default function ActivityForm({ defaultValues, ministeres = [], poles = [], onSubmit, onCancel }: ActivityFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ActiviteInput>({
    resolver: zodResolver(activiteSchema),
    defaultValues: { niveauImportance: "NORMAL", type: "GLOBALE", ...defaultValues },
  })
  const type = watch("type")

  const submit = async (data: ActiviteInput) => {
    setLoading(true)
    try { await onSubmit(data) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Nom" error={errors.nom?.message} {...register("nom")} placeholder="Ex: Culte du dimanche" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Description optionnelle..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
        <Select
          label="Niveau"
          options={[
            { value: "FAIBLE", label: "Faible" },
            { value: "NORMAL", label: "Normal" },
            { value: "IMPORTANT", label: "Important" },
            { value: "CRITIQUE", label: "Critique" },
          ]}
          {...register("niveauImportance")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Heure début" type="time" error={errors.heureDebut?.message} {...register("heureDebut")} />
        <Input label="Heure fin" type="time" error={errors.heureFin?.message} {...register("heureFin")} />
      </div>
      <Select
        label="Type d'activité"
        options={[
          { value: "GLOBALE", label: "Globale" },
          { value: "MINISTERE", label: "Ministère" },
          { value: "POLE", label: "Pôle" },
        ]}
        error={errors.type?.message}
        {...register("type")}
      />
      {type === "MINISTERE" && ministeres.length > 0 && (
        <Select
          label="Ministère"
          options={ministeres.map((m) => ({ value: m.id, label: m.nom }))}
          placeholder="Sélectionner un ministère"
          {...register("ministereId")}
        />
      )}
      {type === "POLE" && poles.length > 0 && (
        <Select
          label="Pôle"
          options={poles.map((p) => ({ value: p.id, label: p.nom }))}
          placeholder="Sélectionner un pôle"
          {...register("poleId")}
        />
      )}
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>}
        <Button type="submit" loading={loading} className="flex-1">Enregistrer</Button>
      </div>
    </form>
  )
}
