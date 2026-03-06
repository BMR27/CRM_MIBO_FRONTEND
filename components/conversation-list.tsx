"use client"

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, formatContactDisplayName, getContactAvatarText } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

import { useConversations, Conversation } from "@/hooks/use-conversations"

interface ConversationListProps {
  selectedId?: string
  onSelectConversation: (id: string) => void
  onlyAssigned?: boolean
}

export function ConversationList({
  selectedId,
  onSelectConversation,
  onlyAssigned,
}: ConversationListProps) {

  const { conversations, loading, error, markAsRead, refetch } = useConversations(onlyAssigned)
  // Obtener el usuario logueado
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  // Filtrar conversaciones por assigned_agent_id solo si el usuario es agente
  const [searchTerm, setSearchTerm] = useState("");
  let filteredConversations = conversations;
  if (user && (user.role === "agent" || user.role === "Agente")) {
    filteredConversations = conversations.filter((conv) => conv.assigned_agent_id && String(conv.assigned_agent_id) === String(userId));
  }
  // Filtrar por barra de búsqueda
  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    filteredConversations = filteredConversations.filter(conv =>
      conv.customer_name?.toLowerCase().includes(term) ||
      conv.customer_phone?.toLowerCase().includes(term)
    );
  }


  const getDisplayName = (name: string, channel?: string) =>
    formatContactDisplayName(name, channel)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
      default:
        return "bg-muted text-foreground border-border"
    }
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      high: "Alta",
      medium: "Media",
      normal: "Normal",
      low: "Baja",
    }
    return labels[priority] || priority
  }

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case "facebook":
        return "💬"
      case "whatsapp":
        return "💚"
      case "instagram":
        return "📷"
      default:
        return "💬"
    }
  }

  const getChannelColor = (channel?: string) => {
    switch (channel) {
      case "facebook":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
      case "whatsapp":
        return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
      case "instagram":
        return "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Solo mostrar loader si no hay conversaciones en memoria
  if (loading && (!conversations || conversations.length === 0)) {
    return (
      <div className="h-full p-3">
        <div className="h-full rounded-xl border bg-card shadow-sm flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Cargando conversaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full p-3">
        <div className="h-full rounded-xl border bg-card shadow-sm flex items-center justify-center p-4">
          <p className="text-red-500 text-sm text-center">{error}</p>
        </div>
      </div>
    )
  }


  if (!loading && filteredConversations.length === 0) {
    return (
      <div className="h-full p-3">
        <div className="h-full rounded-xl border bg-card shadow-sm flex items-center justify-center p-4">
          <p className="text-muted-foreground text-sm text-center">No hay conversaciones</p>
        </div>
      </div>
    )
  }

  return (
    // 🔥 ESTE WRAPPER ES LA CLAVE: crea el “recuadro” del sidebar y separa del chat
    <div className="h-full p-3 pr-4">
      <div className="h-full rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Barra de búsqueda */}
        <div className="p-3 pb-0">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o número..."
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <ScrollArea className="h-full">
          {/* padding interno del panel */}
          <div className="space-y-3 p-3">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={async () => {
                  onSelectConversation(conv.id)
                  await markAsRead(conv.id)
                  if (typeof refetch === 'function') refetch();
                }}
                className={cn(
                  "relative w-full rounded-lg border bg-background p-3 text-left shadow-sm transition-[box-shadow,background-color,border-color] duration-150 cursor-pointer hover:z-10",
                  selectedId === conv.id
                    ? "z-10 border-primary/60 bg-primary/10 ring-2 ring-inset ring-primary/25 shadow-md"
                    : "border-border/70 hover:border-border hover:shadow-md",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                        {getContactAvatarText(getDisplayName(conv.customer_name, conv.channel), conv.channel)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Icono del canal */}
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs shadow-md ring-2 ring-background",
                        getChannelColor(conv.channel),
                      )}
                    >
                      {getChannelIcon(conv.channel)}
                    </div>

                    {/* Badge de mensajes no leídos */}
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5 font-bold border border-white shadow-lg z-10">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 mb-1">
                      <h3 className="min-w-0 truncate font-bold text-sm text-foreground">
                        {getDisplayName(conv.customer_name, conv.channel)}
                      </h3>
                      <span className="whitespace-nowrap text-right text-muted-foreground text-xs font-medium">
                        {formatDistanceToNow(new Date(conv.last_message?.created_at || conv.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>

                    <p className="line-clamp-1 text-muted-foreground text-xs leading-relaxed mb-2">
                      {typeof conv.last_message === "string"
                        ? conv.last_message
                        : conv.last_message?.content || "Sin mensajes"}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 rounded-full px-2 text-xs font-semibold border-2",
                          getPriorityColor(conv.priority),
                        )}
                      >
                        {getPriorityLabel(conv.priority)}
                      </Badge>

                      {/* Puedes mostrar el agente si lo tienes disponible */}
                      {/* {conv.agent_name && (
                        <span className="truncate text-foreground text-xs font-medium bg-muted px-2 py-0.5 rounded-full">
                          👤 {conv.agent_name}
                        </span>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
