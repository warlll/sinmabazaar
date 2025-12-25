"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/customer/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, MapPin, Calendar, DollarSign, Loader2 } from "lucide-react"
import type { Language } from "@/lib/i18n"
import { t } from "@/lib/i18n"

interface OrderItem {
  id: string
  quantity: number
  price: number
  size?: string
  color?: string
  products: {
    id: string
    name: string
    category: string
  }
}

interface Order {
  id: string
  status: string
  total_price: number
  created_at: string
  guest_name?: string | null
  guest_phone?: string | null
  guest_address?: string | null
  guest_state?: string | null
  guest_notes?: string | null
  order_items: OrderItem[]
}

export default function TrackOrderPage() {
  const [language, setLanguage] = useState<Language>("ar")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const isRTL = language === "ar"

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    setError("")

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          total_price,
          created_at,
          guest_name,
          guest_phone,
          guest_address,
          guest_state,
          guest_notes,
          order_items (
            id,
            quantity,
            price,
            size,
            color,
            products (
              id,
              name,
              category
            )
          )
        `,
        )
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error(language === "ar" ? "حدث خطأ في تحميل الطلبات" : "Error loading orders")
      }

      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : language === "ar" ? "حدث خطأ" : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      Pending: {
        ar: "قيد الانتظار",
        en: "Pending",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      Confirmed: {
        ar: "مؤكد",
        en: "Confirmed",
        color: "bg-blue-100 text-blue-800 border-blue-300",
      },
      Preparing: {
        ar: "قيد التحضير",
        en: "Preparing",
        color: "bg-purple-100 text-purple-800 border-purple-300",
      },
      Shipped: {
        ar: "تم الشحن",
        en: "Shipped",
        color: "bg-cyan-100 text-cyan-800 border-cyan-300",
      },
      Delivered: {
        ar: "تم التسليم",
        en: "Delivered",
        color: "bg-green-100 text-green-800 border-green-300",
      },
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.Pending
  }

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-4xl mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Page Header */}
        <div className="text-center mb-8">
          <Package className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === "ar" ? "جميع الطلبات" : "All Orders"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" ? "تابع حالة جميع الطلبات" : "Track all orders status"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
            </CardContent>
          </Card>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    {language === "ar" ? "لا توجد طلبات حالياً" : "No orders yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    {language === "ar"
                      ? `المجموع: ${orders.length} ${orders.length === 1 ? "طلب" : orders.length === 2 ? "طلبان" : "طلبات"}`
                      : `Total: ${orders.length} order${orders.length > 1 ? "s" : ""}`}
                  </h2>
                </div>

                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  return (
                    <Card key={order.id} className="border-border">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">
                              {language === "ar" ? "طلب رقم" : "Order"} #{order.id.slice(0, 8)}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.created_at).toLocaleDateString(language === "ar" ? "ar-DZ" : "en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <Badge className={`${statusInfo.color} border-2 px-4 py-1`}>
                            {statusInfo[language]}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Customer Info */}
                        {order.guest_name && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                              <Package className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">
                                  {language === "ar" ? "الاسم" : "Name"}
                                </p>
                                <p className="text-foreground font-medium">{order.guest_name}</p>
                              </div>
                            </div>

                            {order.guest_state && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1">
                                    {language === "ar" ? "الولاية" : "State"}
                                  </p>
                                  <p className="text-foreground font-medium">{order.guest_state}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <Separator />

                        {/* Order Items */}
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-3">
                            {language === "ar" ? "المنتجات" : "Products"}
                          </p>
                          <div className="space-y-2">
                            {order.order_items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-foreground text-sm">{item.products.name}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    {item.size && (
                                      <span>
                                        {language === "ar" ? "المقاس:" : "Size:"} {item.size}
                                      </span>
                                    )}
                                    {item.color && (
                                      <span>
                                        {language === "ar" ? "اللون:" : "Color:"} {item.color}
                                      </span>
                                    )}
                                    <span>
                                      {language === "ar" ? "الكمية:" : "Qty:"} {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <p className="font-semibold text-primary">
                                  {(item.price * item.quantity).toFixed(2)} {language === "ar" ? "د.ج" : "DA"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Total */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="w-5 h-5" />
                            <span className="font-semibold">{language === "ar" ? "المجموع:" : "Total:"}</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            {order.total_price.toFixed(2)} {language === "ar" ? "د.ج" : "DA"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
