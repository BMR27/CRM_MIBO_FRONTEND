"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

interface ThemeSelectorProps {
  compact?: boolean
}

export function ThemeSelector({ compact }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Evita mismatch de hidratación: el tema real solo se conoce en el cliente.
  useEffect(() => setMounted(true), [])

  return (
    <Select value={mounted ? theme || "system" : "system"} onValueChange={setTheme} disabled={!mounted}>
      <SelectTrigger className={compact ? "h-8 w-full text-xs" : undefined}>
        {compact ? (
          theme === "dark" ? (
            <Moon className="h-3.5 w-3.5" />
          ) : theme === "light" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Monitor className="h-3.5 w-3.5" />
          )
        ) : null}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5" /> {t("theme.light")}
          </span>
        </SelectItem>
        <SelectItem value="dark">
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5" /> {t("theme.dark")}
          </span>
        </SelectItem>
        <SelectItem value="system">
          <span className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" /> {t("theme.system")}
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
