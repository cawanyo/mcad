import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activiteSchema } from "@/schemas"
import { createNotificationForAll } from "@/lib/notifications"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const ministereId = searchParams.get("ministereId")
    const poleId = searchParams.get("poleId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const activites = await prisma.activite.findMany({
      where: {
        ...(type ? { type: type as "GLOBALE" | "MINISTERE" | "POLE" } : {}),
        ...(ministereId ? { ministereId } : {}),
        ...(poleId ? { poleId } : {}),
        ...(from || to ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
      },
      include: {
        ministere: true,
        pole: true,
        _count: { select: { presences: true, services: true } },
      },
      orderBy: { date: "asc" },
    })
    return NextResponse.json({ data: activites })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role === "MEMBRE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    const body = await request.json()
    const parsed = activiteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 })
    }
    const { date, ...rest } = parsed.data
    const activite = await prisma.activite.create({
      data: { ...rest, date: new Date(date) },
      include: { ministere: true, pole: true },
    })

    const dateStr = new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

    if (activite.type === "GLOBALE") {
      const users = await prisma.user.findMany({ select: { id: true } })
      const otherIds = users.map((u) => u.id).filter((id) => id !== session.user.id)
      await createNotificationForAll(otherIds, {
        titre: "Nouvelle activité",
        message: `${activite.nom} — ${dateStr} à ${activite.heureDebut}`,
        type: "ACTIVITE",
        lien: `/activites/${activite.id}`,
      })
    } else if (activite.type === "MINISTERE" && activite.ministereId) {
      const membres = await prisma.membreMinistere.findMany({
        where: { ministereId: activite.ministereId },
        select: { userId: true },
      })
      const ids = membres.map((m) => m.userId).filter((id) => id !== session.user.id)
      await createNotificationForAll(ids, {
        titre: "Nouvelle activité ministère",
        message: `${activite.nom} — ${dateStr} à ${activite.heureDebut}`,
        type: "ACTIVITE",
        lien: `/activites/${activite.id}`,
      })
    } else if (activite.type === "POLE" && activite.poleId) {
      const membres = await prisma.membrePole.findMany({
        where: { poleId: activite.poleId },
        select: { userId: true },
      })
      const ids = membres.map((m) => m.userId).filter((id) => id !== session.user.id)
      await createNotificationForAll(ids, {
        titre: "Nouvelle activité pôle",
        message: `${activite.nom} — ${dateStr} à ${activite.heureDebut}`,
        type: "ACTIVITE",
        lien: `/activites/${activite.id}`,
      })
    }

    return NextResponse.json({ data: activite }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
