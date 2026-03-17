"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ministereSchema, MinistereInput } from "@/schemas"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { useState } from "react"

interface MinistereFormProps {
  defaultValues?: Partial<MinistereInput>
  onSubmit: (data: MinistereInput) => Promise<void>
  onCancel?: () => void
}

export default function MinistereForm({ defaultValues, onSubmit, onCancel }: MinistereFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<MinistereInput>({
    resolver: zodResolver(ministereSchema),
    defaultValues,
  })
  const submit = async (data: MinistereInput) => {
    setLoading(true)
    try { await onSubmit(data) } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Nom" error={errors.nom?.message} {...register("nom")} placeholder="Ex: Louange" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Description du ministère..."
        />
      </div>
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>}
        <Button type="submit" loading={loading} className="flex-1">Enregistrer</Button>
      </div>
    </form>
  )
}
