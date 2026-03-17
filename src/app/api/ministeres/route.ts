import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ministereSchema } from "@/schemas"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const ministeres = await prisma.ministere.findMany({
      include: {
        responsables: { include: { user: { select: { id: true, nom: true, prenom: true, image: true } } } },
        _count: { select: { membres: true, activites: true, poles: true } },
      },
      orderBy: { nom: "asc" },
    })
    return NextResponse.json({ data: ministeres })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["ADMIN", "RESPONSABLE_MINISTERE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    const body = await request.json()
    const parsed = ministereSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
    }
    const ministere = await prisma.ministere.create({
      data: parsed.data,
      include: { _count: { select: { membres: true, activites: true } } },
    })
    return NextResponse.json({ data: ministere }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
