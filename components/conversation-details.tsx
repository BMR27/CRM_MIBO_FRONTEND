"use client"
import { useState, useEffect } from "react"
import { useUserRole } from "../hooks/use-user-role"
import { useToast } from "../hooks/use-toast"
import { api, frontendApi } from "../lib/api"
import {
  Info,
  FileText,
  Zap,
  User,
  FolderOpen,
  Calendar,
  Video,
  Link,
  ExternalLink,
  Plus,
  MessageSquare,
  Check,
  Copy,
  Phone,
  Trash2,
  Edit2,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
   

interface Meeting {
  id: number
  title: string
  date: string
  time: string
  type: "video" | "phone"
}

interface Comment {
  id: string
  text: string
  created_at: string
}

interface DetailsPanelProps {
    lastMessage?: { created_at: string }
  contactName?: string
  contactPhone?: string
  status?: string
  priority?: string
  agentName?: string
  lastActivity?: string
  onStatusChange?: (status: string) => void
  onPriorityChange?: (priority: string) => void
  conversationId?: string | number
  onUpdate?: () => void
  externalUserId?: string
}

export function ConversationDetails({
  contactName,
  contactPhone = "whatsapp:+5215548780484",
  status = "active",
  priority = "low",
  agentName = "Juan Perez",
  lastActivity = "16 ene",
  onStatusChange,
  onPriorityChange,
  conversationId,
  onUpdate,
  externalUserId,
  lastMessage,
  ...props
}: DetailsPanelProps) {
  const { isAgent } = useUserRole();
  // LOG: Validar externalUserId
  useEffect(() => {
    // Suponiendo que externalUserId viene de props, de contexto, o de algún fetch/conversación
    // Si existe en el scope, loguearlo
    if (typeof externalUserId !== 'undefined') {
      console.log('[ConversationDetails] externalUserId:', externalUserId);
    } else {
      console.log('[ConversationDetails] externalUserId is undefined');
    }
  }, [typeof externalUserId !== 'undefined' ? externalUserId : null]);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
  const [currentStatus, setCurrentStatus] = useState(status)
  const [currentPriority, setCurrentPriority] = useState(priority)
  const [currentAgent, setCurrentAgent] = useState<string | undefined>(undefined)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [scheduledSession, setScheduledSession] = useState<{
    title: string
    date: string
    time: string
    link?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const { agents, loading: agentsLoading } = require("../hooks/use-agents").useAgents();

  // Sincronizar el agente asignado desde props
  useEffect(() => {
    if (props && (props as any).assigned_agent_id) {
      const found = agents.find((a: any) => a.id === (props as any).assigned_agent_id)
      setCurrentAgent(found ? found.id : undefined)
    } else if (agentName) {
      // fallback por nombre
      const found = agents.find((a: any) => a.name === agentName)
      setCurrentAgent(found ? found.id : undefined)
    }
  }, [props, agentName, agents])

  const calendarBookingLink = "https://calendly.com/logimarket/sesion-cliente"

  const { toast } = useToast();
  // Cargar comentarios
  useEffect(() => {
    if (!conversationId) return

    const loadComments = async () => {
      setCommentsLoading(true)
      try {
        const { data } = await frontendApi.get(`/api/conversations/${conversationId}`)
        if (data.comments) {
          try {
            const parsed = JSON.parse(data.comments)
            setComments(Array.isArray(parsed) ? parsed : [])
          } catch (e) {
            if (typeof data.comments === "string" && data.comments.trim()) {
              const textComments = data.comments.split("\n").filter((line: string) => line.trim())
              const jsonArray = textComments.map((text: string, index: number) => ({
                id: `${Date.now()}-${index}`,
                text: text.trim(),
                created_at: new Date().toISOString(),
              }))
              setComments(jsonArray)
            } else {
              setComments([])
            }
          }
        } else {
          setComments([])
        }
      } catch (error: any) {
          // Axios error: error.response, fetch error: error.status
          const status = error?.response?.status || error?.status;
          if (status === 404) {
            toast({
              title: "Conversación eliminada o no encontrada",
              description: "La conversación ya no existe.",
              variant: "destructive",
            });
            setComments([]);
          } else {
            console.error("Error loading comments:", error);
          }
      } finally {
        setCommentsLoading(false)
      }
    }

    loadComments()
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return

    const loadCalls = async () => {
      try {
        const { data } = await api.get(`/api/calls?conversation_id=${conversationId}`)
        const mapped: Meeting[] = (data.calls || []).map((call: any) => {
          const d = new Date(call.scheduled_at)
          return {
            id: Number(call.id),
            title: call.notes?.trim() || "Llamada programada",
            date: d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
            time: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }),
            type: call.call_type === "video" ? "video" : "phone",
          }
        })
        setMeetings(mapped)
        const nextPending = (data.calls || [])
          .filter((call: any) => call.status !== "completed" && call.status !== "cancelled")
          .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0]
        if (nextPending) {
          const d = new Date(nextPending.scheduled_at)
          setScheduledSession({
            title: nextPending.notes?.trim() || "Llamada programada",
            date: d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
            time: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }),
            link: nextPending.meet_link,
          })
        } else {
          setScheduledSession(null)
        }
      } catch (error) {
        console.error("Error loading calls for conversation:", error)
      }
    }

    loadCalls()
    const handler = () => loadCalls()
    window.addEventListener("calls-updated", handler)
    return () => window.removeEventListener("calls-updated", handler)
  }, [conversationId])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(calendarBookingLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatusChange = async (value: string) => {
    setCurrentStatus(value)
    onStatusChange?.(value)

    if (conversationId) {
      try {
        const response = await frontendApi.put(`/api/conversations/${conversationId}/status`, { status: value })
        if (response.status === 200) {
          onUpdate?.()
        } else {
          setCurrentStatus(status)
        }
      } catch (error) {
        console.error("Error updating status:", error)
        setCurrentStatus(status)
      }
    }
  }

  const handlePriorityChange = async (value: string) => {
    setCurrentPriority(value)
    onPriorityChange?.(value)

    if (conversationId) {
      try {
        const response = await frontendApi.put(`/api/conversations/${conversationId}/priority`, { priority: value })
        if (response.status === 200) {
          onUpdate?.()
        } else {
          setCurrentPriority(priority)
        }
      } catch (error) {
        console.error("Error updating priority:", error)
        setCurrentPriority(priority)
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !conversationId) return

    setLoading(true)
    try {
      const response = await frontendApi.post(`/api/conversations/${conversationId}/comments`, { comment: newComment })
      if (response.status === 200) {
        setComments(response.data.comments)
        setNewComment("")
        onUpdate?.()
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!conversationId) return

    setLoading(true)
    try {
      const response = await frontendApi.delete(`/api/conversations/${conversationId}/comments`, { data: { commentId } })
      if (response.status === 200) {
        setComments(response.data.comments)
        onUpdate?.()
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editingText.trim() || !conversationId) return

    setLoading(true)
    try {
      const response = await frontendApi.put(`/api/conversations/${conversationId}/comments`, { commentId, text: editingText })
      if (response.status === 200) {
        setComments(response.data.comments)
        setEditingCommentId(null)
        setEditingText("")
        onUpdate?.()
      }
    } catch (error) {
      console.error("Error editing comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace("whatsapp:", "").replace("+", "")
  }

  return (
      <div className="flex flex-col h-full bg-card rounded-xl border border-border">
        {/* Header */}
        <div className="flex items-center gap-2 p-2 border-b border-border">
          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100">
            <Info className="h-2.5 w-2.5 text-blue-500" />
          </div>
          <span className="font-semibold text-xs text-foreground">Detalles</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
        <div className="flex border-b border-border">
          <div className="w-1 bg-blue-500 shrink-0" />
          <div className="flex-1 p-2">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-foreground truncate">{contactPhone}</span>
            </div>
            <a
              href={`https://wa.me/${contactPhone.replace("whatsapp:", "").replace("+", "")}`}
              className="text-xs text-primary hover:underline ml-4.5 block truncate"
            >
              {contactPhone}
            </a>
          </div>
        </div>

        <div className="flex border-b border-border">
          <div className="w-1 bg-blue-400 shrink-0" />
          <div className="flex-1 p-2">
            <div className="flex items-center mb-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="text-xs text-foreground">Estado</span>
              </div>
            </div>
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-7 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Activa
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    Pendiente
                  </div>
                </SelectItem>
                <SelectItem value="resolved">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Resuelta
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                    Cerrada
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex border-b border-border">
          <div className="w-1 bg-blue-300 shrink-0" />
          <div className="flex-1 p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-foreground">Prioridad</span>
            </div>
            <Select value={currentPriority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="h-7 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Alta
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    Media
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Baja
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex border-b border-border">
          <div className="w-1 bg-blue-400 shrink-0" />
          <div className="flex-1 p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <User className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-foreground">Agente</span>
            </div>
            <Select
              value={currentAgent}
              onValueChange={async (value) => {
                setCurrentAgent(value);
                if (value && value !== (props as any).assigned_agent_id) {
                  setLoading(true);
                  try {
                    await frontendApi.post(`/api/conversations/${conversationId}/assign`, { agentId: value });
                    toast({ title: "Conversación transferida", description: "La conversación fue asignada al nuevo agente." });
                    onUpdate?.();
                  } catch (err) {
                    toast({ title: "Error al transferir", description: "No se pudo asignar la conversación." });
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              disabled={agentsLoading || loading}
            >
              <SelectTrigger className="h-7 text-xs bg-background min-w-[120px]">
                <SelectValue placeholder="Seleccionar agente" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <span className="text-blue-500">{agent.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>


        {!isAgent && (
          <div className="flex border-b border-border">
            <div className="w-1 bg-blue-400 shrink-0" />
            <div className="flex-1 p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-foreground">Reuniones</span>
                </div>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted">
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>

              {/* Meetings List */}
              {meetings.length > 0 ? (
                <div className="space-y-1.5">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="bg-blue-50 border border-blue-200 rounded p-1.5">
                      <div className="flex items-center gap-1.5">
                        <Video className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800 truncate">{meeting.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5 ml-4.5">
                        <span className="text-xs text-blue-600">{meeting.date}</span>
                        <span className="text-xs text-blue-600">{meeting.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2">Sin reuniones agendadas</div>
              )}
            </div>
          </div>
        )}

        {!isAgent && (
          <div className="flex">
            <div className="w-1 bg-blue-500 shrink-0" />
            <div className="flex-1 p-2">
              <div className="flex items-center gap-1.5 mb-2">
                <Link className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-foreground">Agenda</span>
              </div>

              {/* Booking Link */}
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                <p className="text-xs text-blue-800 mb-1.5">Link para agendar sesión:</p>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={calendarBookingLink}
                    readOnly
                    className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1 text-blue-700 truncate"
                  />
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-100" onClick={handleCopyLink}>
                    {copied ? <Check className="h-3 w-3 text-blue-600" /> : <Copy className="h-3 w-3 text-blue-600" />}
                  </Button>
                  <a
                    href={calendarBookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-6 w-6 p-0 flex items-center justify-center hover:bg-blue-100 rounded"
                  >
                    <ExternalLink className="h-3 w-3 text-blue-600" />
                  </a>
                </div>
              </div>

              {/* Scheduled Session */}
              {scheduledSession ? (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Video className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">Sesión agendada</span>
                  </div>
                  <p className="text-xs text-blue-700 font-medium">{scheduledSession.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-blue-600">{scheduledSession.date}</span>
                    <span className="text-xs text-blue-600">{scheduledSession.time}</span>
                  </div>
                  <a
                    href={scheduledSession.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Video className="h-2.5 w-2.5" />
                    Unirse a la sesión
                  </a>
                </div>
              ) : (
                <div className="text-center py-2 border border-dashed border-blue-200 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Sin sesión agendada</p>
                  <p className="text-xs text-muted-foreground">Comparte el link con el cliente</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="flex">
          <div className="w-1 bg-[#6C5DD3] shrink-0" />
          <div className="flex-1 p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-[#6C5DD3]" />
                <span className="text-sm font-semibold text-[#6C5DD3]">Comentarios</span>
              </div>
            </div>

            {/* Comments List */}
            {comments && comments.length > 0 ? (
              <div className="space-y-1 max-h-40 overflow-y-auto rounded-md border border-border p-1.5 bg-muted/50 mb-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-background p-1.5 rounded border border-border text-xs space-y-0.5">
                    {editingCommentId === comment.id ? (
                      <>
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="resize-none h-12 text-xs"
                          disabled={loading}
                        />
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditingText("")
                            }}
                            disabled={loading}
                            className="h-6 text-xs"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment.id)}
                            disabled={!editingText.trim() || loading}
                            className="h-6 text-xs"
                          >
                            Guardar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground break-words text-xs">{comment.text}</p>
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <span className="text-muted-foreground text-xs">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingCommentId(comment.id)
                                setEditingText(comment.text)
                              }}
                              disabled={loading}
                              className="h-5 w-5 p-0 hover:bg-muted"
                            >
                              <Edit2 className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={loading}
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-1 mb-2">No hay comentarios</p>
            )}

            <Textarea
              placeholder="Agregar comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none h-16 text-xs mb-1.5"
              disabled={loading || commentsLoading || editingCommentId !== null}
            />

            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading || commentsLoading || editingCommentId !== null}
              size="sm"
              className="w-full gap-1 text-xs h-7"
            >
              {loading || commentsLoading ? "Guardando..." : "Guardar comentario"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
