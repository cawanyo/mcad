import type {
  User,
  Ministere,
  Pole,
  Activite,
  Service,
  Presence,
  Bilan,
  ChecklistItem,
  Tache,
  Indisponibilite,
  Role,
  StatutPresence,
  TypeActivite,
  NiveauImportance,
} from "@prisma/client"

export type {
  User,
  Ministere,
  Pole,
  Activite,
  Service,
  Presence,
  Bilan,
  ChecklistItem,
  Tache,
  Indisponibilite,
  Role,
  StatutPresence,
  TypeActivite,
  NiveauImportance,
}

export type UserWithRelations = User & {
  ministresMembres: { ministere: Ministere }[]
  polesMembres: { pole: Pole }[]
  responsableMinisteres: { ministere: Ministere }[]
  responsablePoles: { pole: Pole }[]
}

export type MinistereWithRelations = Ministere & {
  membres: { user: User }[]
  responsables: { user: User }[]
  poles: Pole[]
  _count: { activites: number; membres: number }
}

export type PoleWithRelations = Pole & {
  ministere: Ministere
  membres: { user: User }[]
  responsables: { user: User }[]
  _count: { activites: number; membres: number }
}

export type ActiviteWithRelations = Activite & {
  ministere: Ministere | null
  pole: Pole | null
  services: ServiceWithRelations[]
  presences: PresenceWithUser[]
  taches: Tache[]
  _count: { presences: number; services: number }
}

export type ServiceWithRelations = Service & {
  pole: Pole
  user: User | null
}

export type PresenceWithUser = Presence & {
  user: User
}

export type BilanWithRelations = Bilan & {
  activite: Activite
  pole: Pole
  user: User
  checklist: ChecklistItem[]
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}
