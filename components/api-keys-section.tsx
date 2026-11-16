"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KeyRound, Copy, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

interface ApiKeyRow {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export function ApiKeysSection() {
  const { t } = useLanguage()
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadKeys = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/api/api-keys")
      setKeys(data)
      setError("")
    } catch (err) {
      setError(t("ak.loadFail"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKeys()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setError("")
    try {
      const { data } = await api.post("/api/api-keys", { name: newName.trim() })
      setRevealedKey(data.key)
      setNewName("")
      await loadKeys()
    } catch (err) {
      setError(t("ak.createFail"))
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await api.patch(`/api/api-keys/${id}/revoke`)
      await loadKeys()
    } catch (err) {
      setError(t("ak.revokeFail"))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">{t("ak.sectionTitle")}</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setRevealedKey(null) }}>
          <Button variant="outline" className="gap-2" onClick={() => setDialogOpen(true)}>
            <KeyRound className="h-4 w-4" />
            {t("ak.generate")}
          </Button>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("ak.newKey")}</DialogTitle>
              <DialogDescription>
                {t("ak.newKeyDescPrefix")}{" "}
                <code className="text-xs">POST /api/public/leads</code> {t("ak.newKeyDescSuffix")}{" "}
                <code className="text-xs">X-API-Key</code>.
              </DialogDescription>
            </DialogHeader>

            {revealedKey ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-muted p-3 font-mono text-sm break-all">
                  {revealedKey}
                </div>
                <p className="text-xs text-destructive">
                  {t("ak.saveNowWarning")}
                </p>
                <Button variant="outline" className="gap-2 w-full" onClick={() => copyToClipboard(revealedKey)}>
                  <Copy className="h-4 w-4" />
                  {t("ak.copy")}
                </Button>
                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-foreground">{t("ak.embeddableForm")}</p>
                  <p className="text-xs text-muted-foreground break-all font-mono">
                    {typeof window !== "undefined" ? window.location.origin : ""}/lead-form?key={revealedKey}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("ak.iframeHint")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="key-name">{t("contacts.name")}</Label>
                  <Input
                    id="key-name"
                    placeholder={t("ak.namePlaceholder")}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={creating}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              {revealedKey ? (
                <Button onClick={() => { setDialogOpen(false); setRevealedKey(null) }}>{t("ak.done")}</Button>
              ) : (
                <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                  {creating ? t("ak.generating") : t("ak.generate")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("ak.loading")}</p>
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("ak.empty")}</p>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium text-foreground">{k.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {k.key_prefix}••••••••{k.is_active ? "" : ` · ${t("ak.revoked")}`}
                </p>
                {k.last_used_at && (
                  <p className="text-xs text-muted-foreground">
                    {t("ak.lastUsed")} {new Date(k.last_used_at).toLocaleString()}
                  </p>
                )}
              </div>
              {k.is_active && (
                <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={() => handleRevoke(k.id)}>
                  <Trash2 className="h-4 w-4" />
                  {t("ak.revoke")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
