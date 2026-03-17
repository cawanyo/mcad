import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/schemas"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
    }
    const { nom, prenom, email, motDePasse, telephone, dateNaissance, role } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 })
    }
    const hash = await bcrypt.hash(motDePasse, 12)
    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        motDePasse: hash,
        telephone,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
        role: role ?? "MEMBRE",
      },
    })
    const { motDePasse: _, ...userWithoutPassword } = user
    return NextResponse.json({ data: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
