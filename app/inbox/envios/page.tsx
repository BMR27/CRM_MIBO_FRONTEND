"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type ElementType } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Eye,
  Filter,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Contacto = {
  nombre: string
  telefono: string
  [key: string]: any
}

type ContactOption = {
  id: string
  name: string
  phone_number: string
  channel?: string
}

type CampaignStatus = "scheduled" | "sending" | "completed" | "failed"

type Campaign = {
  id: string
  campaignCode?: string
  name: string
  status: CampaignStatus
  recipients: number
  delivered: number
  failed: number
  skipped?: number
  read?: number
  replied?: number
  date: string
  message?: string
  templateName?: string
  source?: "api" | "local"
}

type CampaignStats = {
  activeCampaigns: number
  messagesSent: number
  messagesFailed: number
  messagesSkipped: number
  readRate: number
  responseRate: number
}

type CampaignRecipient = {
  id: string
  contactName: string
  phoneNumber: string
  message: string
  status: string
  createdAt: string
}

const LOCAL_CAMPAIGNS_KEY = "mibo_bulk_campaigns_v1"

const waTemplates = [
  {
    name: "customer_service_intro_v1",
    sid: "HXf9420e6e4ff17a94fe3dfaceb7aa657b",
    language: "es_MX",
    body: "¡Hola, {{1}}! Mi nombre es {{2}} y lo contacto del departamento de atención al cliente del producto {{3}}. ¡Estoy a disposición para asistir!",
    paramMap: {
      "1": "CLIENTE",
      "2": "ASESOR",
      "3": "PRODUCTS_A",
    },
    paramFallbacks: {
      "2": "Juan Pérez",
    },
  },
]

const templateBySid = new Map(waTemplates.map((t) => [t.sid, t]))
const templateByName = new Map(waTemplates.map((t) => [t.name, t]))

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function getMonthStartInputValue() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

function createCampaignCode() {
  const d = new Date()
  const stamp = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
    String(d.getSeconds()).padStart(2, "0"),
  ].join("")
  return `CMP-${stamp}`
}

function normalizeDate(value: string | undefined) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toISOString().slice(0, 10)
}

function formatDate(value: string | undefined) {
  const normalized = normalizeDate(value)
  if (!normalized) return "Sin fecha"
  const d = new Date(`${normalized}T12:00:00`)
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
}

function formatStatus(status: CampaignStatus) {
  const labels: Record<CampaignStatus, string> = {
    scheduled: "Programada",
    sending: "Enviando",
    completed: "Completada",
    failed: "Fallida",
  }
  return labels[status] || status
}

function statusClassName(status: CampaignStatus) {
  return {
    scheduled: "border-blue-200 bg-blue-50 text-blue-700",
    sending: "border-amber-200 bg-amber-50 text-amber-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    failed: "border-red-200 bg-red-50 text-red-700",
  }[status]
}

function getTemplateLabel(value?: string) {
  const raw = String(value || "").trim()
  if (!raw) return "Sin plantilla"
  return templateBySid.get(raw)?.name || templateByName.get(raw)?.name || raw
}

function getStoredCampaigns(): Campaign[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_CAMPAIGNS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function storeCampaign(campaign: Campaign) {
  if (typeof window === "undefined") return
  const current = getStoredCampaigns()
  const next = [campaign, ...current.filter((c) => c.id !== campaign.id)].slice(0, 100)
  localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(next))
}

function mergeCampaigns(apiCampaigns: Campaign[], localCampaigns: Campaign[]) {
  const byId = new Map<string, Campaign>()
  for (const campaign of [...apiCampaigns, ...localCampaigns]) {
    if (!campaign?.id) continue
    if (!byId.has(campaign.id)) byId.set(campaign.id, campaign)
  }
  return Array.from(byId.values()).sort((a, b) => {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  })
}

