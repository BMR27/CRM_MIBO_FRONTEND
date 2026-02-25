
"use client"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Configuración para Railway/producción
const BACKEND_URL = "https://crmmibobackend-production.up.railway.app";
const SERVICE_SID = process.env.NEXT_PUBLIC_TWILIO_SERVICE_SID || "" // Debe estar en .env

const CONTACTS = [
  { id: 1, name: "Ana Martinez", phone: "+52 1 555 123 4567" },
  { id: 2, name: "Roberto Perez", phone: "+52 1 555 987 6543" },
  { id: 3, name: "Laura Hernandez", phone: "+52 1 555 456 7890" },
  { id: 4, name: "Carlos Gomez", phone: "+52 1 555 111 2233" },
  { id: 5, name: "Diana Flores", phone: "+52 1 555 444 5566" },
  { id: 6, name: "Miguel Torres", phone: "+52 1 555 777 8899" },
  { id: 7, name: "Sofia Ramirez", phone: "+52 1 555 333 2211" }
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}


export default function PlantillasWASection() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [searchContact, setSearchContact] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string|null>(null)

  const [waTemplates, setWATemplates] = useState<any[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const router = useRouter()

  // Cargar contactos reales desde backend
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true)
      try {
        const res = await fetch("/api/contacts", { method: "GET" })
        const data = await res.json()
        if (Array.isArray(data)) {
          setContacts(data)
        } else if (Array.isArray(data.contacts)) {
          setContacts(data.contacts)
        } else {
          setContacts([])
        }
      } catch {
        setContacts([])
      } finally {
        setLoadingContacts(false)
      }
    }
    fetchContacts()
  }, [])

  // Cargar plantillas aprobadas reales desde Twilio
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const res = await fetch("/api/twilio/wa-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceSid: SERVICE_SID })
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setWATemplates(data)
        } else {
          setWATemplates([])
        }
      } catch {
        setWATemplates([])
      } finally {
        setLoadingTemplates(false)
      }
    }
    if (SERVICE_SID) fetchTemplates()
  }, [])

  // Buscar la plantilla de bienvenida (la primera aprobada)
  const bienvenidaTemplate = waTemplates[0]
  // Encuentra la plantilla seleccionada
  const selectedTplObj = waTemplates.find((t) => t.sid === selectedTemplate) || bienvenidaTemplate
  // Encuentra los contactos seleccionados
  const selectedContactsObj = contacts.filter(c => selectedContacts.includes(c.id))
  // Enviar plantilla vía backend
  const handleSendTemplate = async () => {
    if (!selectedTplObj || selectedContactsObj.length === 0) return;
    setSending(true)
    setSendResult(null)
    try {
      const results = await Promise.all(selectedContactsObj.map(async (contact) => {
        const variables = [contact.name]
        const res = await fetch(`${BACKEND_URL}/api/twilio/send-wa-template`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: contact.phone.replace(/\s/g, ""),
            from: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
            templateSid: selectedTplObj.sid,
            variables
          })
        })
        if (!res.ok) throw new Error(`Error enviando a ${contact.name}`)
        return `Mensaje enviado a ${contact.name}`
      }))
      setSendResult(results.join("\n"))
    } catch (err: any) {
      setSendResult(err.message || "Error enviando mensajes")
    } finally {
      setSending(false)
    }
  }


  // Abrir chat y enviar plantilla de bienvenida
  const handleChat = async (contact: any) => {
    try {
      // 1. Crear/obtener conversación
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
      const res = await fetch(`${BACKEND_URL}/api/conversations/ensure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: String(contact.id) })
      })
      const data = await res.json()
      if (!res.ok || !data?.conversation?.id) throw new Error("No se pudo abrir la conversación")
      // 2. Enviar plantilla de bienvenida como primer mensaje
      if (bienvenidaTemplate) {
        await fetch(`${BACKEND_URL}/api/twilio/send-wa-template`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: contact.phone.replace(/\s/g, ""),
            from: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
            templateSid: bienvenidaTemplate.sid,
            variables: [contact.name]
          })
        })
      }
      // 3. Redirigir al chat
      router.push(`/inbox/conversaciones?conversationId=${encodeURIComponent(data.conversation.id)}`)
    } catch (e: any) {
      setSendResult(e.message || "Error abriendo chat")
    }
  }

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchContact.toLowerCase())
  )

  const handleSelectAll = () => {
    setSelectedContacts(filteredContacts.map((c) => c.id))
    // Si no hay plantilla seleccionada, seleccionar bienvenida
    if (selectedTemplate == null) {
      setSelectedTemplate(bienvenidaTemplate.id)
    }
  }

  // Cuando seleccionas un contacto individual, si no hay plantilla seleccionada, seleccionar bienvenida
  const handleContactCheck = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
    if (selectedTemplate == null) {
      setSelectedTemplate(bienvenidaTemplate.id)
    }
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">Contactos</span>
        </div>
        <Input
          placeholder="Buscar contacto..."
          value={searchContact}
          onChange={(e) => setSearchContact(e.target.value)}
          className="mb-2"
        />
        <ScrollArea className="h-96 rounded-md border">
          <div className="flex flex-col gap-2 p-2">
            {loadingContacts ? (
              <div className="text-xs text-muted-foreground p-4">Cargando contactos...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-xs text-muted-foreground p-4">No hay contactos disponibles.</div>
            ) : filteredContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{contact.name}</div>
                  <div className="text-xs text-muted-foreground">{contact.phone_number || contact.phone}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleChat(contact)}>
                  Chatear
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
