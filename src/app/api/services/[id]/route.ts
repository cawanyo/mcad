import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role === "MEMBRE") return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    const { id } = await params
    const { userId } = await request.json()
    const service = await prisma.service.findUnique({ where: { id }, include: { activite: true, pole: true } })
    if (!service) return NextResponse.json({ error: "Service non trouvé" }, { status: 404 })
    if (userId) {
      const indispo = await prisma.indisponibilite.findFirst({
        where: { userId, dateDebut: { lte: service.activite.date }, dateFin: { gte: service.activite.date } },
      })
      if (indispo) return NextResponse.json({ error: "Membre indisponible" }, { status: 409 })
    }
    const updated = await prisma.service.update({
      where: { id },
      data: { userId: userId ?? null },
      include: { pole: true, user: { select: { id: true, nom: true, prenom: true, image: true } } },
    })

    if (userId) {
      const dateStr = service.activite.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
      await createNotification({
        userId,
        titre: "Service assigné",
        message: `Vous êtes assigné au service "${service.nom}" (${service.pole.nom}) pour ${service.activite.nom} — ${dateStr}`,
        type: "SERVICE",
        lien: `/activites/${service.activiteId}`,
      })
    }

    return NextResponse.json({ data: updated })
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
    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ message: "Service supprimé" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
