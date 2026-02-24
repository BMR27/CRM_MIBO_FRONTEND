
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const WA_TEMPLATES = [
  {
    id: 1,
    name: "Bienvenida",
    content: "Hola {{1}}, bienvenido a LogiMarket. Estamos para ayudarte con tu pedido...",
    status: "Aprobada",
    category: "Marketing",
    sid: "HX6d98a259b100a6..."
  },
  {
    id: 2,
    name: "Seguimiento de envio",
    content: "Hola {{1}}, tu pedido {{2}} ha sido enviado. Tracking: {{3}}. Llegara el {{4}}.",
    status: "Aprobada",
    category: "Utilidad",
    sid: "HX7e89b360c211b7..."
  },
  {
    id: 3,
    name: "Confirmacion de pago",
    content: "Hola {{1}}, confirmamos tu pago de ${{2}} MXN para el pedido {{3}}. Gracias por tu compra!",
    status: "Aprobada",
    category: "Utilidad",
    sid: "HX8f90c471d322c8..."
  }
]

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

  // Buscar la plantilla de bienvenida (la primera por defecto)
  const bienvenidaTemplate = WA_TEMPLATES[0]

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase())
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
    <div className="flex gap-4 h-full w-full">
      {/* Panel izquierdo */}
      <div className="w-80 flex flex-col gap-4 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Plantillas Twilio</span>
          <Button size="sm" variant="outline" className="gap-1">
            <Plus className="w-4 h-4" /> Nueva
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2 min-w-0">
          <Button size="sm" variant="secondary" className="min-w-[90px]">Todas</Button>
          <Button size="sm" variant="outline" className="min-w-[90px]">Aprobadas</Button>
          <Button size="sm" variant="outline" className="min-w-[90px]">Pendientes</Button>
        </div>
        <ScrollArea className="h-full">
          <div className="space-y-4 p-1 pr-2">
            {WA_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={cn(
                  "relative w-full rounded-lg border bg-background px-4 py-3 text-left shadow-sm transition-[box-shadow,background-color,border-color] duration-150 cursor-pointer hover:z-10",
                  selectedTemplate === tpl.id
                    ? "z-10 border-primary/60 bg-primary/10 ring-2 ring-inset ring-primary/25 shadow-md"
                    : "border-border/70 hover:border-border hover:shadow-md",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                        {tpl.name.slice(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <h3 className="min-w-0 truncate font-bold text-sm text-foreground">
                        {tpl.name}
                      </h3>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">{tpl.status}</Badge>
                        <Badge variant="secondary" className="text-xs">{tpl.category}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {tpl.content}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">SID: {tpl.sid}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Panel central */}
      <div className="flex-1 flex flex-col items-center justify-center border rounded-md min-h-[400px] mx-2">
        {!selectedTemplate ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <span className="text-4xl mb-2">📄</span>
            <span>Selecciona una plantilla para configurar el envío</span>
          </div>
        ) : (
          <div className="p-8">Configurar envío para plantilla seleccionada</div>
        )}
      </div>

      {/* Panel derecho */}
      <div className="w-64 flex flex-col gap-2 max-w-xs flex-grow border rounded-md bg-white h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Contactos</span>
          <Button size="sm" variant="outline" onClick={handleSelectAll}>Seleccionar todos</Button>
        </div>
        <Input
          placeholder="Buscar contacto..."
          value={searchContact}
          onChange={(e) => setSearchContact(e.target.value)}
          className="mb-2"
        />
        <ScrollArea className="flex-1 h-80 rounded-md border">
          <div className="flex flex-col gap-2 p-2">
            {filteredContacts.map((contact) => (
              <label key={contact.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => handleContactCheck(contact.id)}
                  className="accent-primary"
                />
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{contact.name}</div>
                  <div className="text-xs text-muted-foreground">{contact.phone}</div>
                </div>
              </label>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
