"use client"
import { useState, useRef, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, X, Check, CheckCheck, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"

const TYPE_ICON: Record<string, string> = {
  INFO: "ℹ️",
  SERVICE: "🎸",
  ACTIVITE: "📅",
  PRESENCE: "✅",
  BILAN: "📝",
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: 10_000,
  })

  const notifications = data?.data ?? []
  const nonLues = data?.nonLues ?? 0

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const markAllRead = async () => {
    await fetch("/api/notifications/lire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
    qc.invalidateQueries({ queryKey: ["notifications"] })
  }

  const markRead = async (id: string) => {
    await fetch("/api/notifications/lire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    qc.invalidateQueries({ queryKey: ["notifications"] })
  }

  const deleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    qc.invalidateQueries({ queryKey: ["notifications"] })
  }

  const handleClick = async (notif: { id: string; lu: boolean; lien?: string | null }) => {
    if (!notif.lu) await markRead(notif.id)
    if (notif.lien) {
      setOpen(false)
      router.push(notif.lien)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {nonLues > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout lire
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 && (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune notification</p>
              </div>
            )}
            {notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors",
                  !n.lu && "bg-primary-50/60"
                )}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm leading-tight", !n.lu ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                      {n.titre}
                    </p>
                    <button
                      onClick={(e) => deleteNotif(e, n.id)}
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-400 flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.lu && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
