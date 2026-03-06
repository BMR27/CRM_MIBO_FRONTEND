"use client"

import { useEffect, useState } from "react"
import { InboxHeader } from "@/components/inbox-header"
import { ConversationList } from "@/components/conversation-list"
import { ChatArea } from "@/components/chat-area"
import { OrdersPanel } from "@/components/orders-panel"
import { useSearchParams } from "next/navigation"
import { useConversations } from "@/hooks/use-conversations"
import { useAgents } from "@/hooks/use-agents"
import { useUserRole } from "@/hooks/use-user-role"

interface ConversationData {
  id: string;
  status: string;
  priority: string;
  agent_name?: string;
  created_at: string;
  last_message_at: string;
  contact_name: string;
  phone_number: string;
  contact_id?: string;
  assigned_agent_id?: string;
  externalUserId?: string;
  last_message?: any;
}

export default function InboxPage() {
  const { isAgent, loading: loadingRole } = useUserRole();
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const [selectedContactName, setSelectedContactName] = useState<string>()
  const [selectedContactId, setSelectedContactId] = useState<string>()
  const [currentAgentId, setCurrentAgentId] = useState<string>()
  const [conversationDetails, setConversationDetails] = useState<ConversationData>()
  const searchParams = typeof window !== "undefined" ? useSearchParams() : { get: () => undefined }
  const [refreshKey, setRefreshKey] = useState(0)
  const { conversations, refetch: refetchConversations } = useConversations(true, true)
  const { refetch: refetchAgents } = useAgents()

  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  useEffect(() => {
    const queryConvId = searchParams.get("conversationId")
    if (queryConvId && conversations.some(c => String(c.id) === queryConvId)) {
      handleSelectConversation(queryConvId)
      setHasAutoSelected(true);
      return;
    }
    // Solo seleccionar la primera conversación automáticamente una vez
    if (!selectedConversationId && conversations.length > 0 && !hasAutoSelected) {
      const first = conversations[0];
      setSelectedConversationId(String(first.id));
      setSelectedContactName(first.customer_name);
      setSelectedContactId(undefined);
      setCurrentAgentId(first.assigned_agent_id ? String(first.assigned_agent_id) : undefined);
      setConversationDetails({
        id: String(first.id),
        status: first.status,
        priority: first.priority,
        agent_name: undefined,
        created_at: first.created_at,
        last_message_at: first.updated_at,
        contact_name: first.customer_name,
        phone_number: first.customer_phone,
        contact_id: undefined,
        assigned_agent_id: first.assigned_agent_id ? String(first.assigned_agent_id) : undefined,
        externalUserId: undefined,
        last_message: undefined,
      });
      setHasAutoSelected(true);
    }
  }, [searchParams, conversations, selectedConversationId, hasAutoSelected]);
  const [isMobile, setIsMobile] = useState(false)
  const [showOrdersPanel, setShowOrdersPanel] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      setShowOrdersPanel(window.innerWidth >= 1280)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      const first = conversations[0]
      setSelectedConversationId(String(first.id))
      setSelectedContactName(first.customer_name)
      setSelectedContactId(undefined)
      
      setCurrentAgentId(first.assigned_agent_id ? String(first.assigned_agent_id) : undefined)
      setConversationDetails({
        id: String(first.id),
        status: first.status,
        priority: first.priority,
        agent_name: undefined,
        created_at: first.created_at,
        last_message_at: first.updated_at,
        contact_name: first.customer_name,
        phone_number: first.customer_phone,
        contact_id: undefined,
        assigned_agent_id: first.assigned_agent_id ? String(first.assigned_agent_id) : undefined,
        externalUserId: undefined,
        last_message: undefined,
      })
    }
  }, [selectedConversationId, conversations])

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setHasAutoSelected(true); // Marcar como seleccionada manualmente
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setSelectedContactName(conv.customer_name);
      setSelectedContactId(undefined);
      setCurrentAgentId(conv.assigned_agent_id ? String(conv.assigned_agent_id) : undefined);
      setConversationDetails({
        id: String(conv.id),
        status: conv.status,
        priority: conv.priority,
        agent_name: undefined,
        created_at: conv.created_at,
        last_message_at: conv.updated_at,
        contact_name: conv.customer_name,
        phone_number: conv.customer_phone,
        contact_id: undefined,
        assigned_agent_id: conv.assigned_agent_id ? String(conv.assigned_agent_id) : undefined,
        externalUserId: undefined,
        last_message: undefined,
      });
    }
  };

  const handleUpdate = () => {
    refetchAgents();
    refetchConversations();
    setRefreshKey((prev) => prev + 1);
  }

  const handleConversationDeleted = () => {
    setSelectedConversationId(undefined)
    setSelectedContactName(undefined)
    setSelectedContactId(undefined)
    setCurrentAgentId(undefined)
    setConversationDetails(undefined)
  }

  const handleAgentChange = (agentId: string, agentName: string) => {
    setCurrentAgentId(String(agentId))
    if (conversationDetails) {
      setConversationDetails({
        ...conversationDetails,
        agent_name: agentName,
        assigned_agent_id: String(agentId),
      })
    }
  }

  if (loadingRole) {
    return <div className="flex items-center justify-center h-full w-full">Cargando conversaciones...</div>;
  }
  return (
    <>
      <InboxHeader />
      <div className="flex h-full flex-1 overflow-hidden gap-0">
        {/* Conversations list - responsive width */}
        <div className="hidden md:flex h-full w-96 flex-col border-r border-border bg-card flex-shrink-0">
          <ConversationList
            key={refreshKey}
            selectedId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onlyAssigned={isAgent}
          />
        </div>
        {/* Visual spacer between panels */}
        <div className="hidden md:block w-4 flex-shrink-0 bg-muted/40" aria-hidden="true" />
        {/* Chat area - flex grow */}
        <div className="flex flex-1 flex-col min-w-0">
          <ChatArea
            conversationId={selectedConversationId}
            contactName={selectedContactName}
            currentAgentId={currentAgentId}
            channel={selectedConversationId ? conversations.find(c => String(c.id) === String(selectedConversationId))?.channel : undefined}
            externalUserId={
              selectedConversationId
                ? (
                    conversations.find(c => String(c.id) === String(selectedConversationId))?.external_user_id ||
                    conversations.find(c => String(c.id) === String(selectedConversationId))?.customer_phone
                  )
                : undefined
            }
            onUpdate={handleUpdate}
            onConversationDeleted={handleConversationDeleted}
          />
        </div>
        {/* Orders/Details panel - responsive */}
        {showOrdersPanel && (
          <>
          <div className="hidden xl:block w-4 flex-shrink-0 bg-muted/40" aria-hidden="true" />
          <div className="hidden xl:flex h-full w-72 flex-col border-l border-border bg-card flex-shrink-0 overflow-hidden">
              <OrdersPanel 
                conversationDetails={{
                  ...conversationDetails,
                  externalUserId: selectedConversationId
                    ? (
                        conversations.find(c => String(c.id) === String(selectedConversationId))?.external_user_id ||
                        conversations.find(c => String(c.id) === String(selectedConversationId))?.customer_phone
                      )
                    : undefined,
                  last_message: selectedConversationId
                    ? conversations.find(c => String(c.id) === String(selectedConversationId))?.last_message
                    : undefined
                }}
                onUpdate={handleUpdate}
                onAgentChange={handleAgentChange}
              />
          </div>
          </>
        )}
      </div>
    </>
  );
}
