"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KeyRound, Copy, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

interface ApiKeyRow {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export function ApiKeysSection() {
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
      setError("No se pudieron cargar las API keys")
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
      setError("No se pudo generar la API key")
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await api.patch(`/api/api-keys/${id}/revoke`)
      await loadKeys()
    } catch (err) {
      setError("No se pudo revocar la API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">API Keys — Captura de leads</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setRevealedKey(null) }}>
          <Button variant="outline" className="gap-2" onClick={() => setDialogOpen(true)}>
            <KeyRound className="h-4 w-4" />
            Generar API key
          </Button>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva API key</DialogTitle>
              <DialogDescription>
                Úsala para enviar leads desde tu sitio web o sistemas externos vía{" "}
                <code className="text-xs">POST /api/public/leads</code> con el header{" "}
                <code className="text-xs">X-API-Key</code>.
              </DialogDescription>
            </DialogHeader>

            {revealedKey ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-muted p-3 font-mono text-sm break-all">
                  {revealedKey}
                </div>
                <p className="text-xs text-destructive">
                  Guarda esta key ahora: no volverá a mostrarse completa.
                </p>
                <Button variant="outline" className="gap-2 w-full" onClick={() => copyToClipboard(revealedKey)}>
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-foreground">Formulario web embebible</p>
                  <p className="text-xs text-muted-foreground break-all font-mono">
                    {typeof window !== "undefined" ? window.location.origin : ""}/lead-form?key={revealedKey}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ponlo en un &lt;iframe&gt; en tu sitio para capturar leads directo al CRM.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Nombre</Label>
                  <Input
                    id="key-name"
                    placeholder="Sitio web principal"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={creating}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              {revealedKey ? (
                <Button onClick={() => { setDialogOpen(false); setRevealedKey(null) }}>Listo</Button>
              ) : (
                <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                  {creating ? "Generando..." : "Generar API key"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no has generado ninguna API key.</p>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium text-foreground">{k.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {k.key_prefix}••••••••{k.is_active ? "" : " · revocada"}
                </p>
                {k.last_used_at && (
                  <p className="text-xs text-muted-foreground">
                    Último uso: {new Date(k.last_used_at).toLocaleString()}
                  </p>
                )}
              </div>
              {k.is_active && (
                <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={() => handleRevoke(k.id)}>
                  <Trash2 className="h-4 w-4" />
                  Revocar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
