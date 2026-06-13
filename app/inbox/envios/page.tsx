"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type ElementType } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Filter,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  Users,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const LOCAL_CAMPAIGNS_KEY = "mibo_bulk_campaigns_v1"

const waTemplates = [
  {
    name: "lm_buen_dia_en_entrega",
    sid: "HX9efa55d55fa323d5efa09d82d0a1c484",
    body: "Buen día, {{1}}. Le hablamos de Logimarket.\nSu pedido con número de orden {{2}}, producto {{3}}, se encuentra en proceso de entrega.\nSi desea compartir alguna indicación adicional para la entrega, por favor responda a este mensaje. ¡Gracias!",
  },
  {
    name: "lm_buen_dia_empaque",
    sid: "HX63433782a538101c777138bca250cc54",
    body: "Buenos días, {{1}}. Le hablamos de Logimarket.\nRecibimos su pedido de {{2}}, con número de orden {{3}} y se encuentra en proceso de empaque.\nLe avisaremos en cuanto esté listo para su entrega. ¡Gracias por su preferencia!",
  },
  {
    name: "lm_buen_dia_proximo_entregar_confirma",
    sid: "HX43be0016968ad04dbe7a7a2408a5d24b",
    body: "Buenos días, {{1}}. Le hablamos de Logimarket.\nSu pedido con número de orden {{2}}, producto {{3}} está próximo a entregarse. ¿Puede confirmar su disponibilidad para recibirlo el día de hoy?\nQuedamos atentos a su respuesta. ¡Gracias!",
  },
  {
    name: "bienvenida_logi",
    sid: "HX99ead19f74793c6b5f0e1777523f1815",
    body: "Hola {{1}}, ¡Bienvenido/a Logimarket! Estoy aquí para ayudarte con tus pedidos y soporte.",
  },
  {
    name: "lm_mensajeria_disponibilidad_paquete",
    sid: "HXdf73cf1db9d8dc586d94d576fa2e140c",
    body: "Estimado/a {{1}},\n\nSoy de mensajería Logimarket. Deseo que se encuentre bien.\nLe escribo porque aún tenemos su paquete de {{2}}.\nSi ya está en condiciones de recibirlo, por favor confírmenos su disponibilidad.\n\n¡Gracias!",
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
  const [showNewForm, setShowNewForm] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [campaignNotes, setCampaignNotes] = useState("")
  const [contacts, setContacts] = useState<Contacto[]>([])
  const [excelError, setExcelError] = useState("")
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

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [templateFilter, setTemplateFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState(getMonthStartInputValue())
  const [dateTo, setDateTo] = useState(getTodayInputValue())

  const selectedTemplateData = selectedTemplate ? templateBySid.get(selectedTemplate) : undefined
  const allCampaigns = useMemo(() => mergeCampaigns(campaigns, localCampaigns), [campaigns, localCampaigns])

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

  useEffect(() => {
    setLocalCampaigns(getStoredCampaigns())
    loadCampaigns()
  }, [])

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

    const paramMap: Record<string, string> = {
      "1": "CLIENTE",
      "2": "ORDEN",
      "3": "PRODUCTS_A",
    }

    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i]
      for (const p of params) {
        const campo = paramMap[p] || `param${p}`
        if (typeof c[campo] === "undefined" || c[campo] === null || String(c[campo]).trim() === "") {
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
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : ""
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/messages/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          campaignId,
          campaignCode,
          campaignName: finalCampaignName,
          campaignNotes,
          contacts,
          templateSid: selectedTemplate,
          templateName: tpl.name,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        const results = Array.isArray(data?.results) ? data.results : []
        const delivered = results.filter((r: any) => r?.status === "sent" || r?.ok === true).length
        const failed = results.filter((r: any) => r?.status === "error" || r?.ok === false).length
        const recipients = Number(data?.rows || data?.total || contacts.length)
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
        setSendResult(`Campaña ${campaignCode} enviada. ${delivered}/${recipients} mensajes enviados${failed ? `, ${failed} fallidos` : ""}.`)
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
    setCampaignName("")
    setCampaignNotes("")
    setSelectedTemplate("")
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
            <Button onClick={() => setShowNewForm((v) => !v)} className="gap-2">
              <Send className="h-4 w-4" />
              Nueva campaña
            </Button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={MessageSquareText} label="Campañas filtradas" value={filteredCampaigns.length} />
          <MetricCard icon={Users} label="Destinatarios" value={filteredSummary.total} />
          <MetricCard icon={CheckCircle2} label="Enviados" value={filteredSummary.sent || stats.messagesSent} />
          <MetricCard icon={XCircle} label="Fallidos" value={filteredSummary.failed || stats.messagesFailed} tone="danger" />
          <MetricCard icon={CalendarDays} label="Activas" value={stats.activeCampaigns} />
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
                <label className="text-sm font-medium text-slate-700">Destinatarios</label>
                <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                {excelError && <p className="text-xs font-medium text-red-600">{excelError}</p>}
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
                  {contacts.length} contactos
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
              {contacts.length > 0 && (
                <div className="mt-4 max-h-36 overflow-auto rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
                  {contacts.slice(0, 20).map((c, idx) => (
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
                <Button disabled={contacts.length === 0 || sending || !selectedTemplate} onClick={handleSend} className="gap-2">
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
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </section>
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
