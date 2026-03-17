import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activiteSchema } from "@/schemas"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const activite = await prisma.activite.findUnique({
      where: { id },
      include: {
        ministere: true,
        pole: true,
        services: { include: { pole: true, user: { select: { id: true, nom: true, prenom: true, image: true } } } },
        presences: { include: { user: { select: { id: true, nom: true, prenom: true, image: true } } } },
        taches: { orderBy: { ordre: "asc" }, include: { tachesRealisees: { include: { user: { select: { id: true, nom: true, prenom: true } } } } } },
        bilans: { include: { pole: true, user: { select: { id: true, nom: true, prenom: true } }, checklist: true } },
      },
    })
    if (!activite) return NextResponse.json({ error: "Activité non trouvée" }, { status: 404 })
    return NextResponse.json({ data: activite })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role === "MEMBRE") return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    const { id } = await params
    const body = await request.json()
    const parsed = activiteSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    const { date, ...rest } = parsed.data
    const activite = await prisma.activite.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    })
    return NextResponse.json({ data: activite })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role === "MEMBRE") return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    const { id } = await params
    await prisma.activite.delete({ where: { id } })
    return NextResponse.json({ message: "Activité supprimée" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
