"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerSchema, RegisterInput } from "@/schemas"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
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
        <Input label="Mot de passe" type="password" error={errors.motDePasse?.message} {...register("motDePasse")} placeholder="Min. 8 caractères" />
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
