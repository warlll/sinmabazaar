"use client"

import { useState } from "react"
import Link from "next/link"
import type { Language } from "@/lib/i18n"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Menu, X, Package } from "lucide-react"

interface HeaderProps {
  language: Language
  onLanguageChange: (lang: Language) => void
}

export function Header({ language, onLanguageChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isRTL = language === "ar"

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en"
    onLanguageChange(newLang)
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div dir={isRTL ? "rtl" : "ltr"} className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">{t("app.title", language)}</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link href="/products">
              <Button variant="ghost" className="text-foreground hover:bg-secondary">
                {t("nav.products", language)}
              </Button>
            </Link>
          </div>

          {/* Right Section */}
          <div className={`flex items-center gap-2 sm:gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            {/* Cart, Wishlist, and Track Order */}
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link href="/track-order" title={t("nav.track-order", language)}>
                <Button size="icon" variant="ghost" className="text-foreground hover:bg-secondary relative">
                  <Package className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/wishlist" title={t("nav.wishlist", language)}>
                <Button size="icon" variant="ghost" className="text-foreground hover:bg-secondary relative">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/cart" title={t("nav.cart", language)}>
                <Button size="icon" variant="ghost" className="text-foreground hover:bg-secondary relative">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2 sm:px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs sm:text-sm transition-colors"
            >
              {language === "en" ? "ع" : "EN"}
            </button>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-secondary rounded-lg">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden mt-4 space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
            <Link href="/products" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary">
                {t("nav.products", language)}
              </Button>
            </Link>
            <Link href="/track-order" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary">
                {t("nav.track-order", language)}
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
