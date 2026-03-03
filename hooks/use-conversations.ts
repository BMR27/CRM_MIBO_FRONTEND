"use client"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useState, useEffect, useCallback, useRef } from "react"

const POLL_INTERVAL = 5000 // 5s refresh in background

export interface Message {
  id: string
  content: string
  sender_type: "customer" | "agent" | "contact"
  created_at: string
  conversation_id: string
}

export interface Conversation {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  status: "active" | "resolved"
  priority: "low" | "medium" | "high"
  assigned_agent_id?: string
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
  channel?: string // whatsapp, facebook, etc
  external_user_id?: string // Facebook PSID or WhatsApp number
}


export function useConversations(onlyAssigned = false) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const prevConversationsRef = useRef<Conversation[]>([])
  // ...existing code...

  // Obtener el usuario actual desde localStorage
  useEffect(() => {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (userStr) {
        const user = JSON.parse(userStr)
        setUserId(user.id)
      }
    } catch (err) {
    }
  }, [])

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      // Verificar token
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        setError("No hay token de acceso. Inicia sesión.");
        setConversations([]);
        setLoading(false);
        return;
      }
      const { data } = await api.get("/api/conversations");
      const conversationsArray = Array.isArray(data) ? data : (data.conversations || []);
      const mappedConversations: Conversation[] = conversationsArray.map((conv: any) => ({
        id: String(conv.id),
        customer_name: conv.contact?.name || conv.customer_name || conv.contact_name || conv.name || conv.phone_number || "Sin nombre",
        customer_phone: conv.contact?.phone_number || conv.customer_phone || conv.phone_number || "",
        customer_email: conv.customer_email || conv.email || undefined,
        status: (conv.status as "active" | "resolved") || "active",
        priority: (conv.priority as "low" | "medium" | "high") || "low",
        assigned_agent_id: conv.assigned_agent_id ? String(conv.assigned_agent_id) : undefined,
        channel: conv.channel || "whatsapp",
        external_user_id: conv.external_user_id || conv.customer_phone,
        last_message: conv.last_message || undefined,
        unread_count: conv.unread_count || 0,
        created_at: conv.created_at || new Date().toISOString(),
        updated_at: conv.last_message_at || new Date().toISOString(),
      }));
      const filtered = onlyAssigned && userId
        ? mappedConversations.filter((conv) => conv.assigned_agent_id === userId)
        : mappedConversations;
        // Ordenar por último mensaje recibido (o actualizado)
        filtered.sort((a, b) => {
          const aDate = a.last_message?.created_at || a.updated_at || a.created_at
          const bDate = b.last_message?.created_at || b.updated_at || b.created_at
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        })
        // Notificación si hay nuevos mensajes
        if (prevConversationsRef.current.length > 0) {
          filtered.forEach((conv, idx) => {
            const prevConv = prevConversationsRef.current.find(c => c.id === conv.id)
            if (prevConv && conv.last_message && prevConv.last_message && conv.last_message.id !== prevConv.last_message.id && (conv.last_message.sender_type === "customer" || conv.last_message.sender_type === "contact")) {
              toast({
                title: `Nuevo mensaje de ${conv.customer_name}`,
                description: conv.last_message.content,
                variant: "default"
              })
            }
          })
        }
        prevConversationsRef.current = filtered
      setConversations(filtered);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener conversaciones";
      setError(errorMessage);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [onlyAssigned, userId]);

  const markAsRead = async (conversationId: string) => {
    try {
      await api.post(`/api/messages/mark-read/${conversationId}`);
    } catch (err) {
      // Silenciar error
    }
  };

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(() => {
      fetchConversations()
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyAssigned, userId])

  return { conversations, loading, error, refetch: fetchConversations, markAsRead }
}
