"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"

export interface Contact {
  id: number | string
  name: string
  phone_number: string
  avatar_url?: string | null
  channel?: string | null
  external_user_id?: string | null
  created_at?: string
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      const res = await api.get("/api/api/contacts", { params: {}, headers: {} })
      const data = res.data
      const list = Array.isArray(data) ? data : (data?.contacts || [])
      console.log('[useContacts] fetchContacts result:', list);
      setContacts(list)
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

  return { contacts, loading, error, refetch: fetchContacts }
}
