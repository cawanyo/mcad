"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginSchema, LoginInput } from "@/schemas"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email: data.email, motDePasse: data.motDePasse, redirect: false })
    setLoading(false)
    if (result?.error) setError("Email ou mot de passe incorrect")
    else router.push("/dashboard")
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Connexion</h2>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} placeholder="exemple@eglise.com" />
        <Input label="Mot de passe" type="password" error={errors.motDePasse?.message} {...register("motDePasse")} placeholder="••••••••" />
        <Button type="submit" loading={loading} className="w-full">Se connecter</Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Pas de compte ?{" "}
        <Link href="/register" className="text-primary-600 font-medium hover:underline">S'inscrire</Link>
      </p>
    </div>
  )
}
