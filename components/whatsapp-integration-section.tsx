"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

interface WhatsappIntegrationData {
  provider: "twilio" | "cloud_api"
  twilio_account_sid: string | null
  twilio_whatsapp_number: string | null
  cloud_phone_number_id: string | null
  cloud_waba_id: string | null
  verify_token: string
  is_active: boolean
  has_twilio_auth_token: boolean
  has_cloud_access_token: boolean
}

export function WhatsappIntegrationSection() {
  const { t } = useLanguage()
  const [data, setData] = useState<WhatsappIntegrationData | null>(null)
  const [provider, setProvider] = useState<"twilio" | "cloud_api">("cloud_api")
  const [twilioAccountSid, setTwilioAccountSid] = useState("")
  const [twilioAuthToken, setTwilioAuthToken] = useState("")
  const [twilioNumber, setTwilioNumber] = useState("")
  const [cloudAccessToken, setCloudAccessToken] = useState("")
  const [cloudPhoneNumberId, setCloudPhoneNumberId] = useState("")
  const [cloudWabaId, setCloudWabaId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
  const webhookUrl = `${backendUrl}/api/whatsapp/webhook`

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/whatsapp/integration")
        if (data) {
          setData(data)
          setProvider(data.provider)
          setTwilioAccountSid(data.twilio_account_sid || "")
          setTwilioNumber(data.twilio_whatsapp_number || "")
          setCloudPhoneNumberId(data.cloud_phone_number_id || "")
          setCloudWabaId(data.cloud_waba_id || "")
        }
      } catch (err) {
        setError(t("cfg.whatsappLoadFail"))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const { data: result } = await api.patch("/api/whatsapp/integration", {
        provider,
        twilio_account_sid: twilioAccountSid || undefined,
        twilio_auth_token: twilioAuthToken || undefined,
        twilio_whatsapp_number: twilioNumber || undefined,
        cloud_access_token: cloudAccessToken || undefined,
        cloud_phone_number_id: cloudPhoneNumberId || undefined,
        cloud_waba_id: cloudWabaId || undefined,
      })
      setData((prev) => ({ ...(prev as any), ...result }))
      setTwilioAuthToken("")
      setCloudAccessToken("")
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(t("cfg.whatsappSaveFail"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">{t("cfg.loadingWhatsapp")}</p>

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">{t("cfg.whatsappTitle")}</h3>

      <Tabs value={provider} onValueChange={(v) => setProvider(v as "twilio" | "cloud_api")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cloud_api">{t("cfg.cloudApi")}</TabsTrigger>
          <TabsTrigger value="twilio">{t("cfg.twilio")}</TabsTrigger>
        </TabsList>

        <TabsContent value="cloud_api" className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="cloud-token">{t("cfg.accessToken")}</Label>
            <Input
              id="cloud-token"
              type="password"
              placeholder={data?.has_cloud_access_token ? t("cfg.alreadyConfigured") : "EAAxxxxxx..."}
              value={cloudAccessToken}
              onChange={(e) => setCloudAccessToken(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone-id">{t("cfg.phoneNumberId")}</Label>
            <Input id="phone-id" value={cloudPhoneNumberId} onChange={(e) => setCloudPhoneNumberId(e.target.value)} placeholder="123456789012345" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waba-id">{t("cfg.wabaId")}</Label>
            <Input id="waba-id" value={cloudWabaId} onChange={(e) => setCloudWabaId(e.target.value)} placeholder="123456789012345" />
          </div>
        </TabsContent>

        <TabsContent value="twilio" className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="twilio-sid">{t("cfg.accountSid")}</Label>
            <Input id="twilio-sid" value={twilioAccountSid} onChange={(e) => setTwilioAccountSid(e.target.value)} placeholder="ACxxxxxxxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twilio-token">{t("cfg.authToken")}</Label>
            <Input
              id="twilio-token"
              type="password"
              placeholder={data?.has_twilio_auth_token ? t("cfg.alreadyConfigured") : t("cfg.authToken")}
              value={twilioAuthToken}
              onChange={(e) => setTwilioAuthToken(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twilio-number">{t("cfg.whatsappNumber")}</Label>
            <Input id="twilio-number" value={twilioNumber} onChange={(e) => setTwilioNumber(e.target.value)} placeholder="+14155238886" />
          </div>
        </TabsContent>
      </Tabs>

      {data?.verify_token && (
        <div className="space-y-1 rounded-lg border border-border p-3 text-xs">
          <p className="font-medium text-foreground">{t("cfg.webhookDataTitle")}</p>
          <p className="text-muted-foreground break-all">URL: <span className="font-mono">{webhookUrl}</span></p>
          <p className="text-muted-foreground break-all">{t("cfg.verifyToken")}: <span className="font-mono">{data.verify_token}</span></p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && <p className="text-xs text-green-600">{t("cfg.whatsappSaved")}</p>}

      <Button variant="outline" onClick={handleSave} disabled={saving}>
        {saving ? t("cfg.saving") : t("cfg.saveWhatsapp")}
      </Button>
    </div>
  )
}
