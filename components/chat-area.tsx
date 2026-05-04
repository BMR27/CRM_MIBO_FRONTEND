"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Send, MoreVertical, Phone, Video, Edit2, Trash2, Paperclip } from "lucide-react"
import { cn, formatContactDisplayName, getContactAvatarText } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"
import { MacrosDialog } from "./macros-dialog"
import { AssignAgentDialog } from "./assign-agent-dialog"
import { ScheduleCallDialog } from "./schedule-call-dialog"
import { EmojiPickerDialog } from "./emoji-picker-dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { api, frontendApi } from "@/lib/api"

interface Message {
  id: number | string
  content: string
  sender_type: string
  sender_name: string
  created_at: string
  message_type?: string
  metadata?: any
  media_url?: string | null
  whatsapp_message_id?: string | null
}

interface ChatAreaProps {
  conversationId?: number | string
  contactName?: string
  currentAgentId?: number | string
  channel?: string // 'whatsapp', 'facebook', etc
  externalUserId?: string // PSID for Facebook, phone for WhatsApp
  onUpdate?: () => void
  onConversationDeleted?: () => void
}

export function ChatArea({ conversationId, contactName, currentAgentId, channel = 'whatsapp', externalUserId, onUpdate, onConversationDeleted }: ChatAreaProps) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendingMedia, setSendingMedia] = useState(false)
  const [resolvedContactName, setResolvedContactName] = useState<string | undefined>(contactName)
  const [deleteConversationOpen, setDeleteConversationOpen] = useState(false)
  const [deletingConversation, setDeletingConversation] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<number | string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayContactName = formatContactDisplayName(resolvedContactName || contactName, channel)

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl)
    }
  }, [pendingPreviewUrl])

  useEffect(() => {
    if (conversationId) {
      fetchMessages()

      // Silent polling for new messages every 2s
      const intervalId = setInterval(() => fetchMessages(), 2000)
      return () => clearInterval(intervalId)
    }
  }, [conversationId])

  useEffect(() => {
    setResolvedContactName(contactName)
  }, [contactName])

  useEffect(() => {
    const shouldResolve = (value: string | undefined) => {
      const v = String(value || "").trim()
      if (!v) return true
      return v.toLowerCase().startsWith("whatsapp:+") || v.toLowerCase().startsWith("fb_")
    }

    const resolve = async () => {
      if (!conversationId) return
      if (!shouldResolve(resolvedContactName)) return
      try {
        const { data } = await api.get(`/api/conversations/${encodeURIComponent(String(conversationId))}`)
        const name = data?.contact_name ? String(data.contact_name) : ""
        if (name.trim()) setResolvedContactName(name.trim())
      } catch {
        // ignore
      }
    }

    void resolve()
    // Only when switching conversation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  const handleDeleteConversation = async () => {
    if (!conversationId) return

    try {
      setDeletingConversation(true)
      const { data, status } = await api.delete(`/api/conversations/${encodeURIComponent(String(conversationId))}`)
      if (status !== 200) {
        const message = data?.error || "No se pudo eliminar la conversación"
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Conversación eliminada",
        description: "Se eliminó correctamente.",
      })

      setDeleteConversationOpen(false)
      onConversationDeleted?.()
      onUpdate?.()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo eliminar la conversación",
        variant: "destructive",
      })
    } finally {
      setDeletingConversation(false)
    }
  }

  // Auto-scroll al bottom cuando hay nuevos mensajes
  // Auto-scroll inteligente: solo si el usuario está cerca del fondo
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        const container = scrollRef.current;
        if (container) {
          const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
          if (isNearBottom) {
            container.scrollTop = container.scrollHeight;
          }
        }
      }, 50);
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return

    try {
      // El token ya lo añade el interceptor de axios
      const { data } = await api.get(`/api/conversations/${conversationId}/messages`)
      // Ordenar por fecha ascendente (más viejos primero, más recientes último)
      const rawMessages = Array.isArray(data) ? data : (Array.isArray(data?.messages) ? data.messages : [])
      const sortedMessages = rawMessages.sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      setMessages(sortedMessages)
    } catch (error: any) {
      if (error.response) {
        console.error("[ChatArea] Fetch messages error:", error.response.status, error.response.data)
      } else {
        console.error("[ChatArea] Fetch messages error:", error)
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ChatArea] handleSendMessage called", { conversationId, sending, sendingMedia, newMessage, pendingFile });
    if (!conversationId || sending || sendingMedia) {
      console.log("[ChatArea] Blocked: missing conversationId or already sending", { conversationId, sending, sendingMedia });
      return;
    }

    const hasText = Boolean(newMessage.trim());
    const hasFile = Boolean(pendingFile);
    console.log("[ChatArea] hasText:", hasText, "hasFile:", hasFile);
    if (!hasText && !hasFile) {
      console.log("[ChatArea] Blocked: no text or file");
      return;
    }

    // If there is a pending attachment, send media. Text becomes caption.
    if (pendingFile) {
      setSendingMedia(true);
      const fileToSend = pendingFile;
      const previewToRevoke = pendingPreviewUrl;
      const caption = newMessage.trim();
      console.log("[ChatArea] Sending media", { fileToSend, caption, conversationId });
      try {
        const form = new FormData();
        form.append("file", fileToSend);
        if (caption) form.append("caption", caption);

        setPendingFile(null);
        setPendingPreviewUrl(null);
        setNewMessage("");

        const response = await frontendApi.post(`/api/conversations/${conversationId}/send-media`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data = response.data;
        console.log("[ChatArea] Media response", data);
        if (data?.message) {
          fetchMessages();
        } else {
          console.log("[ChatArea] No message in media response, fetching messages");
          await fetchMessages();
        }
      } catch (error: any) {
        console.error("[ChatArea] Send media error:", error);

        const errorMessage = error?.response?.data?.error || 
                             error?.response?.data?.message ||
                             error?.message || 
                             "Ocurrió un error inesperado al enviar el archivo."
        const errorHint = error?.response?.data?.hint || ""

        toast({
          title: "Error al enviar adjunto",
          description: errorHint ? `${errorMessage} - ${errorHint}` : errorMessage,
          variant: "destructive",
        });

        // Restore pending state for retry
        setPendingFile(fileToSend);
        if (previewToRevoke) setPendingPreviewUrl(previewToRevoke);
        setNewMessage(caption);
      } finally {
        if (previewToRevoke) {
          try { URL.revokeObjectURL(previewToRevoke); } catch {}
        }
        setSendingMedia(false);
      }
      return;
    }

    const messageContent = newMessage;
    setSending(true);
    setNewMessage(""); // Clear input immediately for better UX
    console.log("[ChatArea] Sending text message", { channel, externalUserId, messageContent, conversationId });
    try {
      // Detectar canal y usar endpoint apropiado
      if (channel === 'facebook' && externalUserId) {
        console.log("[ChatArea] Sending Facebook message", { externalUserId, messageContent, conversationId });
        const { data } = await api.post(`/api/facebook/send`, {
          recipientId: externalUserId,
          message: messageContent,
          conversationId: conversationId
        });
        console.log("[ChatArea] Facebook response", data);
        fetchMessages();
      } else if (channel === 'whatsapp' && externalUserId) {
        // Enviar mensaje por WhatsApp usando el endpoint del backend real
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app";
        const token = localStorage.getItem('token') || '';
        console.log("[ChatArea] Sending WhatsApp message", { externalUserId, messageContent, conversationId });
        const { data } = await api.post(`${BACKEND_URL}/api/whatsapp/send`, {
          phone_number: externalUserId,
          message: messageContent
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("[ChatArea] WhatsApp response", data);
        if (data.success) {
          fetchMessages();
        } else {
          console.log("[ChatArea] WhatsApp error", data.error);
          toast({
            title: "Error al enviar mensaje WhatsApp",
            description: data.error || "No se pudo enviar el mensaje.",
            variant: "destructive",
          });
          setNewMessage(messageContent);
        }
      } else {
        // Enviar via endpoint normal (otros canales)
        console.log("[ChatArea] Sending generic message", { messageContent, conversationId });
        const response = await api.post(`/api/conversations/${conversationId}/messages`, { content: messageContent });
        const data = response.data;
        console.log("[ChatArea] Generic response", data);
        if (data.success === false) {
          console.log("[ChatArea] Error in generic response", data.error, data.hint);
          toast({
            title: "Error al enviar mensaje",
            description: data.error + (data.hint ? ` (${data.hint})` : ""),
            variant: "destructive",
          });
          setNewMessage(messageContent);
          return;
        }
        if (data.message) {
          fetchMessages();
        }
      }
    } catch (error) {
      console.error("[ChatArea] Send message error:", error);
      toast({
        title: "Error al enviar mensaje",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  }

  const handlePickFile = () => {
    if (!conversationId || sending || sendingMedia) return
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !conversationId) return

    // allow selecting the same file again later
    e.target.value = ""

    // Replace previous pending attachment
    if (pendingPreviewUrl) {
      try { URL.revokeObjectURL(pendingPreviewUrl) } catch {}
    }

    setPendingFile(file)
    // Only generate preview for media types the browser can display
    const mime = String(file.type || "").toLowerCase()
    const canPreview = mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("audio/")
    setPendingPreviewUrl(canPreview ? URL.createObjectURL(file) : null)
  }

  const clearPendingAttachment = () => {
    setPendingFile(null)
    if (pendingPreviewUrl) {
      try { URL.revokeObjectURL(pendingPreviewUrl) } catch {}
    }
    setPendingPreviewUrl(null)
  }

  const handleMacroSelect = async (content: string, macroId: number) => {
    setNewMessage(content)
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  const handleEditMessage = async (messageId: number | string) => {
    if (!editingContent.trim() || !conversationId) return

    try {
      const response = await api.put(`/api/conversations/${conversationId}/messages/${messageId}`, { content: editingContent.trim() })
      if (response.status === 200) {
        setMessages(
          messages.map((msg) =>
            msg.id === messageId ? { ...msg, content: editingContent.trim() } : msg
          )
        )
        setEditingMessageId(null)
        setEditingContent("")
        onUpdate?.()
      } else {
        console.error("Error editing message:", response.status)
      }
    } catch (error) {
      console.error("Error editing message:", error)
    }
  }

  const handleDeleteMessage = async (messageId: number | string) => {
    if (!conversationId) return

    try {
      const response = await api.delete(`/api/conversations/${conversationId}/messages/${messageId}`)
      if (response.status === 200) {
        setMessages(messages.filter((msg) => msg.id !== messageId))
        onUpdate?.()
      } else {
        console.error("Error deleting message:", response.status)
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const renderMessageBody = (msg: Message) => {
    // Always parse metadata in case it arrives as a JSON string
    const metadata: any = (() => {
      if (!msg.metadata) return {}
      if (typeof msg.metadata === "string") {
        try { return JSON.parse(msg.metadata) } catch { return {} }
      }
      return msg.metadata
    })()

    const mediaUrl = (() => {
      // Prefer explicit media_url column, then metadata.media_url, then construct from media_id
      const raw = msg.media_url
          || metadata?.media_url
          || (() => {
              const mid = metadata?.media_id
              if (!mid) return null
              // UUID → agent-uploaded file served by /api/media/
              // Otherwise → WhatsApp Cloud API media served by /api/whatsapp/media/
              const isUploadUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(mid))
              return isUploadUuid
                ? `/api/media/${mid}`
                : `/api/whatsapp/media/${mid}`
            })()
        || null
      if (!raw || typeof window === "undefined") return raw

      const token = localStorage.getItem("access_token") || localStorage.getItem("token") || ""

      // Twilio API URLs (api.twilio.com) require Basic Auth — route through proxy using message SID
      if (raw.includes("api.twilio.com")) {
        const sid = msg.whatsapp_message_id || metadata?.whatsapp_message_id || null
        if (sid) {
          const inferredFilename = String(metadata?.filename || metadata?.media_filename || msg.content || "").trim()
          let proxyUrl = `/api/twilio/media-by-message/${encodeURIComponent(String(sid))}`
          if (inferredFilename) proxyUrl += `?filename=${encodeURIComponent(inferredFilename)}`
          if (token) {
            const sep = proxyUrl.includes("?") ? "&" : "?"
            proxyUrl += `${sep}token=${encodeURIComponent(token)}`
          }
          return proxyUrl
        }
        // No SID available → can't proxy; return null so the SID fallback block handles it
        return null
      }

      // For media proxy links that need JWT, add token as query param
      if (raw.startsWith("/api/whatsapp/media/") || raw.startsWith("/api/twilio/media-by-message/")) {
        if (!token) return raw
        const separator = raw.includes("?") ? "&" : "?"
        return `${raw}${separator}token=${encodeURIComponent(token)}`
      }

      return raw
    })()
    const filename = metadata?.filename || metadata?.media_filename || ""
    const caption = metadata?.caption || metadata?.media_caption || ""
    const metaMimeType: string = metadata?.mime_type || metadata?.media_mime_type || ""

    // Infer type: use message_type, then metadata.type, then mime type
    const inferredType = (() => {
      const raw = msg.message_type || metadata?.type || ""
      if (["image", "video", "audio", "document", "sticker"].includes(raw)) return raw
      if (mediaUrl || metaMimeType) {
        if (metaMimeType.startsWith("image/")) return "image"
        if (metaMimeType.startsWith("video/")) return "video"
        if (metaMimeType.startsWith("audio/")) return "audio"
        if (metaMimeType) return "document"
      }
      return "text"
    })()
    const type = inferredType

    const isPlaceholderContent = (value: unknown) => {
      const text = String(value || "").trim().toLowerCase()
      return (
        text === "[imagen]" ||
        text === "[sticker]" ||
        text === "[documento]" ||
        text === "[audio]" ||
        text === "[video]" ||
        /^\[[a-z0-9_\- ]+\s+mensaje\]$/.test(text)
      )
    }

    const textToShow = caption || (!isPlaceholderContent(msg.content) ? String(msg.content || "").trim() : "")
    const displayName = filename || msg.content || "Ver archivo"

    // If no URL but it's a media message, show a disabled placeholder with the filename
    if (!mediaUrl) {
      if (type === "text") {
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {msg.content}
          </p>
        )
      }

      const sid = msg.whatsapp_message_id || metadata?.whatsapp_message_id || null
      let fallbackDownloadUrl: string | null = null
      if (sid) {
        const inferredFilename = String(filename || msg.content || "archivo").trim()
        fallbackDownloadUrl = `/api/twilio/media-by-message/${encodeURIComponent(String(sid))}`
        if (inferredFilename) {
          fallbackDownloadUrl += `?filename=${encodeURIComponent(inferredFilename)}`
        }

        if (typeof window !== "undefined") {
          const token = localStorage.getItem("access_token") || localStorage.getItem("token") || ""
          if (token) {
            const separator = fallbackDownloadUrl.includes("?") ? "&" : "?"
            fallbackDownloadUrl = `${fallbackDownloadUrl}${separator}token=${encodeURIComponent(token)}`
          }
        }
      }

      // Media message without URL (token not configured or media_id missing)
      return (
        <div className="space-y-2 rounded-md border border-border bg-muted/40 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {type === "image" ? "🖼️" : type === "video" ? "🎬" : type === "audio" ? "🎵" : "📄"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">Archivo no disponible para previsualizar</p>
            </div>
          </div>

          {fallbackDownloadUrl ? (
            <a
              href={fallbackDownloadUrl}
              download={filename || undefined}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors w-full"
            >
              ⬇ Descargar archivo
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium w-full bg-muted text-muted-foreground border border-border cursor-not-allowed"
            >
              Descarga no disponible
            </button>
          )}
        </div>
      )
    }

    if (type === "image" || type === "sticker") {
      return (
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <img
              src={mediaUrl}
              alt={caption || filename || "imagen"}
              className="max-w-full rounded-md border border-border"
              loading="lazy"
            />
            <a
              href={mediaUrl}
              download={filename || "imagen"}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors w-fit"
            >
              ⬇ Descargar imagen
            </a>
          </div>
          {textToShow && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {textToShow}
            </p>
          )}
        </div>
      )
    }

    if (type === "video") {
      return (
        <div className="space-y-2">
          <video
            src={mediaUrl}
            controls
            className="max-w-full rounded-md border border-border"
          />
          <a
            href={mediaUrl}
            download={filename || "video"}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors w-fit"
          >
            ⬇ Descargar video
          </a>
          {textToShow && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {textToShow}
            </p>
          )}
        </div>
      )
    }

    if (type === "audio") {
      return (
        <div className="space-y-2">
          <audio src={mediaUrl} controls className="w-full" />
          <a
            href={mediaUrl}
            download={filename || "audio"}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors w-fit"
          >
            ⬇ Descargar audio
          </a>
          {textToShow && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {textToShow}
            </p>
          )}
        </div>
      )
    }

    // document or unknown media types: show download card
    return (
      <div className="space-y-2">
        <div className="rounded-md border border-border bg-muted/40 p-3">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-lg">📄</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
            </div>
          </div>
          <a
            href={mediaUrl}
            download={filename || undefined}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors w-full"
          >
            ⬇ Descargar archivo
          </a>
        </div>
        {caption && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {caption}
          </p>
        )}
      </div>
    )
  }

  // Usar la función global para obtener iniciales o canal
  const getBubbleAvatarText = (msg: Message) => {
    // Si el nombre está vacío, usar fallback
    if (!msg.sender_name || msg.sender_name.trim() === "") {
      if (msg.sender_type === "agent" || msg.sender_type === "user") return "A";
      return "C";
    }
    // Si es agente/usuario, usar el nombre
    if (msg.sender_type === "agent" || msg.sender_type === "user") {
      return getContactAvatarText(msg.sender_name, "agent");
    }
    // Si es contacto, usar nombre/contacto/canal
    return getContactAvatarText(msg.sender_name, channel);
  }

  console.log('[ChatArea] Renderizando mensajes:', messages);
  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Chat Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 transition-transform duration-200 hover:scale-105">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {displayContactName ? getContactAvatarText(displayContactName, channel) : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-foreground">{displayContactName || "Contacto"}</h2>
              {/* Channel badge */}
              {channel && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  channel === 'facebook' && "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
                  channel === 'whatsapp' && "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                )}>
                  {channel === 'facebook' && '💬 Facebook'}
                  {channel === 'whatsapp' && '💚 WhatsApp'}
                  {channel !== 'facebook' && channel !== 'whatsapp' && channel}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-500/50" />
              En línea
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversationId && (
            <AssignAgentDialog
              conversationId={conversationId.toString()}
              currentAgentId={currentAgentId?.toString()}
              onAssign={(agentId, agentName) => onUpdate?.()}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent transition-colors"
            onClick={() => console.log("Initiate phone call")}
            title="Llamada telefónica"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent transition-colors"
            onClick={() => console.log("Initiate video call")}
            title="Videollamada"
          >
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setScheduleCallOpen(true)}>
                Agendar llamada
              </DropdownMenuItem>
              <DropdownMenuItem>Enviar encuesta</DropdownMenuItem>
              <DropdownMenuItem>Transferir conversación</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteConversationOpen(true)}
                disabled={!conversationId || deletingConversation}
              >
                Eliminar conversación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteConversationOpen} onOpenChange={setDeleteConversationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la conversación y sus mensajes. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingConversation}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void handleDeleteConversation()
              }}
              disabled={deletingConversation}
            >
              {deletingConversation ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Call Dialog */}
      <ScheduleCallDialog
        open={scheduleCallOpen}
        onOpenChange={setScheduleCallOpen}
        contactName={contactName}
        phoneNumber=""
        conversationId={conversationId}
      />

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20"
      >
        <div className="flex flex-col justify-end gap-4 p-6 min-h-full">
          {loading ? (
            <p className="text-center text-muted-foreground text-sm">Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No hay mensajes aún</p>
          ) : (
            
            messages.map((msg, index) => {
              // Comparar hora con el mensaje anterior
              const prevMsg = index > 0 ? messages[index - 1] : null
              const currentTime = format(new Date(msg.created_at), "dd MMM HH:mm", { locale: es })
              const prevTime = prevMsg ? format(new Date(prevMsg.created_at), "dd MMM HH:mm", { locale: es }) : null
              const showTimestamp = !prevTime || currentTime !== prevTime

              const isAgentMsg = msg.sender_type === "agent" || msg.sender_type === "user"
              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-3 animate-fade-in-up flex-shrink-0 group", msg.sender_type === "contact" && "flex-row-reverse")}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={cn(
                        "font-semibold",
                        !isAgentMsg ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {getBubbleAvatarText(msg)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[70%] min-w-0 space-y-1 flex flex-col",
                      !isAgentMsg && "items-end",
                    )}
                  >
                    {editingMessageId === msg.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="min-h-20 text-sm rounded-lg"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMessageId(null)
                              setEditingContent("")
                            }}
                            className="text-xs h-8"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditMessage(msg.id)}
                            disabled={!editingContent.trim()}
                            className="text-xs h-8"
                          >
                            Guardar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={cn(
                            "max-w-full rounded-lg px-4 py-2 shadow-sm transition-all hover:shadow-md group-hover:ring-2",
                            msg.sender_type === "contact"
                              ? "bg-primary text-primary-foreground group-hover:ring-primary/50"
                              : "bg-card text-foreground border border-border group-hover:ring-muted-foreground/30",
                          )}
                        >
                          {renderMessageBody(msg)}
                        </div>
                        {showTimestamp && (
                          <p className="text-muted-foreground text-xs px-1">
                            {currentTime}
                          </p>
                        )}
                        {msg.sender_type === "agent" && (
                          <div className={cn("flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", msg.sender_type === "agent" && "flex-row-reverse")}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMessageId(msg.id)
                                setEditingContent(msg.content)
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card p-4 sticky bottom-0">
        <div className="mb-2 flex gap-2">
          <MacrosDialog onSelectMacro={handleMacroSelect} />
        </div>

        {pendingFile && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Adjunto listo para enviar</p>
              <p className="text-sm truncate">{pendingFile.name}</p>
              {pendingPreviewUrl && String(pendingFile.type || "").toLowerCase().startsWith("image/") && (
                <img src={pendingPreviewUrl} alt={pendingFile.name} className="mt-2 max-h-48 rounded-md border border-border" />
              )}
              {pendingPreviewUrl && String(pendingFile.type || "").toLowerCase().startsWith("video/") && (
                <video src={pendingPreviewUrl} controls className="mt-2 max-h-48 rounded-md border border-border" />
              )}
              {pendingPreviewUrl && String(pendingFile.type || "").toLowerCase().startsWith("audio/") && (
                <audio src={pendingPreviewUrl} controls className="mt-2 w-full" />
              )}
            </div>
            <Button type="button" variant="ghost" onClick={clearPendingAttachment} disabled={sending || sendingMedia}>
              Quitar
            </Button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={handlePickFile}
            disabled={sending || sendingMedia}
            className="shrink-0"
            title="Adjuntar archivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <EmojiPickerDialog 
            onEmojiSelect={handleEmojiSelect}
            disabled={sending || sendingMedia}
          />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={pendingFile ? "Escribe una leyenda (opcional)..." : "Escribe un mensaje..."}
            disabled={sending || sendingMedia}
            className="flex-1 transition-all focus:ring-2 focus:ring-primary"
          />
          <Button
            type="submit"
            disabled={sending || sendingMedia || (!newMessage.trim() && !pendingFile)}
            className="transition-all hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
