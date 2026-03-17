import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { bilanSchema } from "@/schemas"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const body = await request.json()
    const parsed = bilanSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    const { checklist, ...bilanData } = parsed.data
    const bilan = await prisma.bilan.upsert({
      where: { activiteId_poleId: { activiteId: bilanData.activiteId, poleId: bilanData.poleId } },
      create: {
        ...bilanData,
        userId: session.user.id,
        checklist: checklist ? { create: checklist } : undefined,
      },
      update: {
        note: bilanData.note,
        commentaire: bilanData.commentaire,
        userId: session.user.id,
        checklist: checklist ? { deleteMany: {}, create: checklist } : undefined,
      },
      include: { checklist: true, pole: true, activite: true },
    })
    return NextResponse.json({ data: bilan }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
