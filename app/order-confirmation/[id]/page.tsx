"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Language } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/customer/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  size?: string
  color?: string
}

interface OrderDetail {
  id: string
  status: string
  total_price: number
  created_at: string
  order_items: OrderItem[]
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.id as string

  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)

    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const supabase = createClient()

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (orderError) throw orderError

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)

      if (itemsError) throw itemsError

      setOrder({
        ...orderData,
        order_items: itemsData || [],
      })
    } catch (err) {
      setError("Failed to load order details")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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

  if (error || !order) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
        <Header language={language} onLanguageChange={setLanguage} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-border text-center py-12">
            <CardContent>
              <p className="text-destructive">{error || (language === "ar" ? "الطلب غير موجود" : "Order not found")}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === "ar" ? "تم تأكيد الطلب" : "Order Confirmed"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === "ar" ? "شكراً لك على طلبك" : "Thank you for your order"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>{language === "ar" ? "معلومات الطلب" : "Order Information"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "رقم الطلب" : "Order Number"}</p>
                    <p className="font-mono font-semibold text-foreground">{order.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "التاريخ" : "Date"}</p>
                    <p className="font-semibold text-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "الحالة" : "Status"}</p>
                    <p className="font-semibold text-primary">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "الإجمالي" : "Total"}</p>
                    <p className="font-semibold text-foreground">{order.total_price.toFixed(2)} DA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>{language === "ar" ? "المنتجات المطلوبة" : "Ordered Items"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {language === "ar" ? "المنتج" : "Product"} #{item.product_id.slice(0, 8)}
                      </p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "المقاس" : "Size"}: {item.size}
                        </p>
                      )}
                      {item.color && (
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "اللون" : "Color"}: {item.color}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                      <p className="font-semibold text-foreground">{(item.price * item.quantity).toFixed(2)} DA</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-border bg-primary/5">
              <CardHeader>
                <CardTitle>{language === "ar" ? "الخطوات التالية" : "What's Next"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {language === "ar"
                    ? "سيتم معالجة طلبك قريباً. سيتم إرسال بريد تأكيد إلى عنوانك الإلكتروني."
                    : "Your order will be processed shortly. A confirmation email will be sent to you."}
                </p>
                <p>
                  {language === "ar"
                    ? "يمكنك تتبع حالة طلبك من خلال حسابك في المتجر."
                    : "You can track your order status from your account in the store."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <div>
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle>{language === "ar" ? "ملخص الطلب" : "Order Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{language === "ar" ? "الإجمالي" : "Subtotal"}</span>
                    <span>{order.total_price.toFixed(2)} DA</span>
                  </div>
                </div>

                <div className="flex justify-between font-semibold text-lg">
                  <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                  <span className="text-primary">{order.total_price.toFixed(2)} DA</span>
                </div>

                <Link href="/products" className="w-full block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