function EnviosMasivosPage() {
  const router = useRouter()
  const [showNewForm, setShowNewForm] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [campaignNotes, setCampaignNotes] = useState("")
  const [campaignProduct, setCampaignProduct] = useState("")
  const [contactSource, setContactSource] = useState<"saved" | "excel">("saved")
  const [contacts, setContacts] = useState<Contacto[]>([])
  const [savedContacts, setSavedContacts] = useState<ContactOption[]>([])
  const [selectedSavedContactIds, setSelectedSavedContactIds] = useState<Set<string>>(new Set())
  const [savedContactSearch, setSavedContactSearch] = useState("")
  const [loadingSavedContacts, setLoadingSavedContacts] = useState(false)
  const [savedContactsError, setSavedContactsError] = useState("")
  const [excelError, setExcelError] = useState("")
  const [currentAgentName, setCurrentAgentName] = useState("Agente")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>(waTemplates[0]?.sid || "")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [campaignsError, setCampaignsError] = useState("")
  const [stats, setStats] = useState<CampaignStats>({
    activeCampaigns: 0,
    messagesSent: 0,
    messagesFailed: 0,
    messagesSkipped: 0,
    readRate: 0,
    responseRate: 0,
  })
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [campaignRecipients, setCampaignRecipients] = useState<CampaignRecipient[]>([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  const [recipientsError, setRecipientsError] = useState("")
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [templateFilter, setTemplateFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState(getMonthStartInputValue())
  const [dateTo, setDateTo] = useState(getTodayInputValue())

  const selectedTemplateData = selectedTemplate ? templateBySid.get(selectedTemplate) : undefined
  const allCampaigns = useMemo(() => mergeCampaigns(campaigns, localCampaigns), [campaigns, localCampaigns])
  const selectedSavedContacts = useMemo(
    () => savedContacts.filter((contact) => selectedSavedContactIds.has(contact.id)),
    [savedContacts, selectedSavedContactIds],
  )
  const effectiveContacts = contactSource === "saved"
    ? selectedSavedContacts.map((contact) => ({
        id: contact.id,
        nombre: contact.name,
        telefono: contact.phone_number,
        CLIENTE: contact.name,
        ASESOR: currentAgentName,
        PHONE_A: contact.phone_number,
        PRODUCTS_A: campaignProduct,
      }))
    : contacts
  const filteredSavedContacts = useMemo(() => {
    const q = savedContactSearch.trim().toLowerCase()
    const whatsappContacts = savedContacts.filter((contact) => {
      const channel = String(contact.channel || "whatsapp").toLowerCase()
      return channel === "whatsapp" || String(contact.phone_number || "").startsWith("whatsapp:")
    })
    if (!q) return whatsappContacts
    return whatsappContacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.phone_number.toLowerCase().includes(q) ||
        contact.id.toLowerCase().includes(q)
      )
    })
  }, [savedContactSearch, savedContacts])

  const filteredCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allCampaigns.filter((campaign) => {
      const date = normalizeDate(campaign.date)
      const templateName = getTemplateLabel(campaign.templateName)
      const matchesSearch =
        !q ||
        campaign.name.toLowerCase().includes(q) ||
        String(campaign.campaignCode || campaign.id).toLowerCase().includes(q) ||
        templateName.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      const matchesTemplate = templateFilter === "all" || templateName === templateFilter || campaign.templateName === templateFilter
      const matchesDateFrom = !dateFrom || date >= dateFrom
      const matchesDateTo = !dateTo || date <= dateTo
      return matchesSearch && matchesStatus && matchesTemplate && matchesDateFrom && matchesDateTo
    })
  }, [allCampaigns, dateFrom, dateTo, search, statusFilter, templateFilter])

  const filteredSummary = useMemo(() => {
    return filteredCampaigns.reduce(
      (acc, c) => {
        acc.total += c.recipients || 0
        acc.sent += c.delivered || 0
        acc.failed += c.failed || 0
        acc.skipped += c.skipped || 0
        return acc
      },
      { total: 0, sent: 0, failed: 0, skipped: 0 },
    )
  }, [filteredCampaigns])

  const activeFilteredCampaigns = useMemo(
    () => filteredCampaigns.filter((campaign) => campaign.status === "scheduled" || campaign.status === "sending").length,
    [filteredCampaigns],
  )

  const selectedCampaign = useMemo(
    () => allCampaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [allCampaigns, selectedCampaignId],
  )

  const loadCampaigns = async () => {
    setLoadingCampaigns(true)
    setCampaignsError("")
    try {
      const [campaignRes, statsRes] = await Promise.all([fetch("/api/campaigns"), fetch("/api/campaigns/stats")])

      if (campaignRes.ok) {
        const data = await campaignRes.json()
        setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns.map((c: any) => ({ ...c, source: "api" })) : [])
      } else {
        setCampaignsError("No se pudo cargar el historial de campañas del servidor.")
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats({
          activeCampaigns: Number(data?.activeCampaigns || 0),
          messagesSent: Number(data?.messagesSent || 0),
          messagesFailed: Number(data?.messagesFailed || 0),
          messagesSkipped: Number(data?.messagesSkipped || 0),
          readRate: Number(data?.readRate || 0),
          responseRate: Number(data?.responseRate || 0),
        })
      }
    } catch {
      setCampaignsError("No se pudo conectar con el historial de campañas.")
    } finally {
      setLoadingCampaigns(false)
    }
  }

  const loadSavedContacts = async () => {
    setLoadingSavedContacts(true)
    setSavedContactsError("")
    try {
      const response = await fetch("/api/contacts", { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || "No se pudieron cargar los contactos.")
      const list = Array.isArray(data) ? data : data?.contacts || []
      setSavedContacts(
        list.map((contact: any) => ({
          id: String(contact.id),
          name: String(contact.name || contact.phone_number || "Sin nombre"),
          phone_number: String(contact.phone_number || ""),
          channel: String(contact.channel || "whatsapp"),
        })),
      )
    } catch (error) {
      setSavedContactsError(error instanceof Error ? error.message : "No se pudieron cargar los contactos.")
    } finally {
      setLoadingSavedContacts(false)
    }
  }

  const loadCurrentAgent = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      const user = data?.user || {}
      const name = String(user?.name || user?.email || "").trim()
      if (response.ok && name) setCurrentAgentName(name)
    } catch {
      setCurrentAgentName("Agente")
    }
  }

  const loadCampaignRecipients = async (campaign: Campaign) => {
    setSelectedCampaignId(campaign.id)
    setCampaignRecipients([])
    setRecipientsError("")
    setLoadingRecipients(true)
    try {
      const response = await fetch(`/api/campaigns/${encodeURIComponent(campaign.id)}/recipients`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo cargar el detalle de la campaña.")
      }
      setCampaignRecipients(Array.isArray(data?.recipients) ? data.recipients : [])
    } catch (error) {
      setRecipientsError(error instanceof Error ? error.message : "No se pudo cargar el detalle de la campaña.")
    } finally {
      setLoadingRecipients(false)
    }
  }

  const handleDeleteCampaign = async (campaign: Campaign) => {
    const ok = window.confirm(`¿Eliminar la campaña "${campaign.name}"? Esta acción solo quitará el registro de campaña, no los mensajes del chat.`)
    if (!ok) return

    setDeletingCampaignId(campaign.id)
    setCampaignsError("")
    try {
      if (campaign.source === "local") {
        const next = getStoredCampaigns().filter((item) => item.id !== campaign.id)
        localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(next))
        setLocalCampaigns(next)
      } else {
        const response = await fetch(`/api/campaigns?id=${encodeURIComponent(campaign.id)}`, { method: "DELETE" })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error || "No se pudo eliminar la campaña.")
        setCampaigns((current) => current.filter((item) => item.id !== campaign.id))
      }

      if (selectedCampaignId === campaign.id) {
        setSelectedCampaignId(null)
        setCampaignRecipients([])
      }

      setSendResult(`Campaña ${campaign.campaignCode || campaign.id} eliminada correctamente.`)
      await loadCampaigns()
    } catch (error) {
      setCampaignsError(error instanceof Error ? error.message : "No se pudo eliminar la campaña.")
    } finally {
      setDeletingCampaignId(null)
    }
  }

  useEffect(() => {
    setLocalCampaigns(getStoredCampaigns())
    loadCurrentAgent()
    loadCampaigns()
    loadSavedContacts()
  }, [])

  const toggleSavedContact = (id: string) => {
    setSelectedSavedContactIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllFilteredSavedContacts = () => {
    setSelectedSavedContactIds((current) => {
      const next = new Set(current)
      for (const contact of filteredSavedContacts) next.add(contact.id)
      return next
    })
  }

  const clearSavedContactSelection = () => {
    setSelectedSavedContactIds(new Set())
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setExcelError("")
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const XLSX = await import("xlsx")
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" })
      const mappedContacts = json.map((row: any) => ({
        ...row,
        nombre: row["CLIENTE"] || row["Nombre"] || row["name"] || "",
        telefono: row["PHONE_A"] || row["Teléfono"] || row["phone"] || "",
      }))
      setContacts(mappedContacts)
    } catch {
      setExcelError("Error al procesar el archivo. Asegúrate de que sea un Excel válido.")
    }
  }

  const handleSend = async () => {
    setSending(true)
    setSendResult("")
    const tpl = selectedTemplate ? templateBySid.get(selectedTemplate) : undefined
    if (!tpl) {
      setSendResult("Debes seleccionar una plantilla válida.")
      setSending(false)
      return
    }

    const paramRegex = /{{(\d+)}}/g
    const params: string[] = []
    let match
    while ((match = paramRegex.exec(tpl.body)) !== null) params.push(match[1])

    const paramMap: Record<string, string> = tpl.paramMap || {}
    const paramFallbacks: Record<string, string> = tpl.paramFallbacks || {}

    const contactsToSend = effectiveContacts
    if (contactsToSend.length === 0) {
      setSendResult("Selecciona contactos guardados o sube un Excel con destinatarios.")
      setSending(false)
      return
    }

    if (contactSource === "saved" && params.some((p) => tpl.paramMap[p] === "PRODUCTS_A") && !campaignProduct.trim()) {
      setSendResult("Captura el producto para completar la plantilla antes de enviar.")
      setSending(false)
      return
    }

    for (let i = 0; i < contactsToSend.length; i++) {
      const c = contactsToSend[i]
      for (const p of params) {
        const campo = paramMap[p] || `param${p}`
        const hasValue = typeof c[campo] !== "undefined" && c[campo] !== null && String(c[campo]).trim() !== ""
        const hasFallback = typeof paramFallbacks[p] !== "undefined" && String(paramFallbacks[p]).trim() !== ""
        if (!hasValue && !hasFallback) {
          setSendResult(`El contacto ${c["CLIENTE"] || c["PHONE_A"] || i + 1} no tiene el campo requerido para {{${p}}} (${campo}).`)
          setSending(false)
          return
        }
      }
    }

    const campaignCode = createCampaignCode()
    const campaignId = `bulk_${Date.now()}`
    const finalCampaignName = campaignName.trim() || `${tpl.name} ${campaignCode}`

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/messages/bulk`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(typeof window !== "undefined" && localStorage.getItem("access_token")
                ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
                : {}),
            },
            body: JSON.stringify({
              campaignId,
              campaignCode,
              campaignName: finalCampaignName,
              campaignNotes,
              contacts: contactsToSend,
              templateSid: selectedTemplate,
              templateName: tpl.name,
              templateLanguage: tpl.language,
              templateParamMap: tpl.paramMap,
              templateParamFallbacks: { ...tpl.paramFallbacks, "2": currentAgentName },
            }),
          })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const results = Array.isArray(data?.results) ? data.results : []
        const delivered = results.filter((r: any) => r?.status === "sent" || r?.ok === true).length
        const failed = results.filter((r: any) => r?.status === "error" || r?.ok === false).length
        const recipients = Number(data?.rows || data?.total || contactsToSend.length)
        const firstError = results.find((r: any) => r?.error)?.error
        const localCampaign: Campaign = {
          id: campaignId,
          campaignCode,
          name: finalCampaignName,
          status: failed > 0 && delivered === 0 ? "failed" : "completed",
          recipients,
          delivered,
          failed,
          skipped: 0,
          read: 0,
          replied: 0,
          date: new Date().toISOString(),
          message: tpl.body,
          templateName: tpl.name,
          source: "local",
        }
        storeCampaign(localCampaign)
        setLocalCampaigns(getStoredCampaigns())
        setSendResult(
          `Campaña ${campaignCode} procesada. ${delivered}/${recipients} mensajes enviados${failed ? `, ${failed} fallidos` : ""}${firstError ? `. Primer error: ${firstError}` : ""}.`,
        )
        await loadCampaigns()
      } else {
        setSendResult(`Error en el envío: ${data.error || "Error desconocido"}`)
      }
    } catch {
      setSendResult("Error de conexión con el backend.")
    }
    setSending(false)
    setShowNewForm(false)
    setContacts([])
    setSelectedSavedContactIds(new Set())
    setCampaignName("")
    setCampaignNotes("")
    setCampaignProduct("")
    setContactSource("saved")
    setSelectedTemplate(waTemplates[0]?.sid || "")
  }

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setTemplateFilter("all")
    setDateFrom(getMonthStartInputValue())
    setDateTo(getTodayInputValue())
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Campañas de mensajes</h1>
            <p className="text-sm text-slate-500">Envíos masivos, seguimiento operativo e identificación por campaña.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={loadCampaigns} disabled={loadingCampaigns} className="gap-2">
              {loadingCampaigns ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Actualizar
            </Button>
            <Button variant="outline" onClick={() => router.push("/inbox/contactos")} className="gap-2">
              <Upload className="h-4 w-4" />
              Importar contactos
            </Button>
            <Button onClick={() => setShowNewForm((v) => !v)} className="gap-2">
              <Send className="h-4 w-4" />
              Nueva campaña
            </Button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={MessageSquareText} label="Campañas filtradas" value={filteredCampaigns.length} />
          <MetricCard icon={Users} label="Destinatarios" value={filteredSummary.total} />
          <MetricCard icon={CheckCircle2} label="Enviados" value={filteredSummary.sent} />
          <MetricCard icon={XCircle} label="Fallidos" value={filteredSummary.failed} tone="danger" />
          <MetricCard icon={CalendarDays} label="Activas" value={activeFilteredCampaigns} />
        </section>

        {sendResult && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {sendResult}
          </div>
        )}

        {showNewForm && (
          <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre de campaña</label>
                <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Ej: Recuperación entregas junio" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Plantilla WhatsApp</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {waTemplates.map((tpl) => (
                      <SelectItem key={tpl.sid} value={tpl.sid}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Producto para la plantilla</label>
                <Input
                  value={campaignProduct}
                  onChange={(e) => setCampaignProduct(e.target.value)}
                  placeholder="Ej: Bionica, paquete, servicio o producto"
                />
                <p className="text-xs text-slate-500">Se usará para completar la variable de producto en los contactos guardados.</p>
              </div>
              <div className="space-y-3 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-700">Destinatarios</label>
                  <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={contactSource === "saved" ? "default" : "ghost"}
                      onClick={() => setContactSource("saved")}
                    >
                      Contactos guardados
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={contactSource === "excel" ? "default" : "ghost"}
                      onClick={() => setContactSource("excel")}
                    >
                      Excel
                    </Button>
                  </div>
                </div>

                {contactSource === "saved" ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <Input
                        value={savedContactSearch}
                        onChange={(e) => setSavedContactSearch(e.target.value)}
                        placeholder="Buscar contacto, teléfono o ID..."
                        className="bg-white md:max-w-md"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={selectAllFilteredSavedContacts} disabled={filteredSavedContacts.length === 0}>
                          Seleccionar filtrados
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={clearSavedContactSelection} disabled={selectedSavedContactIds.size === 0}>
                          Limpiar selección
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{selectedSavedContactIds.size} seleccionado{selectedSavedContactIds.size === 1 ? "" : "s"}</span>
                      <span>{filteredSavedContacts.length} contacto{filteredSavedContacts.length === 1 ? "" : "s"} visible{filteredSavedContacts.length === 1 ? "" : "s"}</span>
                    </div>
                    {savedContactsError && <p className="mt-2 text-xs font-medium text-red-600">{savedContactsError}</p>}
                    <div className="mt-3 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white">
                      {loadingSavedContacts ? (
                        <div className="p-4 text-center text-sm text-slate-500">Cargando contactos...</div>
                      ) : filteredSavedContacts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No hay contactos disponibles.</div>
                      ) : (
                        filteredSavedContacts.map((contact) => (
                          <label
                            key={contact.id}
                            className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0 hover:bg-slate-50"
                          >
                            <Checkbox
                              checked={selectedSavedContactIds.has(contact.id)}
                              onCheckedChange={() => toggleSavedContact(contact.id)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{contact.name}</p>
                              <p className="truncate text-xs text-slate-500">{contact.phone_number}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="bg-white" />
                    <p className="mt-2 text-xs text-slate-500">
                      Segunda opción: sube un Excel con columnas CLIENTE, PHONE_A y PRODUCTS_A.
                    </p>
                    {excelError && <p className="mt-2 text-xs font-medium text-red-600">{excelError}</p>}
                  </div>
                )}
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Notas internas</label>
                <Textarea value={campaignNotes} onChange={(e) => setCampaignNotes(e.target.value)} placeholder="Segmento, objetivo o referencia interna" />
              </div>
            </div>

            <aside className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">Resumen</span>
                <Badge variant="outline" className="bg-white">
                  {effectiveContacts.length} contactos
                </Badge>
              </div>
              {selectedTemplateData ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Plantilla</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedTemplateData.name}</p>
                  </div>
                  <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
                    {selectedTemplateData.body}
                  </pre>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">Selecciona una plantilla para ver el mensaje.</div>
              )}
              {effectiveContacts.length > 0 && (
                <div className="mt-4 max-h-36 overflow-auto rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
                  {effectiveContacts.slice(0, 20).map((c, idx) => (
                    <div key={`${c.telefono}-${idx}`} className="flex justify-between gap-2 border-b border-slate-100 py-1 last:border-b-0">
                      <span className="truncate">{c.nombre || "Sin nombre"}</span>
                      <span className="shrink-0 text-slate-400">{c.telefono || "Sin teléfono"}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewForm(false)} disabled={sending}>
                  Cancelar
                </Button>
                <Button disabled={effectiveContacts.length === 0 || sending || !selectedTemplate} onClick={handleSend} className="gap-2">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Enviando" : "Enviar ahora"}
                </Button>
              </div>
            </aside>
          </section>
        )}

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-4 xl:grid-cols-[minmax(260px,1fr)_170px_170px_190px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar campaña, ID o plantilla" className="pl-9" />
            </div>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="scheduled">Programadas</SelectItem>
                <SelectItem value="sending">Enviando</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="failed">Fallidas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plantilla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las plantillas</SelectItem>
                {waTemplates.map((tpl) => (
                  <SelectItem key={tpl.sid} value={tpl.name}>
                    {tpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {campaignsError && <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{campaignsError}</div>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaña</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Plantilla</TableHead>
                <TableHead className="text-right">Destinatarios</TableHead>
                <TableHead className="min-w-48">Avance</TableHead>
                <TableHead className="text-right">Fallidos</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-slate-500">
                    {loadingCampaigns ? "Cargando campañas..." : "No hay campañas con los filtros actuales."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const delivered = campaign.delivered || 0
                  const recipients = campaign.recipients || 0
                  const progress = recipients > 0 ? Math.round((delivered / recipients) * 100) : 0
                  const code = campaign.campaignCode || campaign.id
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{campaign.name}</p>
                          <p className="font-mono text-xs text-slate-500">{code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(campaign.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full", statusClassName(campaign.status))}>
                          {formatStatus(campaign.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-slate-600">{getTemplateLabel(campaign.templateName)}</TableCell>
                      <TableCell className="text-right font-medium">{recipients}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={progress} className="h-2 min-w-24" />
                          <span className="w-16 text-right text-xs text-slate-500">
                            {delivered}/{recipients}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("font-medium", campaign.failed ? "text-red-600" : "text-slate-500")}>{campaign.failed || 0}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadCampaignRecipients(campaign)}
                            className="gap-2"
                            title="Ver contactos y mensajes"
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard?.writeText(code)}
                            className="gap-2"
                            title="Copiar ID de campaña"
                          >
                            <Copy className="h-4 w-4" />
                            Copiar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign)}
                            disabled={deletingCampaignId === campaign.id}
                            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Eliminar campaña"
                          >
                            {deletingCampaignId === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </section>

        {selectedCampaign && (
          <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Detalle de campaña</p>
                <h2 className="text-lg font-semibold text-slate-950">{selectedCampaign.name}</h2>
                <p className="font-mono text-xs text-slate-500">{selectedCampaign.campaignCode || selectedCampaign.id}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedCampaignId(null)}>
                Cerrar detalle
              </Button>
            </div>

            {recipientsError && <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{recipientsError}</div>}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Mensaje enviado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRecipients ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-slate-500">
                      Cargando contactos enviados...
                    </TableCell>
                  </TableRow>
                ) : campaignRecipients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-slate-500">
                      No hay contactos registrados para esta campaña.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaignRecipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium text-slate-900">{recipient.contactName || "Sin nombre"}</TableCell>
                      <TableCell className="text-slate-600">{recipient.phoneNumber || "Sin teléfono"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={recipient.status === "failed" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                          {recipient.status === "failed" ? "Fallido" : recipient.status === "skipped" ? "Omitido" : "Enviado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(recipient.createdAt)}</TableCell>
                      <TableCell className="max-w-xl whitespace-pre-wrap text-sm text-slate-700">{recipient.message || "Sin contenido"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: ElementType
  label: string
  value: number
  tone?: "default" | "danger"
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={cn("mt-1 text-2xl font-semibold text-slate-950", tone === "danger" && "text-red-600")}>{value.toLocaleString("es-MX")}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600", tone === "danger" && "bg-red-50 text-red-600")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default EnviosMasivosPage
