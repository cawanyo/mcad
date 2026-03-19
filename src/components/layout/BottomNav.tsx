"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Church, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/calendrier", label: "Calendrier", icon: Calendar },
  { href: "/ministeres", label: "Ministères", icon: Church },
  { href: "/profil", label: "Profil", icon: User },
  
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn("flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors", active ? "text-primary-600" : "text-gray-500")}
            >
              <Icon className={cn("h-3 w-3 md:h-5 md:w-5", active && "stroke-[2.5px]")} />
              <span className="text-[10px] md:text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
