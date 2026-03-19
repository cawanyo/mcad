import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    // On ajoute le champ role pour qu'il soit reconnu par l'adaptateur
    role?: string 
  }

  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
}