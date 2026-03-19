"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerSchema, RegisterInput } from "@/schemas"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { Eye, EyeOff, Lock } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? "Erreur lors de l'inscription")
      return
    }
    router.push("/login")
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Créer un compte</h2>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" error={errors.prenom?.message} {...register("prenom")} placeholder="Jean" />
          <Input label="Nom" error={errors.nom?.message} {...register("nom")} placeholder="Dupont" />
        </div>
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} placeholder="exemple@eglise.com" />
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Mot de passe</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                {...register("motDePasse")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 bg-white/50 border-slate-200 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.motDePasse && (
              <p className="text-xs text-red-500 mt-1">{errors.motDePasse.message}</p>
            )}
          </div>
        <Input label="Téléphone" type="tel" {...register("telephone")} placeholder="+33 6 00 00 00 00" />
        <Button type="submit" loading={loading} className="w-full">Créer le compte</Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
      </p>
    </div>
  )
}
