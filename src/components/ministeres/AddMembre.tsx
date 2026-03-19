"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Card  from "@/components/ui/Card"
import Button  from "@/components/ui/Button"
import Input  from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { Search, UserPlus, X, Check, Loader2 } from "lucide-react"
import { set } from "date-fns"

interface User {
  id: string
  nom: string
  prenom: string
  email: string
}

export function AddMemberModal({ ministereId, isOpen, onClose }: { ministereId: string, isOpen: boolean, onClose: () => void }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [issubmitting, setIsSubmitting] = useState(false)

  // Recherche des utilisateurs
  useEffect(() => {
    const load = async () => {
            try {
            const res = await fetch(`/api/utilisateurs?q=${search}`)
            const json = await res.json()
            setAllUsers(json.data || [])
            setResults(json.data || [])
        } finally {
            setLoading(false)
        }
    }
    load()
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const filteredResult = allUsers.filter(user => user.nom.toLowerCase().includes(search.toLowerCase()) || user.prenom.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()))
      setResults(filteredResult)
    }, 10)
    return () => clearTimeout(delayDebounce)
  }, [search])

  const toggleUser = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const handleAddAll = async () => {
    if (selectedUsers.length === 0) return
    setIsSubmitting(true)
    
    try {
      // Envoi de plusieurs requêtes ou adaptation de l'API pour un tableau/membres/route.ts]
      await Promise.all(
        selectedUsers.map(user => 
          fetch(`/api/ministeres/${ministereId}/membres`, {
            method: "POST",
            body: JSON.stringify({ userId: user.id })
          })
        )
      )
      router.refresh()
      onClose()
      setSelectedUsers([])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Ajouter des membres">
      <div className="space-y-6">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher par nom ou email..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Résultats de recherche */}
        <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>
          ) : results.map(user => (
            <div 
              key={user.id} 
              onClick={() => toggleUser(user)}
              className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className="text-sm">
                <p className="font-medium">{user.prenom} {user.nom}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              {selectedUsers.find(u => u.id === user.id) ? (
                <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : (
                <div className="h-5 w-5 border border-slate-300 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Liste des sélectionnés (Chips) */}
        {selectedUsers.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sélectionnés ({selectedUsers.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div key={user.id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                  {user.prenom}
                  <button onClick={() => toggleUser(user)}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          disabled={selectedUsers.length === 0 || issubmitting}
          onClick={handleAddAll}
        >
          {issubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
          Ajouter les membres sélectionnés
        </Button>
      </div>
    </Modal>
  )
}