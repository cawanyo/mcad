import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@eglise.com"
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    console.log("Compte admin déjà existant :", email)
    return
  }

  const hash = await bcrypt.hash("Admin1234!", 12)

  await prisma.user.create({
    data: {
      nom: "Admin",
      prenom: "Super",
      email,
      motDePasse: hash,
      role: "ADMIN",
    },
  })

  console.log("Compte admin créé avec succès")
  console.log("  Email    :", email)
  console.log("  Mot de passe : Admin1234!")
  console.log("  Pensez à changer le mot de passe après la première connexion.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
