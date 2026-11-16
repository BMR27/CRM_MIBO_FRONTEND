"use client"
import { useState, useEffect } from "react"
import { useToast } from "../hooks/use-toast"
import { frontendApi } from "../lib/api"
import {
  Info,
  Zap,
  User,
  MessageSquare,
  Edit2,
  Trash2,
  Send,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { useLanguage } from "@/components/language-provider"

const localeMap: Record<string, string> = { es: "es-MX", en: "en-US", pl: "pl-PL", ru: "ru-RU" }

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

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ConversationDetails({
  contactName,
  contactPhone = "whatsapp:+5215548780484",
  status = "active",
  priority = "low",
  agentName = "Juan Perez",
  onStatusChange,
  onPriorityChange,
  conversationId,
  onUpdate,
  externalUserId,
  lastMessage,
  ...props
}: DetailsPanelProps) {
  const { t, language } = useLanguage()
  const locale = localeMap[language] || "es-MX"
  const [currentStatus, setCurrentStatus] = useState(status)
  const [currentPriority, setCurrentPriority] = useState(priority)
  const [currentAgent, setCurrentAgent] = useState<string | undefined>(undefined)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const { agents, loading: agentsLoading } = require("../hooks/use-agents").useAgents()

  useEffect(() => {
    setCurrentStatus(status || "active")
  }, [status, conversationId])

  useEffect(() => {
    setCurrentPriority(priority || "low")
  }, [priority, conversationId])

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

  const { toast } = useToast()
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
        const status = error?.response?.status || error?.status
        if (status === 404) {
          toast({
            title: t("details.toast.convNotFoundTitle"),
            description: t("details.toast.convNotFoundDesc"),
            variant: "destructive",
          })
          setComments([])
        } else {
          console.warn("No se pudieron cargar los comentarios de la conversación", {
            status,
            message: error?.response?.data?.error || error?.message || "Error desconocido",
          })
          setComments([])
        }
      } finally {
        setCommentsLoading(false)
      }
    }

    loadComments()
  }, [conversationId])

  const handleStatusChange = async (value: string) => {
    const previousStatus = currentStatus
    setCurrentStatus(value)
    onStatusChange?.(value)

    if (conversationId) {
      try {
        const response = await frontendApi.put(`/api/conversations/${conversationId}/status`, { status: value })
        if (response.status === 200) {
          toast({ title: t("details.toast.statusUpdatedTitle"), description: t("details.toast.statusUpdatedDesc") })
          onUpdate?.()
        } else {
          setCurrentStatus(previousStatus)
        }
      } catch (error) {
        console.error("Error updating status:", error)
        setCurrentStatus(previousStatus)
        toast({ title: t("details.toast.statusErrorTitle"), description: t("details.toast.statusErrorDesc"), variant: "destructive" })
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
        toast({ title: t("details.toast.commentSavedTitle"), description: t("details.toast.commentSavedDesc") })
        onUpdate?.()
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({ title: t("details.toast.commentErrorTitle"), description: t("details.toast.commentErrorDesc"), variant: "destructive" })
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

  const displayName = contactName?.trim() || contactPhone
  const waNumber = contactPhone.replace("whatsapp:", "").replace("+", "")

  const statusOptions = [
    { value: "active", label: t("details.status.active"), dot: "bg-blue-500" },
    { value: "resolved", label: t("details.status.resolved"), dot: "bg-emerald-500" },
  ]
  const priorityOptions = [
    { value: "high", label: t("conv.priority.high"), dot: "bg-red-500" },
    { value: "medium", label: t("conv.priority.medium"), dot: "bg-amber-500" },
    { value: "low", label: t("conv.priority.low"), dot: "bg-sky-500" },
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Info className="h-3.5 w-3.5" />
        </div>
        <span className="font-semibold text-sm text-foreground">{t("details.title")}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Contacto */}
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary hover:underline truncate block"
              >
                {contactPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Estado + Prioridad */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${statusOptions.find((o) => o.value === currentStatus)?.dot || "bg-blue-500"}`} />
              {t("details.status")}
            </div>
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Zap className="h-3 w-3" />
              {t("details.priority")}
            </div>
            <Select value={currentPriority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agente */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <User className="h-3 w-3" />
            {t("details.agent")}
          </div>
          <Select
            value={currentAgent}
            onValueChange={async (value) => {
              setCurrentAgent(value)
              if (value && value !== (props as any).assigned_agent_id) {
                setLoading(true)
                try {
                  await frontendApi.post(`/api/conversations/${conversationId}/assign`, { agentId: value })
                  toast({ title: t("details.toast.transferredTitle"), description: t("details.toast.transferredDesc") })
                  onUpdate?.()
                } catch (err) {
                  toast({ title: t("details.toast.transferErrorTitle"), description: t("details.toast.transferErrorDesc") })
                } finally {
                  setLoading(false)
                }
              }
            }}
            disabled={agentsLoading || loading}
          >
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder={t("details.selectAgent")} />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent: any) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Comentarios */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/40">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-600">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-foreground">{t("details.comments")}</span>
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
                {comments.length}
              </Badge>
            )}
          </div>

          <div className="p-3 space-y-3">
            {comments && comments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                {comments.map((comment) => (
                  <div key={comment.id} className="group rounded-lg border border-border bg-muted/30 p-2.5 text-xs">
                    {editingCommentId === comment.id ? (
                      <>
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="resize-none h-16 text-xs bg-background"
                          disabled={loading}
                        />
                        <div className="flex gap-1.5 justify-end mt-1.5">
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
                            {t("chat.cancel")}
                          </Button>
                          <Button size="sm" onClick={() => handleEditComment(comment.id)} disabled={!editingText.trim() || loading} className="h-6 text-xs">
                            {t("chat.save")}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground break-words leading-relaxed">{comment.text}</p>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-muted-foreground text-[11px]">
                            {new Date(comment.created_at).toLocaleDateString(locale, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="rounded-lg border border-dashed border-border py-4 text-center">
                <p className="text-xs text-muted-foreground">{t("details.noComments")}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Textarea
                placeholder={t("details.addCommentPlaceholder")}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none h-16 text-xs bg-background"
                disabled={loading || commentsLoading || editingCommentId !== null}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || loading || commentsLoading || editingCommentId !== null}
                size="sm"
                className="w-full gap-1.5 text-xs h-8"
              >
                <Send className="h-3 w-3" />
                {loading || commentsLoading ? t("details.saving") : t("details.saveComment")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
