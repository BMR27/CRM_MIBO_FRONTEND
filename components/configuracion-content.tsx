"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Lock, Save, Settings, Zap } from "lucide-react"
import { ApiKeysSection } from "@/components/api-keys-section"
import { WorkspaceNameSection } from "@/components/workspace-name-section"
import { BrandingSection } from "@/components/branding-section"
import { TenantModulesSection } from "@/components/tenant-modules-section"
import { ThemeSelector } from "@/components/theme-selector"
import { LanguageSelector } from "@/components/language-selector"
import { WhatsappIntegrationSection } from "@/components/whatsapp-integration-section"
import { FacebookIntegrationSection } from "@/components/facebook-integration-section"
import { VoiceIntegrationSection } from "@/components/voice-integration-section"
import { useLanguage } from "@/components/language-provider"

export function ConfiguracionContent({ isPlatformAdmin }: { isPlatformAdmin: boolean }) {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("cfg.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("cfg.subtitle")}</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className={`grid w-full ${isPlatformAdmin ? "grid-cols-4" : "grid-cols-2"}`}>
          <TabsTrigger value="general">{t("cfg.general")}</TabsTrigger>
          <TabsTrigger value="notificaciones">{t("cfg.notifications")}</TabsTrigger>
          {isPlatformAdmin && <TabsTrigger value="integraciones">{t("cfg.integrations")}</TabsTrigger>}
          {isPlatformAdmin && <TabsTrigger value="seguridad">{t("cfg.security")}</TabsTrigger>}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>{t("cfg.generalTitle")}</CardTitle>
              </div>
              <CardDescription>{t("cfg.generalDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <WorkspaceNameSection />

              <Separator />

              <BrandingSection />

              {isPlatformAdmin && (
                <>
                  <Separator />
                  <TenantModulesSection />
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label>{t("cfg.appearance")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.appearanceDesc")}</p>
                </div>
                <div className="w-40">
                  <ThemeSelector />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label>{t("language.label")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.languageDesc")}</p>
                </div>
                <div className="w-40">
                  <LanguageSelector />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.notifSounds")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.notifSoundsDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.quickReplies")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.quickRepliesDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                {t("cfg.saveChanges")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>{t("cfg.notifications")}</CardTitle>
              </div>
              <CardDescription>{t("cfg.notificationsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.emailNotif")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.emailNotifDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.pushNotif")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.pushNotifDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.newMessages")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.newMessagesDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.convAssignment")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.convAssignmentDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.mentions")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.mentionsDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                {t("cfg.savePreferences")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isPlatformAdmin && (
        <TabsContent value="integraciones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <CardTitle>{t("cfg.integrations")}</CardTitle>
              </div>
              <CardDescription>{t("cfg.integrationsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ApiKeysSection />

              <Separator />

              <WhatsappIntegrationSection />

              <Separator />

              <FacebookIntegrationSection />

              <Separator />

              <VoiceIntegrationSection />
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {isPlatformAdmin && (
        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>{t("cfg.security")}</CardTitle>
              </div>
              <CardDescription>{t("cfg.securityDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t("cfg.currentPassword")}</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">{t("profile.newPassword")}</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("profile.confirmNewPassword")}</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                {t("cfg.changePassword")}
              </Button>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("cfg.twoFactor")}</Label>
                  <p className="text-sm text-muted-foreground">{t("cfg.twoFactorDesc")}</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium text-foreground">{t("cfg.activeSessions")}</h3>
                <div className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t("cfg.currentBrowser")}</p>
                      <p className="text-sm text-muted-foreground">{t("cfg.currentBrowserDesc")}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      {t("cfg.currentSession")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
