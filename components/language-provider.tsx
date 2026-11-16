"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { DEFAULT_LANGUAGE, translations, type Language } from "@/lib/i18n/translations"

const STORAGE_KEY = "mibo_language"

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored && translations[stored]) setLanguageState(stored)
    } catch {}
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {}
  }

  const t = useMemo(() => {
    const dict = translations[language] || translations[DEFAULT_LANGUAGE]
    return (key: string) => dict[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
