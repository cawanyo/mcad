import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import BottomNav from "@/components/layout/BottomNav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
