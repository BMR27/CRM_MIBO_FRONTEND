"use client"

import React from "react"
import { useLanguage } from "@/components/language-provider"

export default function PrivacyPolicyPage() {
  const { t } = useLanguage()
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">{t("privacy.title")}</h1>
      <p className="text-sm text-muted-foreground mb-2">{t("privacy.lastUpdated")}</p>
      <p className="mb-4">{t("privacy.intro")}</p>
      <ol className="list-decimal pl-6 mb-4">
        <li className="mb-2">
          <strong>{t("privacy.item1Title")}</strong> {t("privacy.item1Desc")}
        </li>
        <li className="mb-2">
          <strong>{t("privacy.item2Title")}</strong> {t("privacy.item2Desc")}
        </li>
        <li className="mb-2">
          <strong>{t("privacy.item3Title")}</strong> {t("privacy.item3Desc")}
        </li>
        <li className="mb-2">
          <strong>{t("privacy.item4Title")}</strong> {t("privacy.item4Desc")}
        </li>
        <li className="mb-2">
          <strong>{t("privacy.item5Title")}</strong> {t("privacy.item5Desc")}
        </li>
        <li className="mb-2">
          <strong>{t("privacy.item6Title")}</strong> {t("privacy.item6Desc")}
        </li>
      </ol>
      <p>{t("privacy.contact")} <a href="mailto:soporte@crm-mibo.com" className="text-primary underline">soporte@crm-mibo.com</a>.</p>
    </div>
  )
}
