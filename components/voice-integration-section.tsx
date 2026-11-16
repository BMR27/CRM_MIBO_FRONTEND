"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

interface VoiceIntegrationData {
  twilio_account_sid: string
  twilio_api_key_sid: string
  twiml_app_sid: string
  voice_number: string
  is_active: boolean
}

export function VoiceIntegrationSection() {
  const { t } = useLanguage()
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
        setError(t("cfg.voiceLoadFail"))
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
      setError(t("cfg.voiceSaveFail"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">{t("cfg.loadingVoice")}</p>

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">{t("cfg.voiceTitle")}</h3>
      <p className="text-xs text-muted-foreground">
        {t("cfg.voiceDescPrefix")} <span className="font-mono">{backendUrl}/api/voice/twiml/outgoing</span>
        {t("cfg.voiceDescMiddle")} <span className="font-mono">{backendUrl}/api/voice/twiml/incoming</span>.
      </p>

      <div className="space-y-2">
        <Label htmlFor="voice-account-sid">{t("cfg.accountSid")}</Label>
        <Input id="voice-account-sid" value={accountSid} onChange={(e) => setAccountSid(e.target.value)} placeholder="ACxxxxxxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-auth-token">{t("cfg.authToken")}</Label>
        <Input
          id="voice-auth-token"
          type="password"
          placeholder={data ? t("cfg.alreadyConfigured") : t("cfg.authToken")}
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-api-key-sid">{t("cfg.apiKeySid")}</Label>
        <Input id="voice-api-key-sid" value={apiKeySid} onChange={(e) => setApiKeySid(e.target.value)} placeholder="SKxxxxxxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-api-key-secret">{t("cfg.apiKeySecret")}</Label>
        <Input
          id="voice-api-key-secret"
          type="password"
          placeholder={data ? t("cfg.alreadyConfigured") : t("cfg.apiKeySecret")}
          value={apiKeySecret}
          onChange={(e) => setApiKeySecret(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-twiml-app-sid">{t("cfg.twimlAppSid")}</Label>
        <Input id="voice-twiml-app-sid" value={twimlAppSid} onChange={(e) => setTwimlAppSid(e.target.value)} placeholder="APxxxxxxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voice-number">{t("cfg.voiceNumber")}</Label>
        <Input id="voice-number" value={voiceNumber} onChange={(e) => setVoiceNumber(e.target.value)} placeholder="+15550001111" />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && <p className="text-xs text-green-600">{t("cfg.whatsappSaved")}</p>}

      <Button
        variant="outline"
        onClick={handleSave}
        disabled={saving || !accountSid.trim() || !apiKeySid.trim() || !twimlAppSid.trim() || !voiceNumber.trim()}
      >
        {saving ? t("cfg.saving") : t("cfg.saveVoice")}
      </Button>
    </div>
  )
}
