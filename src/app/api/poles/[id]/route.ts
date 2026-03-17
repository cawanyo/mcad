import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { poleSchema } from "@/schemas"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const pole = await prisma.pole.findUnique({
      where: { id },
      include: {
        ministere: true,
        membres: { include: { user: { select: { id: true, nom: true, prenom: true, email: true, image: true, role: true } } } },
        responsables: { include: { user: { select: { id: true, nom: true, prenom: true, image: true } } } },
        activites: { orderBy: { date: "desc" }, take: 10 },
        _count: { select: { membres: true, activites: true } },
      },
    })
    if (!pole) return NextResponse.json({ error: "Pôle non trouvé" }, { status: 404 })
    return NextResponse.json({ data: pole })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !["ADMIN", "RESPONSABLE_MINISTERE", "RESPONSABLE_POLE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json()
    const parsed = poleSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    const pole = await prisma.pole.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: pole })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !["ADMIN", "RESPONSABLE_MINISTERE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    const { id } = await params
    await prisma.pole.delete({ where: { id } })
    return NextResponse.json({ message: "Pôle supprimé" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
