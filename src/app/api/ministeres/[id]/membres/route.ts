import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 })
    }
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    // Seul un ADMIN peut nommer un responsable de ministère
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 })
    }

    const { id: ministereId } = await params
    const { userId, action } = await request.json() // action: "PROMOTE" | "DEMOTE"

    if (action === "PROMOTE") {
      // 1. On l'ajoute à la table des responsables
      await prisma.responsableMinistere.upsert({
        where: { userId_ministereId: { userId, ministereId } },
        create: { userId, ministereId },
        update: {}
      })
      return NextResponse.json({ message: "Membre promu responsable" })
    } else {
      // 2. On le retire de la table des responsables
      await prisma.responsableMinistere.delete({
        where: { userId_ministereId: { userId, ministereId } }
      })
      return NextResponse.json({ message: "Responsable rétrogradé en membre simple" })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur lors du changement de rôle" }, { status: 500 })
  }
}