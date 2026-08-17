"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Mail } from "lucide-react"

function LeadForm() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get("key") || ""

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!apiKey) {
      setError("Formulario mal configurado: falta la API key.")
      return
    }
    if (!email && !phone) {
      setError("Ingresa al menos un correo o un teléfono.")
      return
    }

    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
      const response = await fetch(`${backendUrl}/api/public/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone_number: phone || undefined,
          company: company || undefined,
          source: "web",
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.message || "No se pudo enviar el formulario.")
        setLoading(false)
        return
      }

      setSent(true)
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-semibold">¡Gracias!</h2>
        <p className="text-sm text-muted-foreground">Hemos recibido tu información, te contactaremos pronto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            className="pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} placeholder="+525512345678" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} disabled={loading} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  )
}

export default function LeadFormPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Cargando...</div>}>
          <LeadForm />
        </Suspense>
      </div>
    </div>
  )
}
