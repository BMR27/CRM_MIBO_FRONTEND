
"use client"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { api, frontendApi } from "@/lib/api"

// Configuración para Railway/producción
const BACKEND_URL = "https://crmmibobackend-production.up.railway.app";
const SERVICE_SID = process.env.NEXT_PUBLIC_TWILIO_SERVICE_SID || "" // Debe estar en .env

interface TenantInfo {
  wa_templates_enabled: boolean
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}


export default function PlantillasWASection() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchContact, setSearchContact] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string|null>(null)

  const [waTemplates, setWATemplates] = useState<any[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const router = useRouter()

  // Cargar el espacio de trabajo para saber si las plantillas están habilitadas
  useEffect(() => {
    let active = true
    api
      .get("/api/tenants/me")
      .then(({ data }) => active && setTenant(data))
      .catch(() => active && setTenant(null))
      .finally(() => active && setLoadingTenant(false))
    return () => {
      active = false
    }
  }, [])

  const templatesEnabled = !!tenant?.wa_templates_enabled

  // Cargar contactos reales desde backend
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true)
      try {
        const { data } = await api.get("/api/contacts")
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
        const { data } = await api.post("/api/twilio/wa-templates", SERVICE_SID ? { serviceSid: SERVICE_SID } : {})
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
    fetchTemplates()
  }, [])

  // Buscar la plantilla de bienvenida (la primera aprobada)
  const bienvenidaTemplate = waTemplates[0]
  // Encuentra la plantilla seleccionada
  const selectedTplObj = waTemplates.find((t) => t.sid === selectedTemplate) || bienvenidaTemplate
  // Encuentra los contactos seleccionados
  const selectedContactsObj = contacts.filter(c => selectedContacts.includes(String(c.id)))
  // Enviar plantilla vía backend
  const handleSendTemplate = async () => {
    if (!templatesEnabled || !selectedTplObj || selectedContactsObj.length === 0) return;
    setSending(true)
    setSendResult(null)
    try {
      const results = await Promise.all(selectedContactsObj.map(async (contact) => {
        const variables = [contact.name]
        try {
          // Enviar plantilla
          const contactPhone = String(contact.phone_number || contact.phone || "")
          await api.post(`/api/twilio/send-wa-template`, {
            to: contactPhone.replace(/\s/g, ""),
            from: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_FROM || "whatsapp:+12602649030",
            contentSid: selectedTplObj.sid,
            variables
          })
          // Crear/obtener conversación para dejar rastro, pero un mensaje de texto libre
          // aquí normalmente fallará: WhatsApp solo permite texto libre después de que
          // el cliente responda a la plantilla (ventana de 24h). No se trata como error.
          try {
            let conversationId = contact.conversationId
            if (!conversationId) {
              const { data } = await api.post("/api/conversations", { contact_id: String(contact.id) });
              conversationId = data?.conversation?.id ? String(data.conversation.id) : "";
            }
            if (conversationId) {
              await api.post(`/api/conversations/${conversationId}/messages`, {
                content: "Mensaje de seguimiento después de la plantilla",
                message_type: "text",
              })
            }
          } catch {
            // Ignorado: esperado si el cliente aún no respondió a la plantilla.
          }
          return `Plantilla enviada a ${contact.name}`
        } catch (err: any) {
          throw new Error(`Error enviando a ${contact.name}: ${err?.response?.data?.error || err.message}`)
        }
      }))
      setSendResult(results.join("\n"))
    } catch (err: any) {
      setSendResult(err.message || "Error enviando mensajes")
    } finally {
      setSending(false)
    }
  }


  // Abrir chat reutilizando el historial existente del contacto.
  const handleChat = async (contact: any) => {
    try {
      const { data } = await frontendApi.post("/api/conversations/ensure", { contact_id: String(contact.id) });
      const conversationId = data?.conversation?.id ? String(data.conversation.id) : "";
      if (!conversationId) throw new Error("No se pudo abrir la conversación");
      router.push(`/inbox?conversationId=${encodeURIComponent(conversationId)}`)
    } catch (e: any) {
      setSendResult(e.message || "Error abriendo chat")
    }
  }

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchContact.toLowerCase())
  )

  const allSelected = filteredContacts.length > 0 && filteredContacts.every((c) => selectedContacts.includes(String(c.id)))

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedContacts([])
      return
    }
    setSelectedContacts(filteredContacts.map((c) => String(c.id)))
    // Si no hay plantilla seleccionada, seleccionar bienvenida
    if (selectedTemplate == null && bienvenidaTemplate) {
      setSelectedTemplate(bienvenidaTemplate.sid)
    }
  }

  // Cuando seleccionas un contacto individual, si no hay plantilla seleccionada, seleccionar bienvenida
  const handleContactCheck = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
    if (selectedTemplate == null && bienvenidaTemplate) {
      setSelectedTemplate(bienvenidaTemplate.sid)
    }
  }

  if (loadingTenant) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando espacio de trabajo...</div>
      </div>
    )
  }

  if (!templatesEnabled) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <Card className="w-full max-w-lg mx-auto p-6 text-center">
          <p className="font-semibold mb-1">Plantillas de WhatsApp no habilitadas</p>
          <p className="text-sm text-muted-foreground">
            El envío de plantillas de WhatsApp no está habilitado para tu espacio de trabajo. Contacta a soporte para activarlo.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <div className="w-full max-w-lg mx-auto space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Plantilla a enviar</span>
            {loadingTemplates && <span className="text-xs text-muted-foreground">Cargando plantillas...</span>}
          </div>
          {waTemplates.length === 0 ? (
            <div className="text-xs text-muted-foreground">No hay plantillas aprobadas disponibles.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {waTemplates.map((tpl) => (
                <label
                  key={tpl.sid}
                  className={cn(
                    "flex items-center gap-2 rounded-md border p-2 cursor-pointer text-sm",
                    selectedTemplate === tpl.sid && "border-primary bg-accent"
                  )}
                >
                  <input
                    type="radio"
                    name="wa-template"
                    checked={selectedTemplate === tpl.sid}
                    onChange={() => setSelectedTemplate(tpl.sid)}
                  />
                  <span>{tpl.friendly_name || tpl.name || tpl.sid}</span>
                </label>
              ))}
            </div>
          )}
        </Card>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-lg">Contactos</span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
              Seleccionar todos
            </label>
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
                <div key={contact.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedContacts.includes(String(contact.id))}
                    onCheckedChange={() => handleContactCheck(String(contact.id))}
                  />
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

        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            disabled={sending || !selectedTplObj || selectedContactsObj.length === 0}
            onClick={handleSendTemplate}
          >
            {sending ? "Enviando..." : `Enviar plantilla a ${selectedContactsObj.length} contacto(s)`}
          </Button>
          {selectedContactsObj.length > 0 && (
            <Badge variant="outline">{selectedContactsObj.length} seleccionados</Badge>
          )}
        </div>

        {sendResult && (
          <div className="text-xs whitespace-pre-line rounded-md border p-2 text-muted-foreground">{sendResult}</div>
        )}
      </div>
    </div>
  )
}
