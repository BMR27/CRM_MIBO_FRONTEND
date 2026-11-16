"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Phone } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

interface ScheduleCallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactName?: string
  phoneNumber?: string
  conversationId?: string | number
}

export function ScheduleCallDialog({
  open,
  onOpenChange,
  contactName,
  phoneNumber,
  conversationId,
}: ScheduleCallDialogProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [callDate, setCallDate] = useState("")
  const [callTime, setCallTime] = useState("")
  const [callType, setCallType] = useState("phone")
  const [notes, setNotes] = useState("")

  const handleScheduleCall = async () => {
    if (!callDate || !callTime) {
      alert(t("schedCall.fillDateTime"))
      return
    }

    setLoading(true)
    try {
      const payload = {
        contact_name: contactName,
        phone_number: phoneNumber,
        conversation_id: conversationId,
        scheduled_at: `${callDate}T${callTime}`,
        call_type: callType,
        notes: notes.trim(),
      }

      console.log("[ScheduleCallDialog] Sending payload:", payload)

      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("[ScheduleCallDialog] Response:", data)

      if (response.ok) {
        alert(t("schedCall.scheduledOk"))
        window.dispatchEvent(new Event("calls-updated"))
        onOpenChange(false)
        setCallDate("")
        setCallTime("")
        setCallType("phone")
        setNotes("")
      } else {
        alert(`❌ Error: ${data.error || t("schedCall.couldNotSchedule")}`)
        console.error("[ScheduleCallDialog] Error details:", data)
      }
    } catch (error) {
      console.error("[ScheduleCallDialog] Error scheduling call:", error)
      alert(t("schedCall.connectionError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {t("schedCall.title")}
          </DialogTitle>
          <DialogDescription>
            {t("schedCall.descPrefix")} {contactName || t("schedCall.theContact")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Info */}
          {phoneNumber && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">{t("schedCall.phone")}</p>
              <p className="font-semibold text-foreground">{phoneNumber}</p>
            </div>
          )}

          {/* Call Type */}
          <div className="space-y-2">
            <Label htmlFor="call-type">{t("schedCall.callType")}</Label>
            <Select value={callType} onValueChange={setCallType}>
              <SelectTrigger id="call-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">
                  <span className="flex items-center gap-2">📞 {t("schedCall.phoneType")}</span>
                </SelectItem>
                <SelectItem value="video">
                  <span className="flex items-center gap-2">📹 {t("schedCall.videoType")}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="call-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("schedCall.date")}
            </Label>
            <Input
              id="call-date"
              type="date"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="call-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("schedCall.time")}
            </Label>
            <Input
              id="call-time"
              type="time"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("schedCall.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("schedCall.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              className="h-20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              {t("schedCall.cancel")}
            </Button>
            <Button onClick={handleScheduleCall} disabled={loading} className="flex-1">
              {loading ? t("schedCall.scheduling") : t("schedCall.schedule")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
