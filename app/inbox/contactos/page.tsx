"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { InboxHeader } from "@/components/inbox-header"
import { ContactsList } from "@/components/contacts-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import type { Contact } from "@/hooks/use-contacts"

export default function ContactosPage() {
    // Normaliza el número de teléfono al formato internacional sin espacios
    const cleanPhone = (phone: string) => {
      if (!phone) return "";
      let cleaned = phone.replace(/\s+/g, "");
      if (!cleaned.startsWith("+")) cleaned = "+" + cleaned.replace(/^\+/, "");
      return cleaned;
    };

    // Crear contacto
    const handleCreateContact = async () => {
      try {
        setCreating(true)
        const res = await api.post("/api/api/contacts", {
          name: newName,
          channel: newChannel,
          phone_number: newChannel === "whatsapp" ? cleanPhone(newPhone) : undefined,
          external_user_id: newChannel === "facebook" ? newExternalUserId : undefined,
        })
        if (res.status !== 201 && res.status !== 200) {
          toast({ title: "Error", description: res.data?.error || "No se pudo crear el contacto", variant: "destructive" })
          return
        }
        toast({ title: "Contacto creado", description: "Ya puedes enviarle mensaje." })
        setNewOpen(false)
        setNewName("")
        setNewPhone("")
        setNewExternalUserId("")
        setRefreshKey((p) => p + 1)
      } catch (e) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "No se pudo crear el contacto", variant: "destructive" })
      } finally {
        setCreating(false)
      }
    }
  const router = useRouter()
  const [selectedContactId, setSelectedContactId] = useState<string>()
  const [refreshKey, setRefreshKey] = useState(0)

  const [newOpen, setNewOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newChannel, setNewChannel] = useState<"whatsapp" | "facebook">("whatsapp")
  const [newPhone, setNewPhone] = useState("")
  const [newExternalUserId, setNewExternalUserId] = useState("")

  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(String(contact.id))
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
  // DEBUG: Mostrar el valor real de la variable en consola
  if (typeof window !== "undefined") {
    // Solo en cliente
    console.log("[DEBUG] NEXT_PUBLIC_BACKEND_URL:", process.env.NEXT_PUBLIC_BACKEND_URL)
    console.log("[DEBUG] BACKEND_URL usado:", BACKEND_URL)
  }

  // Al chatear: crea conversación y envía plantilla de bienvenida aprobada
  const handleChatContact = async (contact: Contact) => {
    setSelectedContactId(String(contact.id))
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      toast({ title: "No autenticado", description: "Debes iniciar sesión para crear una conversación.", variant: "destructive" });
      return;
    }
    try {
      // 1. Crear la conversación
      console.log("[CHAT] Creando conversación para contacto:", contact)
      const { data } = await api.post("/api/conversations", { contact_id: String(contact.id) });
      console.log("[CHAT] Respuesta de creación de conversación:", data)
      const conversationId = data?.conversation?.id ? String(data.conversation.id) : "";
      if (!conversationId) throw new Error("No se pudo crear/obtener la conversación");
      toast({ title: "Conversación creada", description: `ID: ${conversationId}` })

      // 2. Enviar plantilla de bienvenida
      let phone = contact.phone_number || "";
      if (phone.startsWith("whatsapp:")) {
        phone = phone.replace("whatsapp:", "");
      }
      // Usar siempre la plantilla aprobada
      const approvedTemplateSid = "HX99ead19f74793c6b5f0e1777523f1815"; // bienvenido_logi
      const from = "whatsapp:+15558046791";
      const variables = [contact.name || ""];
      console.log("[CHAT] Enviando plantilla aprobada:", { to: phone, from, contentSid: approvedTemplateSid, variables, conversation_id: conversationId })
      const tplRes = await api.post("/api/twilio/send-wa-template", {
        to: phone,
        from,
        contentSid: approvedTemplateSid,
        variables,
        conversation_id: conversationId
      });
      console.log("[CHAT] Respuesta de plantilla:", tplRes.data)
      toast({ title: "Plantilla enviada", description: "Se envió la plantilla de bienvenida." })

      // 3. Redirigir a la conversación
      console.log("[CHAT] Redirigiendo a /inbox?conversationId=", conversationId)
      router.push(`/inbox?conversationId=${encodeURIComponent(conversationId)}`);
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "No se pudo abrir la conversación ni enviar la plantilla", variant: "destructive" })
      console.error("[CHAT] Error en handleChatContact:", e)
    }
  }
  return (
    <>
      <InboxHeader />
      <div className="flex h-full flex-1 min-h-0 overflow-hidden">
        <div className="flex h-full w-full flex-col min-h-0">
          <ContactsList
            key={refreshKey}
            selectedId={selectedContactId}
            onSelect={handleSelectContact}
            onChat={handleChatContact}
            onDeleted={(deletedId) => {
              if (String(deletedId) === String(selectedContactId)) setSelectedContactId(undefined)
              setRefreshKey((p) => p + 1) // Fuerza el remount y refresca la lista
            }}
            headerRight={
              <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Nuevo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuevo contacto</DialogTitle>
                    <DialogDescription>
                      Crea un contacto para iniciar una conversación y enviarle mensajes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Canal</Label>
                      <select
                        value={newChannel}
                        onChange={(e) => setNewChannel(e.target.value === "facebook" ? "facebook" : "whatsapp")}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="facebook">Facebook</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Nombre</Label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej. Ana Martínez" />
                    </div>
                    {newChannel === "whatsapp" ? (
                      <div className="grid gap-2">
                        <Label>Teléfono</Label>
                        <Input
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="Ej. +52 1 5611 205 872"
                        />
                        <p className="text-xs text-muted-foreground">Puedes pegarlo con o sin espacios; se normaliza automáticamente.</p>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label>PSID (external_user_id)</Label>
                        <Input
                          value={newExternalUserId}
                          onChange={(e) => setNewExternalUserId(e.target.value)}
                          placeholder="Ej. 1234567890"
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewOpen(false)} disabled={creating}>
                      Cancelar
                    </Button>
                    <Button onClick={() => void handleCreateContact()} disabled={creating}>
                      {creating ? "Creando..." : "Crear"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          />
        </div>
      </div>
    </>
  )
}
