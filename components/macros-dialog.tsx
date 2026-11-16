"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/language-provider"

interface Macro {
  id: number
  title: string
  content: string
  shortcut: string
  usage_count: number
  created_by_name: string
}

interface MacrosDialogProps {
  onSelectMacro: (content: string, macroId: number) => void
}

export function MacrosDialog({ onSelectMacro }: MacrosDialogProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [macros, setMacros] = useState<Macro[]>([])
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [newMacro, setNewMacro] = useState({ title: "", content: "", shortcut: "" })

  useEffect(() => {
    if (open) {
      fetchMacros()
    }
  }, [open])

  const fetchMacros = async () => {
    try {
      const response = await fetch("/api/macros")
      const data = await response.json()
      setMacros(data.macros || [])
    } catch (error) {
      console.error("[v0] Fetch macros error:", error)
    }
  }

  const handleCreateMacro = async () => {
    if (!newMacro.title || !newMacro.content) return

    try {
      const response = await fetch("/api/macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMacro),
      })

      if (response.ok) {
        setNewMacro({ title: "", content: "", shortcut: "" })
        setShowCreate(false)
        fetchMacros()
      }
    } catch (error) {
      console.error("[v0] Create macro error:", error)
    }
  }

  const handleUseMacro = async (macro: Macro) => {
    // Increment usage count
    await fetch(`/api/macros/${macro.id}/use`, { method: "POST" })
    onSelectMacro(macro.content, macro.id)
    setOpen(false)
  }

  const filteredMacros = macros.filter(
    (macro) =>
      macro.title.toLowerCase().includes(search.toLowerCase()) ||
      macro.content.toLowerCase().includes(search.toLowerCase()) ||
      macro.shortcut?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Macros
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("macros.title")}</DialogTitle>
          <DialogDescription>{t("macros.desc")}</DialogDescription>
        </DialogHeader>

        {!showCreate ? (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("macros.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowCreate(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("macros.new")}
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredMacros.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground text-sm">{t("macros.notFound")}</p>
                ) : (
                  filteredMacros.map((macro) => (
                    <button
                      key={macro.id}
                      onClick={() => handleUseMacro(macro)}
                      className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-semibold text-sm">{macro.title}</h3>
                        <div className="flex gap-2">
                          {macro.shortcut && (
                            <Badge variant="outline" className="text-xs">
                              {macro.shortcut}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {macro.usage_count} {t("macros.usesSuffix")}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{macro.content}</p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("macros.titleLabel")}</Label>
              <Input
                id="title"
                placeholder={t("macros.titlePlaceholder")}
                value={newMacro.title}
                onChange={(e) => setNewMacro({ ...newMacro, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("macros.contentLabel")}</Label>
              <Textarea
                id="content"
                placeholder={t("macros.contentPlaceholder")}
                value={newMacro.content}
                onChange={(e) => setNewMacro({ ...newMacro, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortcut">{t("macros.shortcutLabel")}</Label>
              <Input
                id="shortcut"
                placeholder={t("macros.shortcutPlaceholder")}
                value={newMacro.shortcut}
                onChange={(e) => setNewMacro({ ...newMacro, shortcut: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateMacro} disabled={!newMacro.title || !newMacro.content}>
                {t("macros.create")}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                {t("macros.cancel")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
