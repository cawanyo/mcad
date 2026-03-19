"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  format, startOfMonth, endOfMonth, startOfWeek, 
  endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, addMonths, subMonths 
} from "date-fns"
import { fr } from "date-fns/locale"
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, Sparkles, LayoutGrid, ArrowRight
} from "lucide-react"


import Badge from "@/components/ui/Badge"
import { useRouter } from "next/navigation"

export default function CalendrierPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const router = useRouter()

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/activites")
      if (!res.ok) throw new Error("Erreur réseau")
      const json = await res.json()
      return json.data || []
    }
  })

  const activities = Array.isArray(rawData) ? rawData : []
  
  const selectedDayActivities = activities.filter((act: any) => 
    act?.date && isSameDay(new Date(act.date), selectedDate)
  )

  // Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Logique du calendrier
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-10rem)] p-1">
      
      {/* SECTION CALENDRIER (Gauche) */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Header du Calendrier */}
        <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-800 capitalize">
              {format(currentDate, "MMMM yyyy", { locale: fr })}
            </h2>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 text-[10px] font-black uppercase tracking-tighter text-blue-600 hover:bg-blue-50 rounded-lg">
              Aujourd'hui
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Grille Jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/50">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, idx) => {
            const dayActivities = activities.filter((act: any) => isSameDay(new Date(act.date), day))
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, monthStart)
            
            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[50px] md:min-h-[120px] p-2 border-r border-b border-slate-50 cursor-pointer transition-all relative group
                  ${!isCurrentMonth ? "bg-slate-50/30" : "bg-white"}
                  ${isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/80"}
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-full transition-colors
                    ${isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-100" : ""}
                    ${isToday && !isSelected ? "text-blue-600 bg-blue-50" : ""}
                    ${!isCurrentMonth && !isSelected ? "text-slate-300" : "text-slate-600"}
                  `}>
                    {format(day, "d")}
                  </span>
                </div>
                
                {/* Indicateurs d'activités */}
                <div className="space-y-1">
                  {dayActivities.slice(0, 3).map((act: any) => (
                    <div 
                      key={act.id} 
                      className="text-[9px] font-bold bg-white border border-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md truncate shadow-sm group-hover:border-blue-200 transition-colors"
                    >
                      <span className="text-blue-500 mr-1">•</span>
                      {act.nom}
                    </div>
                  ))}
                  {dayActivities.length > 3 && (
                    <div className="text-[8px] font-black text-blue-500 pl-1 uppercase tracking-tighter">
                      +{dayActivities.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION DÉTAILS (Droite) */}
      <div className="w-full lg:w-96 space-y-4">
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <Sparkles className="absolute -right-2 -top-2 h-16 w-16 text-white/10" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Sélection</p>
          <h3 className="text-2xl font-black capitalize leading-tight">
            {format(selectedDate, "EEEE d MMMM", { locale: fr })}
          </h3>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
          {selectedDayActivities.length > 0 ? (
            selectedDayActivities.map((act: any) => (
              <div 
                key={act.id} 
                onClick={() => router.push(`/activites/${act.id}`)}
                className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="absolute right-4 top-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-black uppercase tracking-tighter mb-3">
                  {act.type || "Événement"}
                </Badge>
                <h4 className="font-black text-slate-800 text-lg leading-tight mb-3 group-hover:text-blue-700 transition-colors">
                  {act.nom}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    <span>{act.heureDebut || "Horaire non défini"}</span>
                  </div>
                  {act.lieu && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="truncate">{act.lieu}</span>
                    </div>
                  )}
                </div>
                {act.description && (
                  <p className="mt-4 text-[11px] text-slate-500 italic line-clamp-2 bg-slate-50 p-2 rounded-xl">
                    "{act.description}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <LayoutGrid className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">Journée libre</p>
              <p className="text-[11px] text-slate-300">Aucune activité prévue pour cette date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}