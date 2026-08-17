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

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "Nuevo", className: "bg-blue-50 text-blue-700 border-blue-200" },
  contacted: { label: "Contactado", className: "bg-amber-50 text-amber-700 border-amber-200" },
  converted: { label: "Convertido", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  discarded: { label: "Descartado", className: "bg-slate-100 text-slate-600 border-slate-200" },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const loadLeads = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/api/leads")
      setLeads(Array.isArray(data) ? data : [])
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron cargar los leads.", variant: "destructive" })
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
      toast({ title: "Lead convertido", description: `${lead.name} ahora es un contacto del CRM.` })
      await loadLeads()
    } catch (err: any) {
      toast({
        title: "No se pudo convertir",
        description: err?.response?.data?.message || "Revisa que el lead tenga un teléfono válido.",
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
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" })
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground">
              Prospectos capturados desde formularios externos o integraciones vía API.
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
                <p className="text-xs text-muted-foreground mt-1">Leads totales</p>
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
                <p className="text-xs text-muted-foreground mt-1">Sin atender</p>
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
                <p className="text-xs text-muted-foreground mt-1">Convertidos a contacto</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">Leads recibidos</TabsTrigger>
            <TabsTrigger value="api">Captura por API</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prospectos</CardTitle>
                <CardDescription>Ordenados del más reciente al más antiguo.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">Cargando leads...</p>
                ) : leads.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Todavía no has recibido leads</p>
                    <p className="text-xs text-muted-foreground">
                      Genera una API key en la pestaña "Captura por API" para empezar a recibirlos.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Recibido</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
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
                                  Marcar contactado
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
                                  Convertir
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
                                  Descartar
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
                <CardTitle className="text-base">Captura de leads por API</CardTitle>
                <CardDescription>
                  Genera una API key para integrar tu sitio web o sistemas externos con{" "}
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
