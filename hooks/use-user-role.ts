"use client"

import { useState, useEffect } from "react"
import { frontendApi } from "@/lib/api"

export type UserRole = "admin" | "supervisor" | "agent"

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export function useUserRole() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await frontendApi.get("/api/auth/me")
        
        const currentUser = data?.user || data
        const roleName = String(currentUser?.role || "").trim().toLowerCase()
        const roleMap: Record<string, UserRole> = {
          administrador: "admin",
          admin: "admin",
          supervisor: "supervisor",
          agente: "agent",
          agent: "agent",
        }

        const mappedRole = roleMap[roleName] || "agent"
        
        setUser({
          id: String(currentUser.id),
          email: currentUser.email,
          name: currentUser.name,
          role: mappedRole,
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const isAdmin = user?.role === "admin"
  const isSupervisor = user?.role === "supervisor"
  const isAgent = user?.role === "agent"
  const isAdminOrSupervisor = isAdmin || isSupervisor

  return {
    user,
    loading,
    error,
    role: user?.role,
    isAdmin,
    isSupervisor,
    isAgent,
    isAdminOrSupervisor,
  }
}
