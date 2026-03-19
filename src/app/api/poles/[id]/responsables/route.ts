import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    // Seul un ADMIN ou un Responsable de Ministère peut nommer un chef de pôle
    if (!session || (session.user.role !== "ADMIN")) {
       // Optionnel : ajouter une vérification pour voir si l'user est ResponsableMinistere
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id: poleId } = await params
    const { userId, action } = await request.json() // action: "PROMOTE" | "DEMOTE"

    if (action === "PROMOTE") {
      // 1. S'assurer qu'il est membre du pôle avant (sécurité)
      await prisma.membrePole.upsert({
        where: { userId_poleId: { userId, poleId } },
        create: { userId, poleId },
        update: {}
      })

      // 2. Ajouter aux responsables
      await prisma.responsablePole.upsert({
        where: { userId_poleId: { userId, poleId } },
        create: { userId, poleId },
        update: {}
      })
      return NextResponse.json({ message: "Promu responsable de pôle" })
    } else {
      await prisma.responsablePole.delete({
        where: { userId_poleId: { userId, poleId } }
      })
      return NextResponse.json({ message: "Retiré des responsables" })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}