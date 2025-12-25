"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getAdminAuth } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  user_id: string | null
  guest_name?: string | null
  guest_email?: string | null
  guest_phone?: string | null
  guest_address?: string | null
  guest_state?: string | null
  guest_notes?: string | null
  status: string
  total_price: number
  created_at: string
  order_items: OrderItem[]
}

const ORDER_STATUSES = ["Pending", "Confirmed", "Preparing", "Shipped", "Delivered"]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "Confirmed":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "Preparing":
      return "bg-purple-100 text-purple-800 border-purple-300"
    case "Shipped":
      return "bg-cyan-100 text-cyan-800 border-cyan-300"
    case "Delivered":
      return "bg-green-100 text-green-800 border-green-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAdminAuth()
    if (!auth) {
      router.push("/admin/auth")
      return
    }

    fetchOrderDetail()
  }, [router, orderId])

  const fetchOrderDetail = async () => {
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

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (updateError) throw updateError

      setOrder({
        ...order,
        status: newStatus,
      })
    } catch (err) {
      setError("Failed to update order status")
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin/orders">
              <Button variant="outline" className="border-border bg-transparent">
                Back to Orders
              </Button>
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-destructive">Order not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Order Details</h1>
            <p className="text-sm text-muted-foreground font-mono">{order.id}</p>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" className="border-border bg-transparent">
              Back to Orders
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">{error}</div>
        )}

        {/* Order Info Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-foreground">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {order.user_id ? "Customer ID" : "Customer Type"}
                </p>
                <p className="font-mono text-foreground">
                  {order.user_id ? `${order.user_id.slice(0, 8)}...` : "Guest Order"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="text-foreground">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-lg font-bold text-primary">{order.total_price.toFixed(2)} DA</p>
              </div>
            </div>

            {/* Guest Customer Information */}
            {!order.user_id && order.guest_name && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-3">Customer Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-foreground">{order.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground">{order.guest_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="text-foreground">{order.guest_state}</p>
                  </div>
                  {order.guest_address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground">{order.guest_address}</p>
                    </div>
                  )}
                  {order.guest_notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-foreground">{order.guest_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Order Status</p>
              <Select value={order.status} onValueChange={handleStatusChange}>
                <SelectTrigger className={`w-full sm:w-48 border-2 ${getStatusColor(order.status)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {order.order_items.length === 0 ? (
              <p className="text-muted-foreground">No items in this order</p>
            ) : (
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Product ID: {item.product_id.slice(0, 8)}...</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.size && <span className="mr-4">Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="font-semibold text-foreground">{(item.price * item.quantity).toFixed(2)} DA</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-lg font-semibold text-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">{order.total_price.toFixed(2)} DA</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
