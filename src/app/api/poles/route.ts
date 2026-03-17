import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { poleSchema } from "@/schemas"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const ministereId = searchParams.get("ministereId")
    const poles = await prisma.pole.findMany({
      where: ministereId ? { ministereId } : undefined,
      include: {
        ministere: true,
        responsables: { include: { user: { select: { id: true, nom: true, prenom: true, image: true } } } },
        _count: { select: { membres: true, activites: true } },
      },
      orderBy: { nom: "asc" },
    })
    return NextResponse.json({ data: poles })
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
    const parsed = poleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
    }
    const pole = await prisma.pole.create({
      data: parsed.data,
      include: { ministere: true, _count: { select: { membres: true } } },
    })
    return NextResponse.json({ data: pole }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
