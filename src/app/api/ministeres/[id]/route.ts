import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ministereSchema } from "@/schemas"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const ministere = await prisma.ministere.findUnique({
      where: { id },
      include: {
        membres: { include: { user: { select: { id: true, nom: true, prenom: true, email: true, image: true, role: true } } } },
        responsables: { include: { user: { select: { id: true, nom: true, prenom: true, image: true } } } },
        poles: { include: { _count: { select: { membres: true } } } },
        activites: { orderBy: { date: "desc" }, take: 10 },
        _count: { select: { membres: true, activites: true, poles: true } },
      },
    })
    if (!ministere) return NextResponse.json({ error: "Ministère non trouvé" }, { status: 404 })
    return NextResponse.json({ data: ministere })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !["ADMIN", "RESPONSABLE_MINISTERE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json()
    const parsed = ministereSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }
    const ministere = await prisma.ministere.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: ministere })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    const { id } = await params
    await prisma.ministere.delete({ where: { id } })
    return NextResponse.json({ message: "Ministère supprimé" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
