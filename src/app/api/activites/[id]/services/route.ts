import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/schemas"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role === "MEMBRE") return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    const { id } = await params
    const body = await request.json()
    const parsed = serviceSchema.safeParse({ ...body, activiteId: id })
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    if (parsed.data.userId) {
      const activite = await prisma.activite.findUnique({ where: { id } })
      const indispo = await prisma.indisponibilite.findFirst({
        where: { userId: parsed.data.userId, dateDebut: { lte: activite!.date }, dateFin: { gte: activite!.date } },
      })
      if (indispo) return NextResponse.json({ error: "Ce membre est indisponible à cette date" }, { status: 409 })
      const conflict = await prisma.service.findFirst({
        where: { assignations: { some: {userId :parsed.data.userId}} , activiteId: id, id: { not: undefined } },
      })
      if (conflict) return NextResponse.json({ error: "Ce membre est déjà assigné à un service pour cette activité" }, { status: 409 })
    }
    // const service = await prisma.service.create({
    //   data:{

    //     activite: { connect: { id } },
    //     pole: parsed.data.poleId ? { connect: { id: parsed.data.poleId } } : undefined,
    //     assignations: parsed.data.userId ? { create: { userId: parsed.data.userId } } : undefined,
    //   } ,
    //   include: { pole: true, assignations: {include: {user :{ select: { id: true, nom: true, prenom: true, image: true } } }}},
    // })
    return NextResponse.json({ data: {} }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
