import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    const { id } = await params
    const { userId } = await request.json()
    await prisma.responsableMinistere.create({ data: { userId, ministereId: id } })
    await prisma.user.update({ where: { id: userId }, data: { role: "RESPONSABLE_MINISTERE" } })
    return NextResponse.json({ message: "Responsable assigné" }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    const { id } = await params
    const { userId } = await request.json()
    await prisma.responsableMinistere.delete({ where: { userId_ministereId: { userId, ministereId: id } } })
    return NextResponse.json({ message: "Responsable retiré" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
