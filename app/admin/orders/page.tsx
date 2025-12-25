"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminAuth } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Eye } from "lucide-react"

interface Order {
  id: string
  user_id: string
  status: string
  total_price: number
  created_at: string
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

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const auth = getAdminAuth()
    if (!auth) {
      router.push("/admin/auth")
      return
    }

    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setOrders(data || [])
    } catch (err) {
      setError("Failed to load orders")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (updateError) throw updateError

      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    } catch (err) {
      setError("Failed to update order status")
      console.error(err)
    }
  }

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Order Management</h1>
            <p className="text-sm text-muted-foreground">View and update order status</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="border-border bg-transparent">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="text-sm font-medium text-foreground">Filter by Status:</div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <Card className="border-border text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground font-mono">{order.id.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {order.total_price.toFixed(2)} DA
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Select
                            value={order.status}
                            onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                          >
                            <SelectTrigger className={`w-32 border-2 ${getStatusColor(order.status)}`}>
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
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="outline" className="border-border bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
