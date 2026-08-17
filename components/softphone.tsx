"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, PhoneOff, PhoneIncoming, Mic, MicOff, X } from "lucide-react"
import { api } from "@/lib/api"

type CallStatus = "idle" | "connecting" | "in-call" | "incoming"

export function Softphone() {
  const [available, setAvailable] = useState(false)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<CallStatus>("idle")
  const [number, setNumber] = useState("")
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState("")
  const [seconds, setSeconds] = useState(0)

  const deviceRef = useRef<any>(null)
  const activeCallRef = useRef<any>(null)
  const tenantIdRef = useRef<string>("")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const { data } = await api.post("/api/voice/token")
        if (cancelled || !data?.token) return

        tenantIdRef.current = String(data.identity || "").replace(/^tenant-/, "")

        const { Device } = await import("@twilio/voice-sdk")
        const device = new Device(data.token, { logLevel: "error" })

        device.on("incoming", (call: any) => {
          activeCallRef.current = call
          setStatus("incoming")
          call.on("accept", () => {
            setStatus("in-call")
            startTimer()
          })
          call.on("disconnect", () => resetCall())
          call.on("cancel", () => resetCall())
        })

        device.on("error", (err: any) => {
          console.error("[Softphone] device error", err)
        })

        await device.register()
        deviceRef.current = device
        if (!cancelled) setAvailable(true)
      } catch (err) {
        // Voice no configurado para este tenant, o error de red — no mostrar el softphone.
        setAvailable(false)
      }
    }

    init()

    return () => {
      cancelled = true
      deviceRef.current?.destroy?.()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startTimer = () => {
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const resetCall = () => {
    activeCallRef.current = null
    setStatus("idle")
    setMuted(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleCall = async () => {
    if (!number.trim() || !deviceRef.current) return
    setError("")
    setStatus("connecting")
    try {
      const call = await deviceRef.current.connect({
        params: { To: number.trim(), tenantId: tenantIdRef.current },
      })
      activeCallRef.current = call
      call.on("accept", () => {
        setStatus("in-call")
        startTimer()
      })
      call.on("disconnect", () => resetCall())
      call.on("cancel", () => resetCall())
      call.on("reject", () => resetCall())
    } catch (err) {
      setError("No se pudo iniciar la llamada")
      setStatus("idle")
    }
  }

  const handleAccept = () => {
    activeCallRef.current?.accept()
  }

  const handleHangup = () => {
    activeCallRef.current?.disconnect()
    resetCall()
  }

  const handleReject = () => {
    activeCallRef.current?.reject()
    resetCall()
  }

  const toggleMute = () => {
    const next = !muted
    activeCallRef.current?.mute(next)
    setMuted(next)
  }

  const formatSeconds = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  if (!available) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {status === "incoming" && (
        <div className="mb-2 w-72 rounded-lg border border-border bg-card p-4 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <PhoneIncoming className="h-4 w-4 animate-pulse" />
            Llamada entrante
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="flex-1 gap-2" onClick={handleAccept}>
              <Phone className="h-4 w-4" />
              Contestar
            </Button>
            <Button size="sm" variant="destructive" className="flex-1 gap-2" onClick={handleReject}>
              <PhoneOff className="h-4 w-4" />
              Rechazar
            </Button>
          </div>
        </div>
      )}

      {open && status !== "incoming" && (
        <div className="mb-2 w-72 rounded-lg border border-border bg-card p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Llamadas</p>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {status === "idle" && (
            <>
              <Input
                placeholder="+525512345678"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
              <Button className="w-full gap-2" onClick={handleCall} disabled={!number.trim()}>
                <Phone className="h-4 w-4" />
                Llamar
              </Button>
            </>
          )}

          {status === "connecting" && <p className="text-sm text-muted-foreground">Conectando...</p>}

          {status === "in-call" && (
            <>
              <p className="text-center text-sm text-muted-foreground">{formatSeconds(seconds)}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={toggleMute}>
                  {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {muted ? "Activar mic" : "Silenciar"}
                </Button>
                <Button variant="destructive" className="flex-1 gap-2" onClick={handleHangup}>
                  <PhoneOff className="h-4 w-4" />
                  Colgar
                </Button>
              </div>
            </>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}

      {status !== "incoming" && (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          variant={status === "in-call" ? "destructive" : "default"}
          onClick={() => setOpen((o) => !o)}
        >
          <Phone className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
