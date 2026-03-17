import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "dd MMMM yyyy", { locale: fr })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "dd/MM/yyyy", { locale: fr })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "dd/MM/yyyy HH:mm", { locale: fr })
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Administrateur",
    RESPONSABLE_MINISTERE: "Responsable de ministère",
    RESPONSABLE_POLE: "Responsable de pôle",
    MEMBRE: "Membre",
  }
  return labels[role] ?? role
}

export function getNiveauLabel(niveau: string): string {
  const labels: Record<string, string> = {
    FAIBLE: "Faible",
    NORMAL: "Normal",
    IMPORTANT: "Important",
    CRITIQUE: "Critique",
  }
  return labels[niveau] ?? niveau
}

export function getNiveauColor(niveau: string): string {
  const colors: Record<string, string> = {
    FAIBLE: "bg-gray-100 text-gray-700",
    NORMAL: "bg-blue-100 text-blue-700",
    IMPORTANT: "bg-orange-100 text-orange-700",
    CRITIQUE: "bg-red-100 text-red-700",
  }
  return colors[niveau] ?? "bg-gray-100 text-gray-700"
}

export function getStatutPresenceLabel(statut: string): string {
  const labels: Record<string, string> = {
    EN_ATTENTE: "En attente",
    PRESENT: "Présent",
    ABSENT: "Absent",
  }
  return labels[statut] ?? statut
}

export function getStatutPresenceColor(statut: string): string {
  const colors: Record<string, string> = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-700",
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
  }
  return colors[statut] ?? "bg-gray-100 text-gray-700"
}

export function getTypeActiviteLabel(type: string): string {
  const labels: Record<string, string> = {
    GLOBALE: "Globale",
    MINISTERE: "Ministère",
    POLE: "Pôle",
  }
  return labels[type] ?? type
}
