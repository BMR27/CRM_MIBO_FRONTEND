"use client"

import { useEffect, useState } from "react"
import { InboxHeader } from "@/components/inbox-header"
import { ApiKeysSection } from "@/components/api-keys-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Inbox, Mail, Phone, Building2, ArrowRightCircle, Sparkles } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

type LeadStatus = "new" | "contacted" | "converted" | "discarded"

interface Lead {
  id: string
  name: string
  email: string | null
  phone_number: string | null
  company: string | null
  source: "web" | "api"
  source_detail: string | null
  status: LeadStatus
  contact_id: string | null
  created_at: string
}

const statusClassName: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  discarded: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function LeadsPage() {
  const { t } = useLanguage()
  const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
    new: { label: t("leads.status.new"), className: statusClassName.new },
    contacted: { label: t("leads.status.contacted"), className: statusClassName.contacted },
    converted: { label: t("leads.status.converted"), className: statusClassName.converted },
    discarded: { label: t("leads.status.discarded"), className: statusClassName.discarded },
  }
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const loadLeads = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/api/leads")
      setLeads(Array.isArray(data) ? data : [])
    } catch (err) {
      toast({ title: t("contacts.error"), description: t("leads.loadFail"), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  const handleConvert = async (lead: Lead) => {
    setActingId(lead.id)
    try {
      await api.post(`/api/leads/${lead.id}/convert`)
      toast({ title: t("leads.convertedTitle"), description: `${lead.name} ${t("leads.convertedDesc")}` })
      await loadLeads()
    } catch (err: any) {
      toast({
        title: t("leads.convertFailTitle"),
        description: err?.response?.data?.message || t("leads.convertFailDesc"),
        variant: "destructive",
      })
    } finally {
      setActingId(null)
    }
  }

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    setActingId(lead.id)
    try {
      await api.patch(`/api/leads/${lead.id}`, { status })
      await loadLeads()
    } catch (err) {
      toast({ title: t("contacts.error"), description: t("leads.statusUpdateFail"), variant: "destructive" })
    } finally {
      setActingId(null)
    }
  }

  const newCount = leads.filter((l) => l.status === "new").length
  const convertedCount = leads.filter((l) => l.status === "converted").length

  return (
    <>
      <InboxHeader />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("leads.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("leads.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Inbox className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{leads.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("leads.total")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{newCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("leads.unattended")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowRightCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{convertedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("leads.convertedToContact")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">{t("leads.received")}</TabsTrigger>
            <TabsTrigger value="api">{t("leads.apiCapture")}</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("leads.prospects")}</CardTitle>
                <CardDescription>{t("leads.sortedDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">{t("leads.loading")}</p>
                ) : leads.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{t("leads.emptyTitle")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("leads.emptyDesc")}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("contacts.name")}</TableHead>
                        <TableHead>{t("cl.contact")}</TableHead>
                        <TableHead>{t("leads.company")}</TableHead>
                        <TableHead>{t("leads.source")}</TableHead>
                        <TableHead>{t("details.status")}</TableHead>
                        <TableHead>{t("leads.receivedCol")}</TableHead>
                        <TableHead className="text-right">{t("cl.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                              {lead.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {lead.email}
                                </span>
                              )}
                              {lead.phone_number && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {lead.phone_number}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.company ? (
                              <span className="flex items-center gap-1 text-sm">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {lead.company}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {lead.source}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig[lead.status].className}>
                              {statusConfig[lead.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(lead.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {lead.status === "new" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={actingId === lead.id}
                                  onClick={() => handleStatusChange(lead, "contacted")}
                                >
                                  {t("leads.markContacted")}
                                </Button>
                              )}
                              {!lead.contact_id && lead.phone_number && lead.status !== "discarded" && (
                                <Button
                                  size="sm"
                                  disabled={actingId === lead.id}
                                  onClick={() => handleConvert(lead)}
                                  className="gap-1"
                                >
                                  <ArrowRightCircle className="h-3.5 w-3.5" />
                                  {t("leads.convert")}
                                </Button>
                              )}
                              {lead.status !== "converted" && lead.status !== "discarded" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={actingId === lead.id}
                                  onClick={() => handleStatusChange(lead, "discarded")}
                                  className="text-muted-foreground"
                                >
                                  {t("leads.discard")}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("leads.apiCaptureTitle")}</CardTitle>
                <CardDescription>
                  {t("leads.apiCaptureDesc")}{" "}
                  <code className="text-xs">POST /api/public/leads</code>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeysSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
