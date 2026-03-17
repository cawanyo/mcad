import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    const [totalUsers, totalMinisteres, totalPoles, totalActivites, prochesActivites] = await Promise.all([
      prisma.user.count(),
      prisma.ministere.count(),
      prisma.pole.count(),
      prisma.activite.count(),
      prisma.activite.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 5,
        include: { ministere: true, pole: true },
      }),
    ])
    return NextResponse.json({ data: { totalUsers, totalMinisteres, totalPoles, totalActivites, prochesActivites } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
