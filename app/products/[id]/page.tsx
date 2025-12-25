"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Language } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/customer/header"
import { Heart, ChevronLeft, ChevronRight, Check, Share2 } from "lucide-react"
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
  id: string
  image_url: string
}

interface ProductSize {
  size: string
}

interface ProductColor {
  color: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [sizes, setSizes] = useState<ProductSize[]>([])
  const [colors, setColors] = useState<ProductColor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [shareMessage, setShareMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchProductDetails()
    }
  }, [mounted, productId])

  const fetchProductDetails = async () => {
    try {
      const supabase = createClient()

      const [productRes, imagesRes, sizesRes, colorsRes] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase.from("product_images").select("*").eq("product_id", productId).order("display_order"),
        supabase.from("product_sizes").select("size").eq("product_id", productId),
        supabase.from("product_colors").select("color").eq("product_id", productId),
      ])

      if (productRes.data) setProduct(productRes.data)
      if (imagesRes.data) setImages(imagesRes.data)
      if (sizesRes.data) setSizes(sizesRes.data)
      if (colorsRes.data) setColors(colorsRes.data)
    } catch (err) {
      setError("Failed to load product details")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product?.category === "Women's Clothing" && !selectedSize) {
      setError(language === "ar" ? "يرجى اختيار المقاس" : "Please select a size")
      return
    }

    const cartItem = {
      productId: product?.id,
      name: product?.name,
      price: product?.price,
      quantity,
      size: selectedSize || null,
      color: selectedColor || null,
      image: images[0]?.image_url || "/placeholder.svg",
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingIndex = cart.findIndex(
      (item: typeof cartItem) =>
        item.productId === cartItem.productId && item.size === cartItem.size && item.color === cartItem.color,
    )

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleToggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    if (isWishlisted) {
      const index = wishlist.findIndex((id: string) => id === productId)
      if (index > -1) wishlist.splice(index, 1)
    } else {
      wishlist.push(productId)
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
    setIsWishlisted(!isWishlisted)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/products/${productId}`
    const shareText = `${language === "ar" ? "تحقق من هذا المنتج" : "Check out this product"}: ${product?.name}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: shareText,
          url: shareUrl,
        })
        console.log("Share successful")
      } catch (err) {
        // User cancelled or share failed - only show error if it's not abort/cancel
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share error:", err.message)
          // Fallback to copy link
          navigator.clipboard.writeText(shareUrl).then(() => {
            setShareMessage(language === "ar" ? "تم نسخ الرابط" : "Link copied!")
            setTimeout(() => setShareMessage(null), 2000)
          })
        }
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          setShareMessage(language === "ar" ? "تم نسخ الرابط" : "Link copied!")
          setTimeout(() => setShareMessage(null), 2000)
        })
        .catch((err) => {
          console.error("Clipboard copy error:", err)
          setShareMessage(language === "ar" ? "خطأ في النسخ" : "Failed to copy")
          setTimeout(() => setShareMessage(null), 2000)
        })
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header language={language} onLanguageChange={setLanguage} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header language={language} onLanguageChange={setLanguage} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/products">
            <Button variant="outline" className="border-border bg-transparent mb-8">
              {language === "ar" ? "العودة للمنتجات" : "Back to Products"}
            </Button>
          </Link>
          <Card className="border-border text-center py-12">
            <CardContent>
              <p className="text-destructive">{language === "ar" ? "المنتج غير موجود" : "Product not found"}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isRTL = language === "ar"
  const displayImage = images[selectedImageIndex]?.image_url || "/placeholder.svg"

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/products">
          <Button variant="outline" className="border-border bg-transparent mb-8 gap-2">
            <ChevronLeft className="w-4 h-4" />
            {language === "ar" ? "العودة للمنتجات" : "Back to Products"}
          </Button>
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg overflow-hidden flex items-center justify-center h-96 w-full">
              {displayImage && displayImage !== "/placeholder.svg" ? (
                <img
                  src={displayImage || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              ) : (
                <span className="text-6xl opacity-30">📦</span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2 flex-1 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === selectedImageIndex ? "border-primary" : "border-border"
                      }`}
                    >
                      <img
                        src={img.image_url || "/placeholder.svg"}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-primary">{product.price.toFixed(2)} DA</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? "bg-green-500" : "bg-destructive"}`}
              ></div>
              <span className={product.stock_quantity > 0 ? "text-green-600" : "text-destructive"}>
                {product.stock_quantity > 0
                  ? language === "ar"
                    ? `${product.stock_quantity} متوفر`
                    : `${product.stock_quantity} in stock`
                  : language === "ar"
                    ? "غير متوفر"
                    : "Out of stock"}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">{language === "ar" ? "الوصف" : "Description"}</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Size Selection (for clothing) */}
            {product.category === "Women's Clothing" && sizes.length > 0 && (
              <div>
                <label className="font-semibold text-foreground block mb-3">
                  {language === "ar" ? "اختر المقاس" : "Select Size"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        selectedSize === size.size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary"
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <label className="font-semibold text-foreground block mb-3">
                  {language === "ar" ? "اختر اللون" : "Select Color"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.color}
                      onClick={() => setSelectedColor(color.color)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        selectedColor === color.color
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary"
                      }`}
                    >
                      {color.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <label className="font-semibold text-foreground block mb-3">
                {language === "ar" ? "الكمية" : "Quantity"}
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : product.stock_quantity === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {addedToCart && <Check className="w-5 h-5" />}
                {addedToCart
                  ? language === "ar"
                    ? "تمت الإضافة"
                    : "Added to Cart"
                  : language === "ar"
                    ? "إضافة إلى السلة"
                    : "Add to Cart"}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  isWishlisted
                    ? "bg-primary/10 text-primary border border-primary"
                    : "bg-secondary text-foreground border border-border hover:border-primary"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center bg-secondary text-foreground border border-border hover:border-primary"
                title={language === "ar" ? "مشاركة المنتج" : "Share product"}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {shareMessage && (
              <div className="p-3 bg-green-500/10 border border-green-500 text-green-600 rounded-lg text-center">
                {shareMessage}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
