"use client"

import type React from "react"

import { frontendApi } from "@/lib/api"
import { useEffect, useMemo, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, MessageCircle, Pencil, Search, Trash2, Users } from "lucide-react"
import { cn, formatContactDisplayName, getContactAvatarText } from "@/lib/utils"
import { useContacts, type Contact } from "@/hooks/use-contacts"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"

function stripWhatsappPrefix(value: string) {
  return String(value || "").replace(/^whatsapp:/i, "")
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
}

interface ContactsListProps {
  selectedId?: string
  onSelect?: (contact: Contact) => void
  onChat: (contact: Contact) => void
  headerRight?: React.ReactNode
  onDeleted?: (deletedId: string | number) => void
}

type DeleteMode = "single" | "selected" | "all"

export function ContactsList({ selectedId, onSelect, onChat, headerRight, onDeleted }: ContactsListProps) {
  const { t } = useLanguage()
  const { contacts, stats, loading, error, refetch } = useContacts()
  const [query, setQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkSelected, setBulkSelected] = useState(false)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState<string | number | null>(null)
  const [editChannel, setEditChannel] = useState<string>("whatsapp")
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editExternal, setEditExternal] = useState("")

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteMode, setDeleteMode] = useState<DeleteMode>("single")
  const [deleteId, setDeleteId] = useState<string | number | null>(null)
  const [deleteLabel, setDeleteLabel] = useState<string>("")

  useEffect(() => {
    const existingIds = new Set(contacts.map((contact) => String(contact.id)))
    setSelectedIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => existingIds.has(id)))
      return next.size === prev.size ? prev : next
    })
    setExcludedIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => existingIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [contacts])

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts

    return contacts.filter((c) => {
      const channel = String(c.channel || "whatsapp")
      const name = formatContactDisplayName(c.name || "", channel).toLowerCase()
      const phone = formatContactDisplayName(c.phone_number || "", channel).toLowerCase()
      const ext = String(c.external_user_id || "").toLowerCase()
      const id = String(c.id || "").toLowerCase()
      return name.includes(q) || phone.includes(q) || ext.includes(q) || id.includes(q)
    })
  }, [contacts, query])

  const visibleIds = useMemo(() => filteredContacts.map((contact) => String(contact.id)), [filteredContacts])
  const excludedVisibleCount = visibleIds.filter((id) => excludedIds.has(id)).length
  const selectedCount = bulkSelected
    ? Math.max(visibleIds.length - excludedVisibleCount, 0)
    : selectedIds.size
  const selectedVisibleCount = bulkSelected
    ? Math.max(visibleIds.length - excludedVisibleCount, 0)
    : visibleIds.filter((id) => selectedIds.has(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const selectedContactIds = () => (
    bulkSelected
      ? filteredContacts.map((contact) => String(contact.id)).filter((id) => !excludedIds.has(id))
      : Array.from(selectedIds)
  )
  const isContactSelected = (id: string) => bulkSelected ? !excludedIds.has(id) : selectedIds.has(id)

  const toggleSelectAllVisible = (checked: boolean) => {
    setBulkSelected(checked)
    setSelectedIds(new Set())
    setExcludedIds(new Set())
  }

  const toggleSelectContact = (id: string, checked: boolean) => {
    if (bulkSelected) {
      setExcludedIds((prev) => {
        const next = new Set(prev)
        if (checked) next.delete(id)
        else next.add(id)
        return next
      })
      return
    }

    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const openEdit = (c: Contact) => {
    setEditId(c.id)
    setEditChannel(String(c.channel || "whatsapp"))
    setEditName(String(c.name || ""))
    setEditPhone(stripWhatsappPrefix(String(c.phone_number || "")))
    setEditExternal(String(c.external_user_id || ""))
    setEditOpen(true)
  }

  const openDelete = (c: Contact) => {
    setDeleteMode("single")
    setDeleteId(c.id)
    setDeleteLabel(String(c.name || c.phone_number || c.external_user_id || c.id))
    setDeleteOpen(true)
  }

  const openDeleteSelected = () => {
    if (selectedCount === 0) return
    setDeleteMode("selected")
    setDeleteId(null)
    setDeleteLabel(`${selectedCount} ${selectedCount === 1 ? t("cl.contactSelected") : t("cl.contactsSelected")}`)
    setDeleteOpen(true)
  }

  const openDeleteAll = () => {
    if (stats.total === 0) return
    setDeleteMode("all")
    setDeleteId(null)
    setDeleteLabel(`${stats.total} ${stats.total === 1 ? t("cl.contactWord") : t("cl.contactsWord")}`)
    setDeleteOpen(true)
  }

  const handleSaveEdit = async () => {
    if (editId === null) return

    const cleanPhone = (phone: string) => {
      if (!phone) return ""
      let cleaned = phone.replace(/\s+/g, "")
      if (!cleaned.startsWith("+")) cleaned = `+${cleaned.replace(/^\+/, "")}`
      return cleaned
    }

    try {
      setEditing(true)
      await frontendApi.patch(`/api/contacts/${encodeURIComponent(String(editId))}`, {
        name: editName,
        phone_number: cleanPhone(editPhone),
        external_user_id: editExternal,
      })
      toast({ title: t("cl.toast.updatedTitle"), description: t("cl.toast.updatedDesc") })
      setEditOpen(false)
      await refetch()
    } catch (e) {
      toast({
        title: t("contacts.error"),
        description: e instanceof Error ? e.message : t("cl.toast.updateFailDesc"),
        variant: "destructive",
      })
    } finally {
      setEditing(false)
    }
  }

  const deleteOne = async (id: string | number) => {
    const response = await frontendApi.delete(`/api/contacts/${encodeURIComponent(String(id))}`)
    return response.data
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      let deletedCount = 0

      if (deleteMode === "all") {
        const response = await frontendApi.delete("/api/contacts")
        deletedCount = Number(response.data?.deleted || 0)
        setSelectedIds(new Set())
        setBulkSelected(false)
        setExcludedIds(new Set())
        toast({
          title: t("cl.toast.deletedManyTitle"),
          description: `${deletedCount} ${deletedCount === 1 ? t("cl.contactWord") : t("cl.contactsWord")}.`,
        })
      } else if (deleteMode === "selected") {
        const ids = selectedContactIds()
        const response = await frontendApi.delete("/api/contacts", { data: { ids } })
        deletedCount = Number(response.data?.deleted || ids.length)
        setSelectedIds(new Set())
        setBulkSelected(false)
        setExcludedIds(new Set())
        toast({
          title: t("cl.toast.deletedManyTitle"),
          description: `${deletedCount} ${deletedCount === 1 ? t("cl.contactWord") : t("cl.contactsWord")}.`,
        })
      } else if (deleteId !== null) {
        await deleteOne(deleteId)
        deletedCount = 1
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(String(deleteId))
          return next
        })
        setExcludedIds((prev) => {
          const next = new Set(prev)
          next.delete(String(deleteId))
          return next
        })
        onDeleted?.(String(deleteId))
        toast({ title: t("cl.toast.deletedOneTitle"), description: t("cl.toast.deletedOneDesc") })
      }

      setDeleteOpen(false)
      await refetch()
    } catch (e) {
      toast({
        title: t("contacts.error"),
        description: e instanceof Error ? e.message : t("cl.toast.deleteFailDesc"),
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full p-3">
        <div className="h-full rounded-xl border bg-card shadow-sm flex items-center justify-center">
          <p className="text-muted-foreground text-sm">{t("cl.loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full p-3">
        <div className="h-full rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center p-4 gap-3">
          <p className="text-red-500 text-sm text-center">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            {t("cl.retry")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-3 pr-4">
      <div className="h-full rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold">{t("cl.title")}</p>
              <p className="text-xs text-muted-foreground">{t("cl.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedCount === 0 || deleting}
                onClick={openDeleteSelected}
                className="text-red-600 hover:text-red-700"
              >
                {deleting && deleteMode === "selected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting && deleteMode === "selected" ? t("cl.deleting") : t("cl.deleteSelected")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={stats.total === 0 || deleting}
                onClick={openDeleteAll}
                className="text-red-600 hover:text-red-700"
              >
                {deleting && deleteMode === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting && deleteMode === "all" ? t("cl.deleting") : t("cl.deleteAll")}
              </Button>
              {headerRight}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                {t("cl.total")}
              </div>
              <p className="mt-1 text-xl font-semibold">{stats.total}</p>
            </div>
            <div className="rounded-lg border bg-background px-3 py-2">
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <p className="mt-1 text-xl font-semibold text-green-700">{stats.whatsapp}</p>
            </div>
            <div className="rounded-lg border bg-background px-3 py-2">
              <p className="text-xs text-muted-foreground">{t("cl.selected")}</p>
              <p className="mt-1 text-xl font-semibold">{selectedCount}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("cl.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("cl.showing")} {filteredContacts.length} {t("cl.of")} {stats.total}</span>
            {!!query.trim() && (
              <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                {t("cl.clear")}
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {filteredContacts.length === 0 ? (
            <div className="m-4 rounded-lg border bg-background p-8 text-center text-sm text-muted-foreground">
              {contacts.length === 0 ? t("cl.noContacts") : t("cl.noResults")}
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-10 px-4">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                      onCheckedChange={(value) => toggleSelectAllVisible(value === true)}
                      aria-label={t("cl.selectVisible")}
                    />
                  </TableHead>
                  <TableHead>{t("cl.contact")}</TableHead>
                  <TableHead>{t("cl.channel")}</TableHead>
                  <TableHead>{t("cl.phoneOrId")}</TableHead>
                  <TableHead>{t("cl.created")}</TableHead>
                  <TableHead className="text-right pr-4">{t("cl.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((c) => {
                  const channel = String(c.channel || "whatsapp")
                  const displayName = formatContactDisplayName(c.name || c.phone_number, channel)
                  const secondary = formatContactDisplayName(c.phone_number || c.external_user_id || "", channel)
                  const rowSelected = selectedId === String(c.id)
                  const checked = isContactSelected(String(c.id))

                  return (
                    <TableRow
                      key={String(c.id)}
                      data-state={rowSelected ? "selected" : undefined}
                      className={cn("cursor-pointer", rowSelected && "bg-primary/10")}
                      onClick={() => onSelect?.(c)}
                    >
                      <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => toggleSelectContact(String(c.id), value === true)}
                          aria-label={`${t("cl.selectVisible")} ${displayName || t("chat.contactFallback")}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-[260px] items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                              {getContactAvatarText(displayName, channel)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-sm">{displayName || t("chat.contactFallback")}</p>
                            <p className="text-xs text-muted-foreground">ID {String(c.id)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            channel === "facebook"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-green-200 bg-green-50 text-green-700",
                          )}
                        >
                          {channel === "facebook" ? "Facebook" : "WhatsApp"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate text-muted-foreground">{secondary || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" disabled={deleting} onClick={() => onChat(c)}>
                            <MessageCircle className="h-4 w-4" />
                            {t("cl.chat")}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-9 w-9" disabled={deleting} onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-red-600 hover:text-red-700"
                            disabled={deleting}
                            onClick={() => openDelete(c)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cl.updateContact")}</DialogTitle>
            <DialogDescription>
              {t("cl.updateContactDesc")} <span className="font-medium">{editChannel}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("contacts.name")}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder={t("contacts.namePlaceholder")} />
            </div>

            {String(editChannel).toLowerCase() === "facebook" ? (
              <div className="grid gap-2">
                <Label>{t("contacts.psidLabel")}</Label>
                <Input value={editExternal} onChange={(e) => setEditExternal(e.target.value)} placeholder={t("contacts.psidPlaceholder")} />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>{t("contacts.phone")}</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder={t("contacts.phonePlaceholder")} />
                <p className="text-xs text-muted-foreground">{t("cl.phoneNormalizeHint")}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editing}>
              {t("chat.cancel")}
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={editing}>
              {editing ? t("details.saving") : t("chat.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteMode === "all" ? t("cl.deleteAllTitle") : deleteMode === "selected" ? t("cl.deleteSelectedTitle") : t("cl.deleteOneTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("cl.deleteConfirmPrefix")} {deleteMode === "single" ? t("cl.deleteConfirmSingle") : t("cl.deleteConfirmSelection")}{" "}
              <span className="font-medium">{deleteLabel}</span>.
              {deleteMode === "all" ? ` ${t("cl.deleteAllExtra")}` : null}
            </AlertDialogDescription>
            {deleting ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("cl.deletingWait")}
              </div>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("chat.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("cl.deleting")}
                </>
              ) : (
                t("chat.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
