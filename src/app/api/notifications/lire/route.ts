import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { id } = body

    if (id) {
      await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { lu: true },
      })
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, lu: false },
        data: { lu: true },
      })
    }

    return NextResponse.json({ message: "Marqué comme lu" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
