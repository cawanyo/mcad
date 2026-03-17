import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const { userId } = await request.json()
    await prisma.membreMinistere.create({ data: { userId, ministereId: id } })
    return NextResponse.json({ message: "Membre ajouté" }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const { userId } = await request.json()
    await prisma.membreMinistere.delete({ where: { userId_ministereId: { userId, ministereId: id } } })
    return NextResponse.json({ message: "Membre retiré" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
