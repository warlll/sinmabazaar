"use client"

import { useEffect, useState } from "react"
import type { Language } from "@/lib/i18n"
import { Header } from "@/components/customer/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image: string
}

export default function CartPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)

    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(savedCart)
  }, [])

  const updateQuantity = (productId: string, size: string | undefined, color: string | undefined, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) }
        }
        return item
      })
      .filter((item) => item.quantity > 0)

    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
  }

  const removeItem = (productId: string, size: string | undefined, color: string | undefined) => {
    const updated = cart.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isRTL = language === "ar"

  if (!mounted) return null

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{language === "ar" ? "سلة التسوق" : "Shopping Cart"}</h1>
          <p className="text-muted-foreground mt-2">
            {language === "ar"
              ? `${cart.length} عنصر في السلة`
              : `${cart.length} item${cart.length !== 1 ? "s" : ""} in cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          <Card className="border-border text-center py-12">
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-lg">
                {language === "ar" ? "السلة فارغة" : "Your cart is empty"}
              </p>
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {language === "ar" ? "تصفح المنتجات" : "Continue Shopping"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={`${item.productId}-${item.size}-${item.color}`} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg bg-secondary"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.size && (
                            <span>
                              {language === "ar" ? "المقاس" : "Size"}: {item.size}{" "}
                            </span>
                          )}
                          {item.color && (
                            <span>
                              {language === "ar" ? "اللون" : "Color"}: {item.color}
                            </span>
                          )}
                        </p>
                        <p className="text-primary font-semibold mt-2">{item.price.toFixed(2)} DA</p>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 border border-border rounded-lg bg-secondary/50">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, -1)}
                            className="px-2 py-1 hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, 1)}
                            className="px-2 py-1 hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)} DA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            <div>
              <Card className="border-border sticky top-24">
                <CardHeader>
                  <CardTitle>{language === "ar" ? "ملخص الطلب" : "Order Summary"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === "ar" ? "الإجمالي" : "Subtotal"}</span>
                      <span>{total.toFixed(2)} DA</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-semibold text-lg">
                    <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                    <span className="text-primary">{total.toFixed(2)} DA</span>
                  </div>

                  <Link href="/checkout" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      {language === "ar" ? "إتمام الشراء" : "Proceed to Checkout"}
                    </Button>
                  </Link>

                  <Link href="/products">
                    <Button variant="outline" className="w-full border-border bg-transparent">
                      {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
