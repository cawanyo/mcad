import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
})

export const registerSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(8, "Mot de passe minimum 8 caractères"),
  telephone: z.string().optional(),
  dateNaissance: z.string().optional(),
  role: z.enum(["ADMIN", "RESPONSABLE_MINISTERE", "RESPONSABLE_POLE", "MEMBRE"]).optional(),
})

export const ministereSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
})

export const poleSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  ministereId: z.string().min(1, "Ministère requis"),
})

export const activiteSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  date: z.string().min(1, "Date requise"),
  heureDebut: z.string().min(1, "Heure de début requise"),
  heureFin: z.string().min(1, "Heure de fin requise"),
  type: z.enum(["GLOBALE", "MINISTERE", "POLE"]),
  niveauImportance: z.enum(["FAIBLE", "NORMAL", "IMPORTANT", "CRITIQUE"]).default("NORMAL"),
  ministereId: z.string().optional().nullable(),
  poleId: z.string().optional().nullable(),
})

export const serviceSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  activiteId: z.string().min(1, "Activité requise"),
  poleId: z.string().min(1, "Pôle requis"),
  userId: z.string().optional().nullable(),
})

export const presenceSchema = z.object({
  statut: z.enum(["EN_ATTENTE", "PRESENT", "ABSENT"]),
})

export const indisponibiliteSchema = z.object({
  dateDebut: z.string().min(1, "Date de début requise"),
  dateFin: z.string().min(1, "Date de fin requise"),
  raison: z.string().optional(),
})

export const tacheSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  ordre: z.number().optional(),
  activiteId: z.string().min(1, "Activité requise"),
})

export const bilanSchema = z.object({
  activiteId: z.string().min(1, "Activité requise"),
  poleId: z.string().min(1, "Pôle requis"),
  note: z.number().min(0).max(10).optional().nullable(),
  commentaire: z.string().optional(),
  checklist: z.array(z.object({
    label: z.string().min(1),
    valide: z.boolean(),
  })).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type MinistereInput = z.infer<typeof ministereSchema>
export type PoleInput = z.infer<typeof poleSchema>
export type ActiviteInput = z.infer<typeof activiteSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type PresenceInput = z.infer<typeof presenceSchema>
export type IndisponibiliteInput = z.infer<typeof indisponibiliteSchema>
export type TacheInput = z.infer<typeof tacheSchema>
export type BilanInput = z.infer<typeof bilanSchema>
