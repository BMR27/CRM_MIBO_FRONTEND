"use client"

import { useCallback, useEffect, useState } from "react"
import { frontendApi } from "@/lib/api"

export interface Contact {
  id: number | string
  name: string
  phone_number: string
  avatar_url?: string | null
  channel?: string | null
  external_user_id?: string | null
  created_at?: string
}

export interface ContactStats {
  total: number
  whatsapp: number
  facebook: number
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({ total: 0, whatsapp: 0, facebook: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      const res = await frontendApi.get("/api/contacts", { params: {}, headers: {} })
      const data = res.data
      const list = Array.isArray(data) ? data : (data?.contacts || [])
      setContacts(list)
      setStats({
        total: Number(data?.stats?.total ?? list.length),
        whatsapp: Number(data?.stats?.whatsapp ?? list.filter((c: Contact) => String(c.channel || "whatsapp") !== "facebook").length),
        facebook: Number(data?.stats?.facebook ?? list.filter((c: Contact) => String(c.channel || "").toLowerCase() === "facebook").length),
      })
      setError(null)
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Error fetching contacts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchContacts()
  }, [fetchContacts])

  return { contacts, stats, loading, error, refetch: fetchContacts }
}
