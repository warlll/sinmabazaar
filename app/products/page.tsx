"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { Language } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock_quantity: number
  description: string
}

interface ProductImage {
  image_url: string
}

function ProductsContent({ language }: { language: Language }) {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get("category") || "all"

  const [products, setProducts] = useState<Product[]>([])
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Starting fetchProducts for category:", categoryFilter)

        const supabase = createClient()
        let query = supabase.from("products").select("*")

        if (categoryFilter !== "all") {
          const categoryMap: Record<string, string> = {
            "womens-clothing": "Women's Clothing",
            kitchenware: "Kitchenware",
            accessories: "Accessories",
          }
          const categoryName = categoryMap[categoryFilter]
          if (categoryName) {
            query = query.eq("category", categoryName)
          }
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          console.log("Supabase error:", fetchError.message || JSON.stringify(fetchError))
          throw new Error(fetchError.message || "Failed to fetch products")
        }

        console.log("Successfully fetched products:", data?.length)
        setProducts(data || [])

        if (data && data.length > 0) {
          const productIds = data.map((p) => p.id)
          const { data: imagesData, error: imagesError } = await supabase
            .from("product_images")
            .select("product_id, image_url")
            .in("product_id", productIds)
            .order("display_order")

          if (!imagesError && imagesData) {
            const imageMap: Record<string, string> = {}
            imagesData.forEach((img: any) => {
              if (!imageMap[img.product_id]) {
                imageMap[img.product_id] = img.image_url
              }
            })
            setProductImages(imageMap)
          }
        }

        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load products"
        console.log("Catch block error:", errorMessage)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [categoryFilter])

  const isRTL = language === "ar"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{isRTL ? "جاري التحميل..." : "Loading products..."}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">{error}</div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">{isRTL ? "جميع المنتجات" : "All Products"}</h2>
        <p className="text-muted-foreground">
          {isRTL ? `عرض ${products.length} منتج` : `Showing ${products.length} products`}
        </p>
      </div>

      {products.length === 0 ? (
        <Card className="border-border text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {isRTL ? "لا توجد منتجات في هذه الفئة" : "No products found in this category"}
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isRTL ? "عودة للمنتجات" : "View All Products"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="border-border hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="w-full h-40 bg-secondary rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    {productImages[product.id] ? (
                      <img
                        src={productImages[product.id] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <span className="text-4xl opacity-20">📦</span>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="text-2xl font-bold text-primary">{product.price.toFixed(2)} DA</p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{isRTL ? `المخزون: ${product.stock_quantity}` : `Stock: ${product.stock_quantity}`}</span>
                    <span className={product.stock_quantity > 0 ? "text-green-600" : "text-destructive"}>
                      {product.stock_quantity > 0
                        ? isRTL
                          ? "متاح"
                          : "Available"
                        : isRTL
                          ? "غير متاح"
                          : "Out of Stock"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

function ProductsPageContent({ language }: { language: Language }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ProductsContent language={language} />
    </Suspense>
  )
}

export default function ProductsPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)
  }, [])

  if (!mounted) return null

  return <ProductsPageContent language={language} />
}
