"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Language } from "@/lib/i18n"
import { Header } from "@/components/customer/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)
  }, [])

  if (!mounted) return null

  const isRTL = language === "ar"

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-foreground text-center mb-8">
            {language === "ar" ? "حسابي" : "My Account"}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/checkout">
              <Card className="border-border hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <CardTitle>{language === "ar" ? "عميل جديد" : "New Customer"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {language === "ar" ? "أنشئ حسابك الجديد وابدأ التسوق" : "Create your account and start shopping"}
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/checkout">
              <Card className="border-border hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <CardTitle>{language === "ar" ? "عميل حالي" : "Existing Customer"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {language === "ar" ? "سجل دخولك إلى حسابك الحالي" : "Sign in to your existing account"}
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
