import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role === "MEMBRE") return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    const { id } = await params
    const { nom, ordre } = await request.json()
    const tache = await prisma.tache.create({ data: { nom, ordre: ordre ?? 0, activiteId: id } })
    return NextResponse.json({ data: tache }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
