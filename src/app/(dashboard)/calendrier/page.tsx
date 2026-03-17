"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/Header"
import Card from "@/components/ui/Card"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { PDFDownloadLink } from "@react-pdf/renderer"
import WeeklyCalendarPDF from "@/components/pdf/WeeklyCalendarPDF"

export default function CalendrierPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  const { data: activites } = useQuery({
    queryKey: ["activites-calendrier", format(monthStart, "yyyy-MM")],
    queryFn: () =>
      fetch(`/api/activites?from=${monthStart.toISOString()}&to=${monthEnd.toISOString()}`)
        .then((r) => r.json())
        .then((r) => r.data ?? []),
    refetchInterval: 60_000,
  })

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getActivitesForDay = (day: Date) =>
    (activites ?? []).filter((a: any) => isSameDay(parseISO(a.date), day))

  const selectedActivites = selectedDay ? getActivitesForDay(selectedDay) : []

  const weeklyPdfDays = weekDays.map((d) => ({
    label: format(d, "EEEE dd MMMM", { locale: fr }),
    activites: getActivitesForDay(d).map((a: any) => ({ nom: a.nom, heureDebut: a.heureDebut })),
  }))

  return (
    <div>
      <Header title="Calendrier" />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 capitalize">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
            <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
          {Array.from({ length: (monthStart.getDay() || 7) - 1 }).map((_, i) => <div key={i} />)}
          {daysInMonth.map((day) => {
            const dayActivites = getActivitesForDay(day)
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const isToday = isSameDay(day, new Date())
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-colors ${isSelected ? "bg-primary-600 text-white" : isToday ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {day.getDate()}
                {dayActivites.length > 0 && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-primary-500"}`} />
                )}
              </button>
            )
          })}
        </div>

        {selectedDay && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 capitalize">{format(selectedDay, "EEEE dd MMMM yyyy", { locale: fr })}</p>
            {selectedActivites.length === 0 && <p className="text-sm text-gray-400 text-center py-3">Pas d'activité ce jour</p>}
            <div className="space-y-2">
              {selectedActivites.map((a: any) => (
                <Card key={a.id} onClick={() => router.push(`/activites/${a.id}`)} className="cursor-pointer hover:border-primary-200">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{a.nom}</p>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{a.heureDebut}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <PDFDownloadLink
          document={<WeeklyCalendarPDF weekLabel={`Semaine du ${format(weekStart, "dd")} au ${format(weekEnd, "dd MMMM yyyy", { locale: fr })}`} days={weeklyPdfDays} />}
          fileName="planning-semaine.pdf"
        >
          {({ loading }) => (
            <button className="w-full py-2.5 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors" disabled={loading}>
              {loading ? "Génération..." : "Télécharger planning semaine (PDF)"}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  )
}
