// src/app/api/activites/[id]/services/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const { besoins, ministereId, poleIds } = await request.json()

    if (!ministereId) {
      return NextResponse.json({ error: "Le ministère est requis" }, { status: 400 })
    }

    // Cas 1 : Des pôles sont sélectionnés
    if (poleIds && Array.isArray(poleIds) && poleIds.length > 0) {
      const createdServices = await Promise.all(
        poleIds.map((pId: string) =>
          prisma.service.create({
            data: {
              besoins: besoins || "",
              activite: { connect: { id: params.id } },   // On connecte l'activité
              ministere: { connect: { id: ministereId } }, // On connecte le ministère
              pole: { connect: { id: pId } },             // On connecte le pôle
            },
          })
        )
      )
      return NextResponse.json({ data: createdServices }, { status: 201 })
    }

    // Cas 2 : Aucun pôle coché (Ministère seul)
    const singleService = await prisma.service.create({
      data: {
        besoins: besoins || "",
        activite: { connect: { id: params.id } },
        ministere: { connect: { id: ministereId } },
        // On ne met pas de champ 'pole', il restera null car optionnel dans le schema
      },
    })

    return NextResponse.json({ data: singleService }, { status: 201 })

  } catch (error) {
    console.error("Erreur Prisma:", error)
    return NextResponse.json({ error: "Erreur lors de la création du service" }, { status: 500 })
  }
}