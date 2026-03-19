"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { poleSchema, type PoleInput } from "@/schemas"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"
import { useState } from "react"
import { Tag, LayoutList, AlignLeft, Loader2, CheckCircle2 } from "lucide-react"

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
    try { 
      await onSubmit(data) 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      
      {/* Champ Nom avec Icône */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-500" /> Nom du pôle
        </label>
        <Input 
          error={errors.nom?.message} 
          {...register("nom")} 
          placeholder="Ex: Équipe Technique, Louange..." 
          className="rounded-2xl border-slate-200 focus:border-blue-400 focus:ring-blue-100 transition-all h-12"
        />
      </div>

      {/* Sélection Ministère */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
          <LayoutList className="h-4 w-4 text-purple-500" /> Ministère de rattachement
        </label>
        <Select
          options={ministeres.map((m) => ({ value: m.id, label: m.nom }))}
          placeholder="Choisir un ministère"
          error={errors.ministereId?.message}
          {...register("ministereId")}
          className="rounded-2xl border-slate-200 h-12"
        />
      </div>

      {/* Description avec zone de texte améliorée */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-slate-400" /> Mission & Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Décrivez brièvement le rôle de ce pôle..."
          className={`w-full border rounded-2xl px-4 py-3 text-sm transition-all outline-none resize-none
            ${errors.description ? 'border-red-300 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50'}`}
        />
        {errors.description && (
          <p className="text-xs text-red-500 ml-1 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Actions de validation */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel} 
            className="flex-1 h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 border-none transition-colors"
          >
            Annuler
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={loading}
          className="flex-1 h-12 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Enregistrer
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}