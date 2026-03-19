import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/schemas"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        dateNaissance: true,
        image: true,
        role: true,
        createdAt: true,
        ministresMembres: { include: { ministere: true } },
        polesMembres: { include: { pole: true } },
        responsableMinisteres: { include: { ministere: true } },
        responsablePoles: { include: { pole: true } },
        assignations: { 
          include: { 
            service: { 
              include: { 
                activite: true, 
                pole: true,
                ministere: true 
              } 
            } 
          }, 
          orderBy: { service: { activite: { date: "desc" } } }, // Tri plus logique par date d'activité
          take: 20 
        },
        presences: { include: { activite: true }, orderBy: { createdAt: "desc" }, take: 20 },
      },
    })
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    return NextResponse.json({ data: user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const { motDePasse, ...rest } = body
    const updateData: Record<string, unknown> = { ...rest }
    if (motDePasse) {
      updateData.motDePasse = await bcrypt.hash(motDePasse, 12)
    }
    if (updateData.dateNaissance) {
      updateData.dateNaissance = new Date(updateData.dateNaissance as string)
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, role: true },
    })
    return NextResponse.json({ data: user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    const { id } = await params
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: "Utilisateur supprimé" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
