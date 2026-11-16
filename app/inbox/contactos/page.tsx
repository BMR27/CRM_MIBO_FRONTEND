"use client"

import { useState, type ChangeEvent } from "react"
import { frontendApi } from "@/lib/api"
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
import { Loader2, Upload } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function ContactosPage() {
    const { t } = useLanguage()
    // Normaliza el número de teléfono al formato internacional sin espacios
    const cleanPhone = (phone: string) => {
      if (!phone) return "";
      let cleaned = phone.replace(/\s+/g, "");
      if (!cleaned.startsWith("+")) cleaned = "+" + cleaned.replace(/^\+/, "");
      return cleaned;
    };

    // Validación de formato internacional E.164
    const isValidPhone = (phone: string) => {
      return /^\+[1-9]\d{9,14}$/.test(phone);
    };

    // Crear contacto
    const handleCreateContact = async () => {
      const phoneToSend = cleanPhone(newPhone);
      if (newChannel === "whatsapp" && !isValidPhone(phoneToSend)) {
        toast({
          title: t("contacts.invalidPhoneTitle"),
          description: t("contacts.invalidPhoneDesc"),
          variant: "destructive"
        });
        return;
      }
      try {
        setCreating(true)
        const res = await frontendApi.post("/api/contacts", {
          name: newName,
          channel: newChannel,
          phone_number: newChannel === "whatsapp" ? phoneToSend : undefined,
          external_user_id: newChannel === "facebook" ? newExternalUserId : undefined,
        })
        if (res.status !== 201 && res.status !== 200) {
          toast({ title: t("contacts.error"), description: res.data?.error || t("contacts.createFail"), variant: "destructive" })
          return
        }
        toast({ title: t("contacts.createdTitle"), description: t("contacts.createdDesc") })
        setNewOpen(false)
        setNewName("")
        setNewPhone("")
        setNewExternalUserId("")
        setRefreshKey((p) => p + 1)
      } catch (e) {
        toast({ title: t("contacts.error"), description: e instanceof Error ? e.message : t("contacts.createFail"), variant: "destructive" })
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
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFileName, setImportFileName] = useState("")
  const [pendingImportContacts, setPendingImportContacts] = useState<any[]>([])

  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(String(contact.id))
  }

  // Al chatear: abre la conversación existente del contacto o la crea solo si no hay historial.
  const handleChatContact = async (contact: Contact) => {
    setSelectedContactId(String(contact.id))
    try {
      const { data } = await frontendApi.post("/api/conversations/ensure", {
        contact_id: String(contact.id),
      });
      const conversationId = data?.conversation?.id ? String(data.conversation.id) : "";
      if (!conversationId) throw new Error("No se pudo crear/obtener la conversación");
      toast({
        title: data?.created ? t("contacts.convCreatedTitle") : t("contacts.convOpenedTitle"),
        description: data?.created ? t("contacts.convCreatedDesc") : t("contacts.convOpenedDesc"),
      })
      router.push(`/inbox?conversationId=${encodeURIComponent(conversationId)}`);
    } catch (e) {
      toast({ title: t("contacts.error"), description: e instanceof Error ? e.message : t("contacts.convOpenFail"), variant: "destructive" })
    }
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFileName(file.name)
    try {
      const XLSX = await import("xlsx")
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[]
      const contacts = rows
        .map((row) => ({
          name: row.name || row.nombre || row.Nombre || row.CLIENTE || row.Cliente || "",
          phone_number: row.phone_number || row.telefono || row.Teléfono || row.Telefono || row.PHONE_A || row.phone || "",
          channel: row.channel || row.canal || "whatsapp",
          external_user_id: row.external_user_id || row.externalUserId || "",
        }))
        .filter((contact) => String(contact.phone_number || contact.external_user_id || "").trim())

      setPendingImportContacts(contacts)
      toast({
        title: t("contacts.fileReadTitle"),
        description: `${contacts.length} ${contacts.length === 1 ? t("contacts.fileReadDescOne") : t("contacts.fileReadDescMany")}`,
      })
    } catch {
      setPendingImportContacts([])
      toast({
        title: t("contacts.fileReadErrorTitle"),
        description: t("contacts.fileReadErrorDesc"),
        variant: "destructive",
      })
    }
  }

  const handleImportContacts = async () => {
    if (pendingImportContacts.length === 0) {
      toast({
        title: t("contacts.noContactsTitle"),
        description: t("contacts.noContactsDesc"),
        variant: "destructive",
      })
      return
    }

    try {
      setImporting(true)
      const { data } = await frontendApi.post("/api/contacts/import", { contacts: pendingImportContacts })
      toast({
        title: t("contacts.importedTitle"),
        description: `${data.imported || 0} ${t("contacts.importedCreated")}, ${data.updated || 0} ${t("contacts.importedUpdated")}, ${data.failed || 0} ${t("contacts.importedFailed")}.`,
      })
      setImportOpen(false)
      setImportFileName("")
      setPendingImportContacts([])
      setRefreshKey((p) => p + 1)
    } catch (error) {
      toast({
        title: t("contacts.importErrorTitle"),
        description: error instanceof Error ? error.message : t("contacts.importErrorDesc"),
        variant: "destructive",
      })
    } finally {
      setImporting(false)
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
              <div className="flex flex-wrap items-center gap-2">
                <Dialog open={importOpen} onOpenChange={setImportOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      {t("contacts.bulkImport")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("contacts.bulkImportTitle")}</DialogTitle>
                      <DialogDescription>
                        {t("contacts.bulkImportDesc")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} />
                      <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                        {importFileName ? (
                          <span>{importFileName}: {pendingImportContacts.length} {pendingImportContacts.length === 1 ? t("contacts.detectedOne") : t("contacts.detectedMany")}</span>
                        ) : (
                          <span>{t("contacts.recommendedFormat")}</span>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>
                        {t("chat.cancel")}
                      </Button>
                      <Button onClick={() => void handleImportContacts()} disabled={importing || pendingImportContacts.length === 0}>
                        {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t("contacts.import")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={newOpen} onOpenChange={setNewOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">{t("contacts.new")}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("contacts.newContact")}</DialogTitle>
                      <DialogDescription>
                        {t("contacts.newContactDesc")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>{t("contacts.channel")}</Label>
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
                        <Label>{t("contacts.name")}</Label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("contacts.namePlaceholder")} />
                      </div>
                      {newChannel === "whatsapp" ? (
                        <div className="grid gap-2">
                          <Label>{t("contacts.phone")}</Label>
                          <Input
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder={t("contacts.phonePlaceholder")}
                          />
                          <p className="text-xs text-muted-foreground">{t("contacts.phoneHint")}</p>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          <Label>{t("contacts.psidLabel")}</Label>
                          <Input
                            value={newExternalUserId}
                            onChange={(e) => setNewExternalUserId(e.target.value)}
                            placeholder={t("contacts.psidPlaceholder")}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewOpen(false)} disabled={creating}>
                        {t("chat.cancel")}
                      </Button>
                      <Button onClick={() => void handleCreateContact()} disabled={creating}>
                        {creating ? t("contacts.creating") : t("contacts.create")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            }
          />
        </div>
      </div>
    </>
  )
}
