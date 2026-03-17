import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const bilan = await prisma.bilan.findUnique({
      where: { id },
      include: { checklist: true, pole: true, activite: true, user: { select: { id: true, nom: true, prenom: true } } },
    })
    if (!bilan) return NextResponse.json({ error: "Bilan non trouvé" }, { status: 404 })
    return NextResponse.json({ data: bilan })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
