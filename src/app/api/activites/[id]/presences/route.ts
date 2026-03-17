import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const presences = await prisma.presence.findMany({
      where: { activiteId: id },
      include: { user: { select: { id: true, nom: true, prenom: true, image: true } } },
    })
    return NextResponse.json({ data: presences })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const { userId, statut } = await request.json()
    const targetUserId = userId ?? session.user.id

    const presence = await prisma.presence.upsert({
      where: { userId_activiteId: { userId: targetUserId, activiteId: id } },
      create: { userId: targetUserId, activiteId: id, statut },
      update: { statut },
    })

    if (statut === "ABSENT" && targetUserId !== session.user.id) {
      const activite = await prisma.activite.findUnique({ where: { id } })
      if (activite) {
        await createNotification({
          userId: targetUserId,
          titre: "Absence enregistrée",
          message: `Votre absence a été enregistrée pour "${activite.nom}"`,
          type: "PRESENCE",
          lien: `/activites/${id}`,
        })
      }
    }

    return NextResponse.json({ data: presence })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
