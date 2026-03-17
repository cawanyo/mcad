import "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role: Role
    id: string
  }
  interface Session {
    user: {
      id: string
      role: Role
      email: string
      name: string
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    id: string
  }
}
