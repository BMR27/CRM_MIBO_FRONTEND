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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

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
const localeMap: Record<string, string> = { es: "es-MX", en: "en-US", pl: "pl-PL", ru: "ru-RU" }

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
  {
    name: "pedido_enviado_v1",
    sid: "HX36751a5be358338dd5082fa394b515f5",
    language: "es_MX",
    body: "Buenas días, su pedido de {{1}} ha sido enviado. El número de envío {{2}} Por favor, espere una llamada del servicio de mensajería - {{3}}. Que tenga un buen día!",
    paramMap: {
      "1": "TOTAL_PEDIDO",
      "2": "TRACKING",
      "3": "PAQUETERIA",
    },
    paramFallbacks: {} as Record<string, string>,
  },
  {
    name: "relivital_descuento20_v1",
    sid: "HXf28c75519779a906bed40de37c57411d",
    language: "pl",
    body: "Pani {{1}}, wybrała już Pani Relivital — więc wie, jak ważna jest regularna pielęgnacja skóry.\nKolagen morski i elastyna działają stopniowo — dlatego warto kontynuować pielęgnację bez dłuższych przerw.\nWłaśnie dla naszych Klientek przygotowaliśmy rabat 20% na kolejne zamówienie Relivital, na dowolną liczbę opakowań.\nZwykle ten rabat obowiązuje tylko miesiąc po zakupie, ale dla Pani przedłużyliśmy go do 12.09.\nWystarczy zadzwonić pod numer +48 12 420 73 49 i podać naszej konsultantce kod KLIENT20.",
    paramMap: {
      "1": "CLIENTE",
    } as Record<string, string>,
    paramFallbacks: {} as Record<string, string>,
    // Plantilla exclusiva: solo la ve el tenant Relivital, no el resto de espacios.
    tenantIds: ["0b50210b-d7d0-47df-8fe1-71ce95b419e6"],
  },
]

const templateBySid = new Map(waTemplates.map((t) => [t.sid, t]))
const templateByName = new Map(waTemplates.map((t) => [t.name, t]))

// Campos que ya se resuelven automáticamente desde el contacto seleccionado/guardado.
const CONTACT_RESOLVED_FIELDS = new Set(["CLIENTE", "ASESOR", "PHONE_A"])

