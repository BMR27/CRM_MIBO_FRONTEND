"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Plus, Trash2, Edit2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es, enUS, pl, ru } from "date-fns/locale"
import { useLanguage } from "@/components/language-provider"

const dateFnsLocales = { es, en: enUS, pl, ru }

interface UserSession {
  id: string
  user_name: string
  user_email: string
  session_date: string
  session_type: "consultation" | "follow-up" | "training" | "other"
  duration_minutes: number
  notes: string
  outcomes: string
  created_at: string
}

export default function SessionsPage() {
  const { t, language } = useLanguage()
  const dateLocale = dateFnsLocales[language] || es
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingSession, setEditingSession] = useState<UserSession | null>(null)
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    session_type: "consultation",
    duration_minutes: 30,
    notes: "",
    outcomes: "",
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (session?: UserSession) => {
    if (session) {
      setEditingSession(session)
      setFormData({
        user_name: session.user_name,
        user_email: session.user_email,
        session_type: session.session_type,
        duration_minutes: session.duration_minutes,
        notes: session.notes,
        outcomes: session.outcomes,
      })
    } else {
      setEditingSession(null)
      setFormData({
        user_name: "",
        user_email: "",
        session_type: "consultation",
        duration_minutes: 30,
        notes: "",
        outcomes: "",
      })
    }
    setOpenDialog(true)
  }

  const handleSaveSession = async () => {
    if (!formData.user_name || !formData.user_email) {
      alert(t("sess.fillNameEmail"))
      return
    }

    try {
      const url = editingSession ? `/api/sessions/${editingSession.id}` : "/api/sessions"
      const method = editingSession ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          session_date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        fetchSessions()
        setOpenDialog(false)
        alert(t("sess.saved"))
      }
    } catch (error) {
      console.error("Error saving session:", error)
      alert(t("sess.saveFail"))
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (!confirm(t("sess.confirmDelete"))) return

    try {
      await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      })
      fetchSessions()
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      consultation: t("sess.type.consultation"),
      "follow-up": t("sess.type.followUp"),
      training: t("sess.type.training"),
      other: t("sess.type.other"),
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">{t("sess.loading")}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6" />
              {t("sess.title")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("sess.subtitle")}
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("sess.new")}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center">
                {t("sess.empty")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {session.user_name}
                          <Badge variant="outline" className="text-xs">
                            {getSessionTypeLabel(session.session_type)}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs mt-2 space-y-1">
                          <div>📧 {session.user_email}</div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(session.session_date), t("sess.dateFormat"), {
                                locale: dateLocale,
                              })}
                            </span>
                          </div>
                          <div>⏱️ {t("sess.duration")}: {session.duration_minutes} {t("sess.minutes")}</div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  {(session.notes || session.outcomes) && (
                    <CardContent className="pb-3 pt-0 space-y-2">
                      {session.notes && (
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <p className="font-semibold text-muted-foreground mb-1">{t("sess.notes")}</p>
                          <p className="text-foreground">{session.notes}</p>
                        </div>
                      )}
                      {session.outcomes && (
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <p className="font-semibold text-muted-foreground mb-1">{t("sess.outcomes")}</p>
                          <p className="text-foreground">{session.outcomes}</p>
                        </div>
                      )}
                    </CardContent>
                  )}

                  <CardContent className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(session)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      {t("sess.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSession(session.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? t("sess.editTitle") : t("sess.new")}
            </DialogTitle>
            <DialogDescription>
              {editingSession
                ? t("sess.editDesc")
                : t("sess.newDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("sess.userName")}</label>
                <Input
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({ ...formData, user_name: e.target.value })
                  }
                  placeholder={t("sess.userNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("sess.email")}</label>
                <Input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) =>
                    setFormData({ ...formData, user_email: e.target.value })
                  }
                  placeholder="usuario@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("sess.sessionType")}</label>
                <select
                  value={formData.session_type}
                  onChange={(e) =>
                    setFormData({ ...formData, session_type: e.target.value as any })
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="consultation">{t("sess.type.consultation")}</option>
                  <option value="follow-up">{t("sess.type.followUp")}</option>
                  <option value="training">{t("sess.type.training")}</option>
                  <option value="other">{t("sess.type.other")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("sess.durationMinutes")}</label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: parseInt(e.target.value) || 30,
                    })
                  }
                  min="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("sess.sessionNotes")}</label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={t("sess.sessionNotesPlaceholder")}
                className="h-20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("sess.outcomesConclusions")}</label>
              <Textarea
                value={formData.outcomes}
                onChange={(e) =>
                  setFormData({ ...formData, outcomes: e.target.value })
                }
                placeholder={t("sess.outcomesPlaceholder")}
                className="h-20 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="flex-1"
              >
                {t("chat.cancel")}
              </Button>
              <Button onClick={handleSaveSession} className="flex-1">
                {editingSession ? t("sess.update") : t("chat.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
