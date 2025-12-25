"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Language } from "@/lib/i18n"
import { Header } from "@/components/customer/header"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  if (!mounted) return null

  const isRTL = language === "ar"

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      <Header language={language} onLanguageChange={handleLanguageChange} />
      {children}
    </div>
  )
}
