"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Language } from "@/lib/i18n"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)
  }, [])

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  if (!mounted) return null

  const isRTL = language === "ar"
  const dir = isRTL ? "rtl" : "ltr"

  return (
    <div dir={dir} className={isRTL ? "text-right" : "text-left"}>
      {/* Navigation Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">{t("app.title", language)}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {isRTL ? "بازار محلي متخصص" : "Local Bazaar Store"}
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className={`flex items-center gap-1 sm:gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link href="/products">
                <Button variant="ghost" className="text-foreground hover:bg-secondary">
                  {t("nav.products", language)}
                </Button>
              </Link>

              <div className="w-px h-6 bg-border hidden sm:block"></div>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm transition-colors"
              >
                {language === "en" ? "العربية" : "English"}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              {isRTL ? "مرحبا بك في سينما بازار" : "Welcome to SINMA BAZAAR"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isRTL
                ? "متجر بازار متخصص في الملابس النسائية والأدوات المطبخية والإكسسوارات الفريدة"
                : "A local bazaar store specialized in women's clothing, kitchenware, and unique accessories"}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8">
                  {t("nav.products", language)}
                </Button>
              </Link>
              <Button variant="outline" className="border-border bg-transparent text-foreground text-base px-8">
                {isRTL ? "تعرف علينا أكثر" : "Learn More"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">
            {isRTL ? "الفئات الرئيسية" : "Our Categories"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Women's Clothing */}
            <Link href="/products?category=womens-clothing">
              <Card className="border-border hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">{isRTL ? "👗" : "👗"}</span>
                  </div>
                  <CardTitle>{t("category.womens-clothing", language)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {isRTL
                      ? "تشكيلة واسعة من الملابس النسائية الأنيقة والعملية"
                      : "Wide selection of elegant and practical women's clothing"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Kitchenware */}
            <Link href="/products?category=kitchenware">
              <Card className="border-border hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">{isRTL ? "🍳" : "🍳"}</span>
                  </div>
                  <CardTitle>{t("category.kitchenware", language)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {isRTL
                      ? "أدوات مطبخية عملية وذات جودة عالية للطبخ اليومي"
                      : "Practical and high-quality kitchenware for daily cooking"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Accessories */}
            <Link href="/products?category=accessories">
              <Card className="border-border hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">{isRTL ? "✨" : "✨"}</span>
                  </div>
                  <CardTitle>{t("category.accessories", language)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {isRTL
                      ? "إكسسوارات فريدة وأنيقة لإكمال إطلالتك"
                      : "Unique and elegant accessories to complete your look"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-12 sm:py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h3 className="text-3xl font-bold text-foreground">{isRTL ? "المنتجات المميزة" : "Featured Products"}</h3>
            <p className="text-muted-foreground">
              {isRTL ? "اكتشف مجموعة منتقاة من أفضل منتجاتنا" : "Explore a curated selection of our best products"}
            </p>
          </div>

          <div className="flex justify-center">
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8">
                {isRTL ? "عرض جميع المنتجات" : "View All Products"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">{isRTL ? "عن المتجر" : "About Store"}</h4>
              <p className="text-background/80 text-sm">
                {isRTL
                  ? "متجر بازار محلي متخصص في الملابس النسائية والأدوات المطبخية والإكسسوارات الفريدة"
                  : "A local bazaar store offering quality women's clothing, kitchenware, and accessories"}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{isRTL ? "التنقل" : "Navigation"}</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>
                  <Link href="/products" className="hover:text-background">
                    {t("nav.products", language)}
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-background">
                    {isRTL ? "اتصل بنا" : "Contact Us"}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{isRTL ? "المزيد" : "More"}</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>
                  <a href="#" className="hover:text-background">
                    {isRTL ? "الشروط والأحكام" : "Terms & Conditions"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background">
                    {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 pt-8 text-center text-sm text-background/80">
            <p>{isRTL ? "جميع الحقوق محفوظة" : "All rights reserved"} © 2025 SINMA BAZAAR</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
