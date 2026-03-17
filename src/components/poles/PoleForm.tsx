"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { poleSchema, PoleInput } from "@/schemas"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"
import { useState } from "react"

interface PoleFormProps {
  defaultValues?: Partial<PoleInput>
  ministeres: { id: string; nom: string }[]
  onSubmit: (data: PoleInput) => Promise<void>
  onCancel?: () => void
}

export default function PoleForm({ defaultValues, ministeres, onSubmit, onCancel }: PoleFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<PoleInput>({
    resolver: zodResolver(poleSchema),
    defaultValues,
  })
  const submit = async (data: PoleInput) => {
    setLoading(true)
    try { await onSubmit(data) } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Nom" error={errors.nom?.message} {...register("nom")} placeholder="Ex: Musiciens" />
      <Select
        label="Ministère"
        options={ministeres.map((m) => ({ value: m.id, label: m.nom }))}
        placeholder="Sélectionner un ministère"
        error={errors.ministereId?.message}
        {...register("ministereId")}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>}
        <Button type="submit" loading={loading} className="flex-1">Enregistrer</Button>
      </div>
    </form>
  )
}
