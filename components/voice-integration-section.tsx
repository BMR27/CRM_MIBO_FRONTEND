"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

interface VoiceIntegrationData {
  twilio_account_sid: string
  twilio_api_key_sid: string
  twiml_app_sid: string
  voice_number: string
  is_active: boolean
}

export function VoiceIntegrationSection() {
  const [data, setData] = useState<VoiceIntegrationData | null>(null)
  const [accountSid, setAccountSid] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [apiKeySid, setApiKeySid] = useState("")
  const [apiKeySecret, setApiKeySecret] = useState("")
  const [twimlAppSid, setTwimlAppSid] = useState("")
  const [voiceNumber, setVoiceNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/voice/integration")
        if (data) {
          setData(data)
          setAccountSid(data.twilio_account_sid || "")
          setApiKeySid(data.twilio_api_key_sid || "")
          setTwimlAppSid(data.twiml_app_sid || "")
          setVoiceNumber(data.voice_number || "")
        }
      } catch (err) {
        setError("No se pudo cargar la configuración de Voice")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!accountSid.trim() || !apiKeySid.trim() || !twimlAppSid.trim() || !voiceNumber.trim()) return
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const { data: result } = await api.patch("/api/voice/integration", {
        twilio_account_sid: accountSid.trim(),
        twilio_auth_token: authToken || undefined,
        twilio_api_key_sid: apiKeySid.trim(),
        twilio_api_key_secret: apiKeySecret || undefined,
        twiml_app_sid: twimlAppSid.trim(),
        voice_number: voiceNumber.trim(),
      })
      setData((prev) => ({ ...(prev as any), ...result }))
      setAuthToken("")
      setApiKeySecret("")
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError("No se pudo guardar la configuración de Voice")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando Voice...</p>

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Llamadas (Twilio Voice)</h3>
      <p className="text-xs text-muted-foreground">
        Permite hacer y recibir llamadas desde el navegador. Necesitas un TwiML App en Twilio con la Voice URL
        apuntando a <span className="font-mono">{backendUrl}/api/voice/twiml/outgoing</span>, y el número de voz
        configurado con webhook <span className="font-mono">{backendUrl}/api/voice/twiml/incoming</span>.
      </p>

      <div className="space-y-2">
        <Label htmlFor="voice-account-sid">Account SID</Label>
        <Input id="voice-account-sid" value={accountSid} onChange={(e) => setAccountSid(e.target.value)} placeholder="ACxxxxxxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-auth-token">Auth Token</Label>
        <Input
          id="voice-auth-token"
          type="password"
          placeholder={data ? "•••••••• (ya configurado)" : "auth token"}
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-api-key-sid">API Key SID</Label>
        <Input id="voice-api-key-sid" value={apiKeySid} onChange={(e) => setApiKeySid(e.target.value)} placeholder="SKxxxxxxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-api-key-secret">API Key Secret</Label>
        <Input
          id="voice-api-key-secret"
          type="password"
          placeholder={data ? "•••••••• (ya configurado)" : "api key secret"}
          value={apiKeySecret}
          onChange={(e) => setApiKeySecret(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-twiml-app-sid">TwiML App SID</Label>
        <Input id="voice-twiml-app-sid" value={twimlAppSid} onChange={(e) => setTwimlAppSid(e.target.value)} placeholder="APxxxxxxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-number">Número de Voz</Label>
        <Input id="voice-number" value={voiceNumber} onChange={(e) => setVoiceNumber(e.target.value)} placeholder="+15550001111" />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && <p className="text-xs text-green-600">Configuración guardada.</p>}

      <Button
        variant="outline"
        onClick={handleSave}
        disabled={saving || !accountSid.trim() || !apiKeySid.trim() || !twimlAppSid.trim() || !voiceNumber.trim()}
      >
        {saving ? "Guardando..." : "Guardar Voice"}
      </Button>
    </div>
  )
}
