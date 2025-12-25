"use client"

import { useEffect, useState } from "react"
import type { Language } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/customer/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Trash2, Heart } from "lucide-react"
import Link from "next/link"

interface WishlistProduct {
  id: string
  name: string
  price: number
  category: string
  stock_quantity: number
  description: string
}

export default function WishlistPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)

    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setWishlistIds(savedWishlist)

    if (savedWishlist.length > 0) {
      fetchWishlistProducts(savedWishlist)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchWishlistProducts = async (ids: string[]) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("products").select("*").in("id", ids)

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = (productId: string) => {
    const updated = wishlistIds.filter((id) => id !== productId)
    setWishlistIds(updated)
    setProducts(products.filter((p) => p.id !== productId))
    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  const addToCart = (product: WishlistProduct) => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: null,
      color: null,
      image: "/placeholder.svg",
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingIndex = cart.findIndex((item: typeof cartItem) => item.productId === cartItem.productId)

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
  }

  const isRTL = language === "ar"

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header language={language} onLanguageChange={setLanguage} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-current" />
            {language === "ar" ? "المفضلة" : "My Wishlist"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === "ar"
              ? `${products.length} منتج في المفضلة`
              : `${products.length} item${products.length !== 1 ? "s" : ""} in wishlist`}
          </p>
        </div>

        {products.length === 0 ? (
          <Card className="border-border text-center py-12">
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-lg">
                {language === "ar" ? "المفضلة فارغة" : "Your wishlist is empty"}
              </p>
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {language === "ar" ? "تصفح المنتجات" : "Browse Products"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-border hover:shadow-lg transition-all h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="w-full h-40 bg-secondary rounded-lg flex items-center justify-center mb-2">
                    <span className="text-4xl opacity-20">📦</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="text-lg font-bold text-primary mt-2">{product.price.toFixed(2)} DA</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        product.stock_quantity === 0
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }`}
                    >
                      {language === "ar" ? "إضافة للسلة" : "Add to Cart"}
                    </button>

                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="w-full px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      {language === "ar" ? "إزالة" : "Remove"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
