"use client"

import { InboxHeader } from "@/components/inbox-header"
import { WorkspaceOverview } from "@/components/workspace-overview"
import { useConversations } from "@/hooks/use-conversations"
import { useAgents } from "@/hooks/use-agents"

export default function EstadisticasPage() {
  const { conversations } = useConversations(true, true)
  const { agents } = useAgents()

  return (
    <>
      <InboxHeader />
      <WorkspaceOverview conversations={conversations} agents={agents} />
    </>
  )
}
