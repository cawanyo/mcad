import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const result = await prisma.tacheRealisee.upsert({
      where: { tacheId_userId: { tacheId: id, userId: session.user.id } },
      create: { tacheId: id, userId: session.user.id },
      update: { realiseeA: new Date() },
    })
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    await prisma.tacheRealisee.delete({ where: { tacheId_userId: { tacheId: id, userId: session.user.id } } })
    return NextResponse.json({ message: "Tâche annulée" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
