import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        dateNaissance: true,
        image: true,
        role: true,
        createdAt: true,
        ministresMembres: { include: { ministere: true } },
        polesMembres: { include: { pole: true } },
        responsableMinisteres: { include: { ministere: true } },
        responsablePoles: { include: { pole: true } },
      },
      orderBy: { nom: "asc" },
    })
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
