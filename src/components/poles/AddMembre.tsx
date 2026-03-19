"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/ui/Modal"
import Button  from "@/components/ui/Button"
import  Input from "@/components/ui/Input"
import { Search, Loader2, UserPlus, Check } from "lucide-react"


interface User {
    id: string
    nom: string
    prenom: string
    email: string
  }

export function AddPoleMemberModal({ poleId, isOpen, onClose }: { poleId: string, isOpen: boolean, onClose: () => void }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)


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



  const handleAddMembers = async () => {
    setIsSubmitting(true)
    try {
      await Promise.all(
        selectedUsers.map(user => 
          fetch(`/api/poles/${poleId}/membres`, {
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
    <Modal open={isOpen} onClose={onClose} title="Ajouter des membres au pôle">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher..." 
            className="pl-10" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div className="max-h-[250px] overflow-y-auto border rounded-lg p-2">
          {results.map(user => (
            <div 
              key={user.id} 
              onClick={() => {
                const exists = selectedUsers.find(u => u.id === user.id)
                setSelectedUsers(exists ? selectedUsers.filter(u => u.id !== user.id) : [...selectedUsers, user])
              }}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <span className="text-sm font-medium">{user.prenom} {user.nom}</span>
              {selectedUsers.find(u => u.id === user.id) && <Check className="h-4 w-4 text-blue-600" />}
            </div>
          ))}
        </div>

        <Button 
          className="w-full" 
          disabled={selectedUsers.length === 0 || isSubmitting}
          onClick={handleAddMembers}
        >
          {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
          Confirmer l'ajout ({selectedUsers.length})
        </Button>
      </div>
    </Modal>
  )
}