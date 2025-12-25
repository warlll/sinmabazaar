"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Language } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/customer/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
}

interface CheckoutForm {
  firstName: string
  lastName: string
  phone: string
  address: string
  state: string
  notes: string
}

const algerian_states = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Bichar",
  "Blida",
  "Bouïra",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Belabbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naama",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
]

export default function CheckoutPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    state: "",
    notes: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) setLanguage(savedLang)

    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(savedCart)
  }, [])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.state) {
        throw new Error(language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields")
      }

      if (cart.length === 0) {
        throw new Error(language === "ar" ? "السلة فارغة" : "Your cart is empty")
      }

      const supabase = createClient()
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

      console.log("Creating order with data:", {
        guest_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        state: formData.state,
      })

      // Create order as guest (no user_id)
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: null, // Guest order
            guest_name: `${formData.firstName} ${formData.lastName}`,
            guest_email: formData.phone, // Using phone as identifier
            guest_phone: formData.phone,
            guest_address: formData.address,
            guest_state: formData.state,
            guest_notes: formData.notes,
            status: "Pending",
            total_price: total,
          },
        ])
        .select()
        .single()

      if (orderError) {
        console.error("Order creation error:", orderError)
        throw orderError
      }

      console.log("Order created successfully:", orderData.id)

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        color: item.color || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Order items error:", itemsError)
        throw itemsError
      }

      console.log("Order items created successfully")

      // Clear cart and redirect to confirmation
      localStorage.removeItem("cart")
      router.push(`/order-confirmation/${orderData.id}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : language === "ar" ? "فشل إنشاء الطلب" : "Failed to create order"
      setError(message)
      console.error("Checkout error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isRTL = language === "ar"

  if (!mounted) return null

  if (cart.length === 0) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
        <Header language={language} onLanguageChange={setLanguage} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </main>
      </div>
    )
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{language === "ar" ? "إتمام الشراء" : "Checkout"}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>{language === "ar" ? "بيانات التوصيل" : "Delivery Information"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{language === "ar" ? "الاسم" : "First Name"}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="mt-1 bg-input border-border"
                        placeholder={language === "ar" ? "أحمد" : "Ahmed"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{language === "ar" ? "اللقب" : "Last Name"}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="mt-1 bg-input border-border"
                        placeholder={language === "ar" ? "محمد" : "Mohammed"}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="mt-1 bg-input border-border"
                      placeholder={language === "ar" ? "0123456789" : "+213 123 456 789"}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address">{language === "ar" ? "العنوان" : "Address"}</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="mt-1 bg-input border-border"
                      placeholder={language === "ar" ? "العنوان الكامل" : "Full address"}
                    />
                  </div>

                  {/* State Selection */}
                  <div>
                    <Label htmlFor="state">{language === "ar" ? "الولاية" : "State/Province"}</Label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                    >
                      <option value="">{language === "ar" ? "اختر الولاية" : "Select a state"}</option>
                      {algerian_states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">{language === "ar" ? "ملاحظات" : "Special Notes"}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1 bg-input border-border"
                      placeholder={language === "ar" ? "أي ملاحظات خاصة؟" : "Any special requests?"}
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading
                      ? language === "ar"
                        ? "جاري المعالجة..."
                        : "Processing..."
                      : language === "ar"
                        ? "تأكيد الطلب"
                        : "Confirm Order"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle>{language === "ar" ? "ملخص الطلب" : "Order Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 pb-4 border-b border-border max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} DA</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-semibold text-lg">
                  <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                  <span className="text-primary">{total.toFixed(2)} DA</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
