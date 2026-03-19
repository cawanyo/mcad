import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    
    const { id } = await params
    // 1. Trouver le service et son pôle
    const service = await prisma.service.findUnique({
      where: { id: id },
      select: {
        poleId: true,
        ministereId: true,
        assignations: true, // L'ID actuellement assigné
      }
    })

    if (!service) return NextResponse.json({ error: "Service non trouvé" }, { status: 404 })

    let members = []

    // 2. Si le service est lié à un pôle, on prend les membres du pôle
    if (service.poleId) {
      members = await prisma.membrePole.findMany({
        where: { poleId: service.poleId },
        include: {
          user: {
            select: { id: true, nom: true, prenom: true, image: true }
          }
        }
      })
    } 
    // 3. Sinon (service ministère uniquement), on prend les membres du ministère
    else {
      members = await prisma.membreMinistere.findMany({
        where: { ministereId: service.ministereId },
        include: {
          user: {
            select: { id: true, nom: true, prenom: true, image: true }
          }
        }
      })
    }

    // On formate pour renvoyer une liste simple d'utilisateurs
    const poleMembers = members.map(m => m.user)
    console.log(service.assignations)

    return NextResponse.json({
      poleMembers,
      currentlyAssignedIds: service.assignations.map(a => a.userId) // On renvoie l'ID actuel pour le front
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}



export async function POST(request: Request, { params }: { params: Promise<{ id: string } >}) {
    const {id} = await params
    const { userIds } = await request.json() // Reçoit un tableau ['id1', 'id2']
  
    
    try {
      await prisma.$transaction([
        // 1. Supprimer les anciennes assignations pour ce service
        prisma.serviceAssignation.deleteMany({
          where: { serviceId: id }
        }),
        // 2. Créer les nouvelles
        prisma.serviceAssignation.createMany({
          data: userIds.map((uId: string) => ({
            serviceId: id,
            userId: uId
          }))
        })
      ])
  
      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json({ error: "Erreur d'assignation" }, { status: 500 })
    }
  }