import { prisma } from "./prisma"
import { NotificationType } from "@prisma/client"

interface CreateNotificationOptions {
  userId: string
  titre: string
  message: string
  type?: NotificationType
  lien?: string
}

export async function createNotification(options: CreateNotificationOptions) {
  return prisma.notification.create({
    data: {
      userId: options.userId,
      titre: options.titre,
      message: options.message,
      type: options.type ?? "INFO",
      lien: options.lien,
    },
  })
}

export async function createNotificationForAll(
  userIds: string[],
  options: Omit<CreateNotificationOptions, "userId">
) {
  if (userIds.length === 0) return
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      titre: options.titre,
      message: options.message,
      type: options.type ?? "INFO",
      lien: options.lien,
    })),
  })
}
