"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bilanSchema, BilanInput } from "@/schemas"
import Button from "@/components/ui/Button"
import { Check } from "lucide-react"

interface BilanFormProps {
  activiteId: string
  poleId: string
  defaultValues?: Partial<BilanInput>
  onSubmit: (data: BilanInput) => Promise<void>
  onCancel?: () => void
}

const defaultChecklist = [
  "Matériel prêt et fonctionnel",
  "Membres présents et prêts",
  "Objectifs atteints",
  "Incidents signalés",
]

export default function BilanForm({ activiteId, poleId, defaultValues, onSubmit, onCancel }: BilanFormProps) {
  const [loading, setLoading] = useState(false)
  const [checklist, setChecklist] = useState<{ label: string; valide: boolean }[]>(
    defaultValues?.checklist ?? defaultChecklist.map((label) => ({ label, valide: false }))
  )
  const { register, handleSubmit, formState: { errors } } = useForm<BilanInput>({
    resolver: zodResolver(bilanSchema),
    defaultValues: { activiteId, poleId, ...defaultValues },
  })

  const submit = async (data: BilanInput) => {
    setLoading(true)
    try { await onSubmit({ ...data, checklist }) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Checklist</p>
        <div className="space-y-2">
          {checklist.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setChecklist((prev) => prev.map((it, idx) => idx === i ? { ...it, valide: !it.valide } : it))}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${item.valide ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${item.valide ? "bg-green-500" : "border-2 border-gray-300"}`}>
                {item.valide && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note globale (sur 10)</label>
        <input
          type="number"
          min={0}
          max={10}
          {...register("note", { valueAsNumber: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
        <textarea
          {...register("commentaire")}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Observations du responsable..."
        />
      </div>
      <input type="hidden" {...register("activiteId")} />
      <input type="hidden" {...register("poleId")} />
      <div className="flex gap-3">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>}
        <Button type="submit" loading={loading} className="flex-1">Soumettre le bilan</Button>
      </div>
    </form>
  )
}