function getExtraTemplateFields(tpl: (typeof waTemplates)[number] | undefined): string[] {
  if (!tpl) return []
  const seen = new Set<string>()
  const extras: string[] = []
  for (const campo of Object.values(tpl.paramMap)) {
    if (CONTACT_RESOLVED_FIELDS.has(campo) || seen.has(campo)) continue
    seen.add(campo)
    extras.push(campo)
  }
  return extras
}

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
  const { t, language } = useLanguage()
  const locale = localeMap[language] || "es-MX"

  const formatDate = (value: string | undefined) => {
    const normalized = normalizeDate(value)
    if (!normalized) return t("camp.noDate")
    const d = new Date(`${normalized}T12:00:00`)
    return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatStatus = (status: CampaignStatus) => {
    const labels: Record<CampaignStatus, string> = {
      scheduled: t("camp.status.scheduled"),
      sending: t("camp.status.sending"),
      completed: t("camp.status.completed"),
      failed: t("camp.status.failed"),
    }
    return labels[status] || status
  }

  const statusClassName = (status: CampaignStatus) => {
    return {
      scheduled: "border-blue-200 bg-blue-50 text-blue-700",
      sending: "border-amber-200 bg-amber-50 text-amber-700",
      completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
      failed: "border-red-200 bg-red-50 text-red-700",
    }[status]
  }

  const getTemplateLabel = (value?: string) => {
    const raw = String(value || "").trim()
    if (!raw) return t("camp.noTemplate")
    return templateBySid.get(raw)?.name || templateByName.get(raw)?.name || raw
  }

  const router = useRouter()
  const [showNewForm, setShowNewForm] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [campaignNotes, setCampaignNotes] = useState("")
  const [campaignParams, setCampaignParams] = useState<Record<string, string>>({})
  const [contactSource, setContactSource] = useState<"saved" | "excel">("saved")
  const [contacts, setContacts] = useState<Contacto[]>([])
  const [savedContacts, setSavedContacts] = useState<ContactOption[]>([])
  const [selectedSavedContactIds, setSelectedSavedContactIds] = useState<Set<string>>(new Set())
  const [savedContactSearch, setSavedContactSearch] = useState("")
  const [loadingSavedContacts, setLoadingSavedContacts] = useState(false)
  const [savedContactsError, setSavedContactsError] = useState("")
  const [excelError, setExcelError] = useState("")
  const [currentAgentName, setCurrentAgentName] = useState(t("camp.defaultAgent"))
  const [tenantId, setTenantId] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [templateFilter, setTemplateFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState(getMonthStartInputValue())
  const [dateTo, setDateTo] = useState(getTodayInputValue())

  // Si el tenant tiene alguna plantilla exclusiva asignada, solo ve esas; si no,
  // ve las plantillas por defecto (las que no tienen tenantIds asociados).
  const visibleTemplates = useMemo(() => {
    const dedicated = waTemplates.filter((t) => t.tenantIds?.includes(tenantId))
    return dedicated.length > 0 ? dedicated : waTemplates.filter((t) => !t.tenantIds)
  }, [tenantId])

  useEffect(() => {
    if (visibleTemplates.length === 0) return
    if (!visibleTemplates.some((t) => t.sid === selectedTemplate)) {
      setSelectedTemplate(visibleTemplates[0].sid)
    }
  }, [visibleTemplates, selectedTemplate])

  const selectedTemplateData = selectedTemplate ? templateBySid.get(selectedTemplate) : undefined
  const extraTemplateFields = useMemo(() => getExtraTemplateFields(selectedTemplateData), [selectedTemplateData])

  useEffect(() => {
    setCampaignParams({})
  }, [selectedTemplate])

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
        ...campaignParams,
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
        setCampaignsError(t("camp.loadHistoryFail"))
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
      setCampaignsError(t("camp.connectHistoryFail"))
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
      if (!response.ok) throw new Error(data?.error || t("camp.loadContactsFail"))
      const list = Array.isArray(data) ? data : data?.contacts || []
      setSavedContacts(
        list.map((contact: any) => ({
          id: String(contact.id),
          name: String(contact.name || contact.phone_number || t("camp.noName")),
          phone_number: String(contact.phone_number || ""),
          channel: String(contact.channel || "whatsapp"),
        })),
      )
    } catch (error) {
      setSavedContactsError(error instanceof Error ? error.message : t("camp.loadContactsFail"))
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
      if (response.ok) setTenantId(String(user?.tenant_id || ""))
    } catch {
      setCurrentAgentName(t("camp.defaultAgent"))
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
        throw new Error(data?.error || t("camp.loadDetailFail"))
      }
      setCampaignRecipients(Array.isArray(data?.recipients) ? data.recipients : [])
    } catch (error) {
      setRecipientsError(error instanceof Error ? error.message : t("camp.loadDetailFail"))
    } finally {
      setLoadingRecipients(false)
    }
  }

  const requestDeleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return
    const campaign = campaignToDelete

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
        if (!response.ok) throw new Error(data?.error || t("camp.deleteFail"))
        setCampaigns((current) => current.filter((item) => item.id !== campaign.id))
      }

      if (selectedCampaignId === campaign.id) {
        setSelectedCampaignId(null)
        setCampaignRecipients([])
      }

      setSendResult(`${t("camp.pageTitle")}: ${campaign.campaignCode || campaign.id} ${t("camp.deletedOk")}`)
      await loadCampaigns()
    } catch (error) {
      setCampaignsError(error instanceof Error ? error.message : t("camp.deleteFail"))
    } finally {
      setDeleteDialogOpen(false)
      setCampaignToDelete(null)
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
      setExcelError(t("camp.excelProcessError"))
    }
  }

  const handleDownloadTemplate = async () => {
    if (!selectedTemplateData) return
    const XLSX = await import("xlsx")
    const headers = ["CLIENTE", "PHONE_A", ...getExtraTemplateFields(selectedTemplateData)]
    const exampleRow = headers.map((h) => (h === "PHONE_A" ? "+525512345678" : h === "CLIENTE" ? "Juan Pérez" : "..."))
    const sheet = XLSX.utils.aoa_to_sheet([headers, exampleRow])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, "Contactos")
    XLSX.writeFile(wb, `plantilla_${selectedTemplateData.name}.xlsx`)
  }

  const handleSend = async () => {
    setSending(true)
    setSendResult("")
    const tpl = selectedTemplate ? templateBySid.get(selectedTemplate) : undefined
    if (!tpl) {
      setSendResult(t("camp.selectValidTemplate"))
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
      setSendResult(t("camp.selectContactsOrExcel"))
      setSending(false)
      return
    }

    if (contactSource === "saved") {
      const missingField = getExtraTemplateFields(tpl).find((campo) => !campaignParams[campo]?.trim())
      if (missingField) {
        setSendResult(`${t("camp.captureField")} "${missingField}" ${t("camp.captureFieldSuffix")}`)
        setSending(false)
        return
      }
    }

    for (let i = 0; i < contactsToSend.length; i++) {
      const c = contactsToSend[i]
      for (const p of params) {
        const campo = paramMap[p] || `param${p}`
        const contactRecord = c as Record<string, unknown>
        const campoValue = contactRecord[campo]
        const hasValue = typeof campoValue !== "undefined" && campoValue !== null && String(campoValue).trim() !== ""
        const hasFallback = typeof paramFallbacks[p] !== "undefined" && String(paramFallbacks[p]).trim() !== ""
        if (!hasValue && !hasFallback) {
          setSendResult(`${t("camp.contactMissingField1")} ${c["CLIENTE"] || c["PHONE_A"] || i + 1} ${t("camp.contactMissingField2")} {{${p}}} (${campo}).`)
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
              templateBody: tpl.body,
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
          `${campaignCode} ${t("camp.processedCampaign")} ${delivered}/${recipients} ${t("camp.messagesSent")}${failed ? `, ${failed} ${t("camp.failedSuffix")}` : ""}${firstError ? `. ${t("camp.firstError")} ${firstError}` : ""}.`,
        )
        await loadCampaigns()
      } else {
        setSendResult(`${t("camp.sendError")} ${data.error || t("camp.unknownError")}`)
      }
    } catch {
      setSendResult(t("camp.connectionError"))
    }
    setSending(false)
    setShowNewForm(false)
    setContacts([])
    setSelectedSavedContactIds(new Set())
    setCampaignName("")
    setCampaignNotes("")
    setCampaignParams({})
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
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{t("camp.pageTitle")}</h1>
            <p className="text-sm text-slate-500">{t("camp.pageSubtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={loadCampaigns} disabled={loadingCampaigns} className="gap-2">
              {loadingCampaigns ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {t("camp.refresh")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/inbox/contactos")} className="gap-2">
              <Upload className="h-4 w-4" />
              {t("camp.importContacts")}
            </Button>
            <Button onClick={() => setShowNewForm((v) => !v)} className="gap-2">
              <Send className="h-4 w-4" />
              {t("camp.newCampaign")}
            </Button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={MessageSquareText} label={t("camp.metricFiltered")} value={filteredCampaigns.length} locale={locale} />
          <MetricCard icon={Users} label={t("camp.metricRecipients")} value={filteredSummary.total} locale={locale} />
          <MetricCard icon={CheckCircle2} label={t("camp.metricSent")} value={filteredSummary.sent} locale={locale} />
          <MetricCard icon={XCircle} label={t("camp.metricFailed")} value={filteredSummary.failed} tone="danger" locale={locale} />
          <MetricCard icon={CalendarDays} label={t("camp.metricActive")} value={activeFilteredCampaigns} locale={locale} />
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
                <label className="text-sm font-medium text-slate-700">{t("camp.campaignNameLabel")}</label>
                <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder={t("camp.campaignNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t("camp.templateLabel")}</label>
                <div className="flex gap-2">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("camp.templatePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleTemplates.map((tpl) => (
                        <SelectItem key={tpl.sid} value={tpl.sid}>
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate} disabled={!selectedTemplateData}>
                    {t("camp.downloadExcel")}
                  </Button>
                </div>
              </div>
              {extraTemplateFields.length > 0 && (
                <div className="space-y-3 lg:col-span-2">
                  <p className="text-sm font-medium text-slate-700">{t("camp.templateFields")}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {extraTemplateFields.map((campo) => (
                      <div key={campo} className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">{campo}</label>
                        <Input
                          value={campaignParams[campo] || ""}
                          onChange={(e) => setCampaignParams((prev) => ({ ...prev, [campo]: e.target.value }))}
                          placeholder={campo}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {t("camp.templateFieldsHint")}
                  </p>
                </div>
              )}
              <div className="space-y-3 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-700">{t("camp.recipients")}</label>
                  <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={contactSource === "saved" ? "default" : "ghost"}
                      onClick={() => setContactSource("saved")}
                    >
                      {t("camp.savedContacts")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={contactSource === "excel" ? "default" : "ghost"}
                      onClick={() => setContactSource("excel")}
                    >
                      {t("camp.excel")}
                    </Button>
                  </div>
                </div>

                {contactSource === "saved" ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <Input
                        value={savedContactSearch}
                        onChange={(e) => setSavedContactSearch(e.target.value)}
                        placeholder={t("camp.searchContactPlaceholder")}
                        className="bg-white md:max-w-md"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={selectAllFilteredSavedContacts} disabled={filteredSavedContacts.length === 0}>
                          {t("camp.selectFiltered")}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={clearSavedContactSelection} disabled={selectedSavedContactIds.size === 0}>
                          {t("camp.clearSelection")}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{selectedSavedContactIds.size} {selectedSavedContactIds.size === 1 ? t("camp.selected") : t("camp.selectedPlural")}</span>
                      <span>{filteredSavedContacts.length} {filteredSavedContacts.length === 1 ? t("camp.visibleContact") : t("camp.visibleContacts")} {filteredSavedContacts.length === 1 ? t("camp.visible") : t("camp.visiblePlural")}</span>
                    </div>
                    {savedContactsError && <p className="mt-2 text-xs font-medium text-red-600">{savedContactsError}</p>}
                    <div className="mt-3 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white">
                      {loadingSavedContacts ? (
                        <div className="p-4 text-center text-sm text-slate-500">{t("camp.loadingContacts")}</div>
                      ) : filteredSavedContacts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">{t("camp.noContactsAvailable")}</div>
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
                      {t("camp.excelSecondOption")}
                      {selectedTemplateData ? ` ${t("camp.excelAnd")} ${Object.values(selectedTemplateData.paramMap).filter((c) => c !== "CLIENTE" && c !== "ASESOR" && c !== "PHONE_A").join(", ")}` : ` ${t("camp.excelAnd")} PRODUCTS_A`}.
                    </p>
                    {excelError && <p className="mt-2 text-xs font-medium text-red-600">{excelError}</p>}
                  </div>
                )}
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">{t("camp.internalNotes")}</label>
                <Textarea value={campaignNotes} onChange={(e) => setCampaignNotes(e.target.value)} placeholder={t("camp.internalNotesPlaceholder")} />
              </div>
            </div>

            <aside className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{t("camp.summary")}</span>
                <Badge variant="outline" className="bg-white">
                  {effectiveContacts.length} {t("camp.contactsBadge")}
                </Badge>
              </div>
              {selectedTemplateData ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">{t("camp.template")}</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedTemplateData.name}</p>
                  </div>
                  <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
                    {selectedTemplateData.body}
                  </pre>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">{t("camp.selectTemplateToView")}</div>
              )}
              {effectiveContacts.length > 0 && (
                <div className="mt-4 max-h-36 overflow-auto rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
                  {effectiveContacts.slice(0, 20).map((c, idx) => (
                    <div key={`${c.telefono}-${idx}`} className="flex justify-between gap-2 border-b border-slate-100 py-1 last:border-b-0">
                      <span className="truncate">{c.nombre || t("camp.noName")}</span>
                      <span className="shrink-0 text-slate-400">{c.telefono || t("camp.noPhone")}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewForm(false)} disabled={sending}>
                  {t("camp.cancel")}
                </Button>
                <Button disabled={effectiveContacts.length === 0 || sending || !selectedTemplate} onClick={handleSend} className="gap-2">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? t("camp.sending") : t("camp.sendNow")}
                </Button>
              </div>
            </aside>
          </section>
        )}

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-4 xl:grid-cols-[minmax(260px,1fr)_170px_170px_190px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("camp.searchCampaignPlaceholder")} className="pl-9" />
            </div>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("camp.colStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("camp.allStatuses")}</SelectItem>
                <SelectItem value="scheduled">{t("camp.scheduledPlural")}</SelectItem>
                <SelectItem value="sending">{t("camp.sendingPlural")}</SelectItem>
                <SelectItem value="completed">{t("camp.completedPlural")}</SelectItem>
                <SelectItem value="failed">{t("camp.failedPlural")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("camp.colTemplate")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("camp.allTemplates")}</SelectItem>
                {visibleTemplates.map((tpl) => (
                  <SelectItem key={tpl.sid} value={tpl.name}>
                    {tpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              {t("camp.clear")}
            </Button>
          </div>

          {campaignsError && <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{campaignsError}</div>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("camp.colCampaign")}</TableHead>
                <TableHead>{t("camp.colDate")}</TableHead>
                <TableHead>{t("camp.colStatus")}</TableHead>
                <TableHead>{t("camp.colTemplate")}</TableHead>
                <TableHead className="text-right">{t("camp.colRecipients")}</TableHead>
                <TableHead className="min-w-48">{t("camp.colProgress")}</TableHead>
                <TableHead className="text-right">{t("camp.colFailed")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-slate-500">
                    {loadingCampaigns ? t("camp.loadingCampaigns") : t("camp.noCampaignsFiltered")}
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
                            title={t("camp.viewTitle")}
                          >
                            <Eye className="h-4 w-4" />
                            {t("camp.view")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard?.writeText(code)}
                            className="gap-2"
                            title={t("camp.copyTitle")}
                          >
                            <Copy className="h-4 w-4" />
                            {t("camp.copy")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => requestDeleteCampaign(campaign)}
                            disabled={deletingCampaignId === campaign.id}
                            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title={t("camp.deleteTitle")}
                          >
                            {deletingCampaignId === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {t("camp.delete")}
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
                <p className="text-xs font-medium uppercase text-slate-500">{t("camp.campaignDetail")}</p>
                <h2 className="text-lg font-semibold text-slate-950">{selectedCampaign.name}</h2>
                <p className="font-mono text-xs text-slate-500">{selectedCampaign.campaignCode || selectedCampaign.id}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedCampaignId(null)}>
                {t("camp.closeDetail")}
              </Button>
            </div>

            {recipientsError && <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{recipientsError}</div>}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("camp.colContact")}</TableHead>
                  <TableHead>{t("camp.colPhone")}</TableHead>
                  <TableHead>{t("camp.colStatus")}</TableHead>
                  <TableHead>{t("camp.colDate")}</TableHead>
                  <TableHead>{t("camp.colMessageSent")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRecipients ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-slate-500">
                      {t("camp.loadingSentContacts")}
                    </TableCell>
                  </TableRow>
                ) : campaignRecipients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-slate-500">
                      {t("camp.noRecipientsRegistered")}
                    </TableCell>
                  </TableRow>
                ) : (
                  campaignRecipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium text-slate-900">{recipient.contactName || t("camp.noName")}</TableCell>
                      <TableCell className="text-slate-600">{recipient.phoneNumber || t("camp.noPhone")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={recipient.status === "failed" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                          {recipient.status === "failed" ? t("camp.statusFailed") : recipient.status === "skipped" ? t("camp.statusSkipped") : t("camp.statusSent")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(recipient.createdAt)}</TableCell>
                      <TableCell className="max-w-xl whitespace-pre-wrap text-sm text-slate-700">{recipient.message || t("camp.noContent")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-950">{t("camp.deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                {`${t("camp.deleteConfirmDesc1")} "${campaignToDelete?.name || ""}"${t("camp.deleteConfirmDesc2")}`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={Boolean(deletingCampaignId)}>{t("camp.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCampaign}
                className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-400"
                disabled={Boolean(deletingCampaignId)}
              >
                {deletingCampaignId ? t("camp.deleting") : t("camp.deleteCampaign")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "default",
  locale,
}: {
  icon: ElementType
  label: string
  value: number
  tone?: "default" | "danger"
  locale: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={cn("mt-1 text-2xl font-semibold text-slate-950", tone === "danger" && "text-red-600")}>{value.toLocaleString(locale)}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600", tone === "danger" && "bg-red-50 text-red-600")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default EnviosMasivosPage
