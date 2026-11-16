"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAgents } from "@/hooks/use-agents"
import { useLanguage } from "@/components/language-provider"

interface Agent {
  id: string
  name: string
  email: string
  status?: string
  role: "agent" | "admin"
}

interface AssignAgentDialogProps {
  conversationId: string
  currentAgentId?: string
  onAssign: (agentId: string, agentName: string) => void
}

export function AssignAgentDialog({ conversationId, currentAgentId, onAssign }: AssignAgentDialogProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { agents, loading: loadingAgents } = useAgents()

  const handleAssign = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    setLoading(true)
    try {
      console.log("[AssignAgentDialog] Assigning agent", agentId, "to conversation", conversationId)
      
      const response = await fetch(`/api/conversations/${conversationId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[AssignAgentDialog] Assignment successful:", result)
        onAssign(agentId, agent?.name || "")
        setOpen(false)
      } else {
        const error = await response.json()
        console.error("[AssignAgentDialog] Assignment failed:", error)
        alert(`${t("assignAgent.assignFail")} ${error.error || t("assignAgent.unknownError")}`)
      }
    } catch (error) {
      console.error("[AssignAgentDialog] Network error:", error)
      alert(t("assignAgent.networkError"))
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: t("assignAgent.available"),
      busy: t("assignAgent.busy"),
      offline: t("assignAgent.offline"),
    }
    return labels[status] || status
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          {t("assignAgent.assign")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("assignAgent.title")}</DialogTitle>
          <DialogDescription>{t("assignAgent.desc")}</DialogDescription>
        </DialogHeader>

        {loadingAgents ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">{t("assignAgent.loading")}</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">{t("assignAgent.noAgents")}</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAssign(agent.id)}
                  disabled={loading || agent.id === currentAgentId}
                  className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(agent.name)}
                        </AvatarFallback>
                      </Avatar>
                      {agent.status && (
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(agent.status)}`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{agent.name}</h3>
                        {agent.id === currentAgentId && <Badge variant="secondary">{t("assignAgent.assigned")}</Badge>}
                      </div>
                      <p className="text-muted-foreground text-xs">{agent.email}</p>
                      {agent.status && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {getStatusLabel(agent.status)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
