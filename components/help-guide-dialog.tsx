"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"
import { guideContent, type GuideModule } from "@/lib/i18n/guide-content"
import {
  MessageSquare,
  User,
  Send,
  Calendar,
  Users,
  Inbox,
  BookOpen,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Sparkles,
} from "lucide-react"

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  conversaciones: MessageSquare,
  contactos: User,
  envios: Send,
  citas: Calendar,
  agentes: Users,
  leads: Inbox,
  "documentacion-api": BookOpen,
  configuracion: Settings,
  estadisticas: BarChart3,
}

interface HelpGuideDialogProps {
  collapsed?: boolean
  isAdmin?: boolean
  isAgent?: boolean
  modules?: { citas?: boolean; agentes?: boolean; leads?: boolean; docsApi?: boolean }
}

export function HelpGuideDialog({ collapsed, isAdmin, isAgent, modules }: HelpGuideDialogProps) {
  const { t, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  const allModules: GuideModule[] = guideContent[language] || guideContent.es

  const visibleModules = useMemo(() => {
    return allModules.filter((m) => {
      if (m.id === "citas") return Boolean(isAdmin) && Boolean(modules?.citas)
      if (m.id === "agentes") return !isAgent && Boolean(modules?.agentes)
      if (m.id === "leads") return !isAgent && Boolean(modules?.leads)
      if (m.id === "documentacion-api") return Boolean(modules?.docsApi)
      if (m.id === "configuracion") return Boolean(isAdmin)
      if (m.id === "estadisticas") return !isAgent
      return true
    })
  }, [allModules, isAdmin, isAgent, modules])

  const activeModule = visibleModules.find((m) => m.id === activeModuleId) || visibleModules[0]
  const step = activeModule?.steps[stepIndex]
  const totalSteps = activeModule?.steps.length || 0

  const handleOpen = () => {
    setActiveModuleId(visibleModules[0]?.id || null)
    setStepIndex(0)
    setOpen(true)
  }

  // Abre la guía automáticamente la primera vez que el usuario entra al CRM en este
  // navegador (se recuerda con localStorage para no volver a interrumpir después).
  useEffect(() => {
    if (visibleModules.length === 0) return
    try {
      const seen = localStorage.getItem("help_guide_seen")
      if (!seen) {
        handleOpen()
        localStorage.setItem("help_guide_seen", "1")
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleModules.length > 0])

  const selectModule = (id: string) => {
    setActiveModuleId(id)
    setStepIndex(0)
  }

  const goNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1)
      return
    }
    const currentIdx = visibleModules.findIndex((m) => m.id === activeModule?.id)
    if (currentIdx >= 0 && currentIdx < visibleModules.length - 1) {
      setActiveModuleId(visibleModules[currentIdx + 1].id)
      setStepIndex(0)
    }
  }

  const goPrev = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1)
      return
    }
    const currentIdx = visibleModules.findIndex((m) => m.id === activeModule?.id)
    if (currentIdx > 0) {
      const prevModule = visibleModules[currentIdx - 1]
      setActiveModuleId(prevModule.id)
      setStepIndex(prevModule.steps.length - 1)
    }
  }

  const isVeryFirst = visibleModules[0]?.id === activeModule?.id && stepIndex === 0
  const isVeryLast =
    visibleModules[visibleModules.length - 1]?.id === activeModule?.id && stepIndex === totalSteps - 1

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleOpen}
        className={cn(
          "w-full justify-start transition-colors text-foreground hover:bg-sidebar-accent hover:text-foreground",
          collapsed && "justify-center px-2",
        )}
      >
        <CircleHelp className="h-5 w-5" />
        {!collapsed && <span className="ml-3">{t("help.openGuide")}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[92vw] sm:w-full sm:max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("help.title")}
            </DialogTitle>
            <DialogDescription>{t("help.subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="flex h-[70vh] max-h-[520px] min-h-[380px]">
            {/* Module list */}
            <div className="w-40 sm:w-56 shrink-0 border-r border-border overflow-y-auto py-2 bg-muted/20">
              {visibleModules.map((m) => {
                const Icon = MODULE_ICONS[m.id] || MessageSquare
                const isActive = m.id === activeModule?.id
                return (
                  <button
                    key={m.id}
                    onClick={() => selectModule(m.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                        : "text-foreground hover:bg-muted/60",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{m.title}</span>
                  </button>
                )
              })}
            </div>

            {/* Step content */}
            <div className="flex flex-1 flex-col min-w-0">
              {activeModule && step && (
                <>
                  <div className="px-6 pt-5 pb-3 border-b border-border">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {activeModule.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{activeModule.tagline}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {stepIndex + 1}
                      </div>
                      <div className="space-y-2 pt-0.5">
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {activeModule.steps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setStepIndex(i)}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            i === stepIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                          )}
                          aria-label={`${t("help.stepLabel")} ${i + 1}`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t("help.stepLabel")} {stepIndex + 1} {t("help.of")} {totalSteps}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goPrev} disabled={isVeryFirst} className="gap-1">
                        <ChevronLeft className="h-3.5 w-3.5" />
                        {t("help.prev")}
                      </Button>
                      {isVeryLast ? (
                        <Button size="sm" onClick={() => setOpen(false)}>
                          {t("help.finish")}
                        </Button>
                      ) : (
                        <Button size="sm" onClick={goNext} className="gap-1">
                          {t("help.next")}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
