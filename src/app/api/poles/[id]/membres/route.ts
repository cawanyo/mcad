import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const { id: poleId } = await params
    const { userId } = await request.json()

    // 1. Récupérer le pôle pour connaître son ministère parent
    const pole = await prisma.pole.findUnique({
      where: { id: poleId },
      select: { ministereId: true }
    })

    if (!pole) return NextResponse.json({ error: "Pôle non trouvé" }, { status: 404 })

    // 2. Transaction : Inscription au pôle + Inscription automatique au ministère
    await prisma.$transaction([
      // Ajout au pôle
      prisma.membrePole.create({
        data: { userId, poleId }
      }),
      // Ajout au ministère (upsert pour éviter les erreurs si déjà membre)
      prisma.membreMinistere.upsert({
        where: { userId_ministereId: { userId, ministereId: pole.ministereId } },
        create: { userId, ministereId: pole.ministereId },
        update: {} 
      })
    ])

    return NextResponse.json({ message: "Membre ajouté au pôle et au ministère" }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "L'utilisateur est déjà membre de ce pôle" }, { status: 400 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const { userId } = await request.json()
    await prisma.membrePole.delete({ where: { userId_poleId: { userId, poleId: id } } })
    return NextResponse.json({ message: "Membre retiré" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
