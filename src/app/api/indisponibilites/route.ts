import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { indisponibiliteSchema } from "@/schemas"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const indisponibilites = await prisma.indisponibilite.findMany({
      where: { userId: session.user.id },
      orderBy: { dateDebut: "desc" },
    })
    return NextResponse.json({ data: indisponibilites })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const body = await request.json()
    const parsed = indisponibiliteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    const indispo = await prisma.indisponibilite.create({
      data: {
        userId: session.user.id,
        dateDebut: new Date(parsed.data.dateDebut),
        dateFin: new Date(parsed.data.dateFin),
        raison: parsed.data.raison,
      },
    })
    return NextResponse.json({ data: indispo }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
