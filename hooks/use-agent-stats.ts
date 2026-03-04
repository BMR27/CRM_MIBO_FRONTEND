"use client"

import { useState, useEffect } from "react"

export interface AgentStats {
  id: string
  name: string
  email: string
  role: string
  active_conversations: number
  resolved_conversations: number
  total_conversations: number
}

export function useAgentStats() {
  const [stats, setStats] = useState<AgentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/users/agents`)

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }

      const data = await response.json()
      const agents = Array.isArray(data) ? data : data.agents || []
      // Calcular métricas (simulado, ajusta según tu modelo real)
      const mapped: AgentStats[] = agents.map((agent: any) => ({
        id: String(agent.id),
        name: agent.name || agent.full_name || agent.email,
        email: agent.email,
        role: agent.role?.name || agent.role || "agent",
        active_conversations: agent.active_conversations || 0,
        resolved_conversations: agent.resolved_conversations || 0,
        total_conversations: agent.total_conversations || 0,
      }))
      setStats(mapped)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      console.error("[useAgentStats] Error:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
