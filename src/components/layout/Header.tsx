"use client"
import { useSession, signOut } from "next-auth/react"
import { LogOut, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import NotificationBell from "@/components/notifications/NotificationBell"

interface HeaderProps {
  title: string
  back?: boolean
  actions?: React.ReactNode
}

export default function Header({ title, back, actions }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 h-14">
        {back && (
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{title}</h1>
        <div className="flex items-center gap-1">
          {actions}
          {session && <NotificationBell />}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
