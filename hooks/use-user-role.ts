"use client"

import { useState, useEffect } from "react"

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
        const backendUrl = "https://crmmibobackend-production.up.railway.app"
          const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null
        
        if (!token) {
          setError("No authentication token found")
          setLoading(false)
          return
        }

          const { data } = await api.get("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        
        // Mapear roles españoles a inglés
        const roleMap: Record<string, UserRole> = {
          "Administrador": "admin",
          "Supervisor": "supervisor",
          "Agente": "agent",
          "admin": "admin",
          "supervisor": "supervisor",
          "agent": "agent"
        }
        
        const mappedRole = roleMap[data.role] || "agent"
        
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
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
